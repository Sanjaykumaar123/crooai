import asyncio
import os
import logging
import uuid
import sys
from dotenv import load_dotenv

# Ensure the root directory is in the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import croo
except ImportError:
    print("Error: 'croo-sdk' is not installed in the active environment. Please install it with 'pip install croo-sdk'.")
    sys.exit(1)

from backend.a2a.orchestrator import SwarmOrchestrator

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("croo_provider")

# Load environment variables
load_dotenv()

# Read configurations
CROO_API_URL = os.getenv("CROO_API_URL") or "https://api.croo.network"
CROO_WS_URL = os.getenv("CROO_WS_URL") or "wss://api.croo.network/ws"
# Fallback support for CROO_API_KEY
CROO_SDK_KEY = os.getenv("CROO_SDK_KEY") or os.getenv("CROO_API_KEY")
PROVIDER_FUND_ADDRESS = os.getenv("PROVIDER_FUND_ADDRESS")

if not CROO_SDK_KEY or CROO_SDK_KEY == "croo_sk_mock_key_for_testing":
    logger.warning("CROO_SDK_KEY or CROO_API_KEY is unset or set to mock. Make sure to update it in your .env file to go live.")

# Initialize configuration
config = croo.Config(
    base_url=CROO_API_URL,
    ws_url=CROO_WS_URL
)

# Initialize AgentClient
client = croo.AgentClient(config, CROO_SDK_KEY)

async def handle_negotiation(event: croo.Event):
    negotiation_id = event.negotiation_id
    logger.info(f"Received negotiation request: {negotiation_id}")
    try:
        # Fetch negotiation details to log requirements
        negotiation = await client.get_negotiation(negotiation_id)
        logger.info(f"Negotiation requirements: '{negotiation.requirements}'")
        
        # Check if the service requires fund transfer
        requires_fund = negotiation.fund_amount and negotiation.fund_amount != "0"
        
        if requires_fund:
            if not PROVIDER_FUND_ADDRESS:
                raise ValueError("Negotiation requires fund transfer, but PROVIDER_FUND_ADDRESS is not set in .env")
            logger.info(f"Accepting negotiation {negotiation_id} with fund address {PROVIDER_FUND_ADDRESS}...")
            await client.accept_negotiation_with_fund_address(negotiation_id, PROVIDER_FUND_ADDRESS)
        else:
            logger.info(f"Accepting negotiation {negotiation_id}...")
            await client.accept_negotiation(negotiation_id)
            
        logger.info(f"Negotiation {negotiation_id} successfully accepted.")
    except Exception as e:
        logger.error(f"Error handling negotiation {negotiation_id}: {e}")

async def run_swarm_task(order_id: str, query: str):
    logger.info(f"Starting Swarm execution for Order ID: {order_id} with query: '{query}'")
    try:
        # Trigger orchestrator swarm (using 'cap' protocol mode)
        res = SwarmOrchestrator.execute_swarm(
            query=query,
            wallet_address="0x0000000000000000000000000000000000000000",
            protocol_mode="cap"
        )
        exec_id = res["execution_id"]
        logger.info(f"Started orchestrator execution ID: {exec_id}. Polling for completion...")

        # Poll for completion
        while True:
            status_data = SwarmOrchestrator.get_status(exec_id)
            progress = status_data.get("progress", 0)
            current_agent = status_data.get("current_agent", "Unknown")
            logger.info(f"Execution {exec_id} progress: {progress}% (Current Agent: {current_agent})")
            if progress >= 100:
                break
            await asyncio.sleep(2)

        # Get final report
        report_data = SwarmOrchestrator.get_report(exec_id)
        report_status = report_data.get("status", "completed")
        report_output = report_data.get("report", "")

        if report_status == "completed" or (report_status == "running" and report_output):
            logger.info(f"Swarm complete. Delivering result for order {order_id}...")
            # Prepare deliverable payload
            delivery_req = croo.DeliverOrderRequest(
                deliverable_type=croo.DeliverableType.TEXT,
                deliverable_text=report_output
            )
            result = await client.deliver_order(order_id, delivery_req)
            logger.info(f"Deliver order successful! Tx Hash: {result.tx_hash}")
        else:
            reason = f"Swarm execution failed or returned empty report: {report_output[:100]}"
            logger.error(reason)
            await client.reject_order(order_id, reason)
    except Exception as e:
        logger.error(f"Error executing task for order {order_id}: {e}")
        try:
            await client.reject_order(order_id, f"Execution failed: {str(e)}")
        except Exception as reject_err:
            logger.error(f"Failed to reject order {order_id}: {reject_err}")

async def handle_order_paid(event: croo.Event):
    order_id = event.order_id
    logger.info(f"Received Order Paid event: {order_id}")
    try:
        order = await client.get_order(order_id)
        # Fetch the original negotiation to get the query/requirements
        negotiation = await client.get_negotiation(order.negotiation_id)
        reqs = negotiation.requirements
        query = "Run orchestration"
        if reqs:
            try:
                import json
                reqs_data = json.loads(reqs)
                if isinstance(reqs_data, dict):
                    query = reqs_data.get("query") or reqs_data.get("requirements") or reqs
                else:
                    query = str(reqs_data)
            except Exception:
                query = reqs
                
        # Run execution as a non-blocking background task
        asyncio.create_task(run_swarm_task(order_id, query))
    except Exception as e:
        logger.error(f"Error handling order paid {order_id}: {e}")

async def main():
    logger.info("Connecting to CROO Network WebSocket Event Stream...")
    try:
        stream = await client.connect_websocket()
        logger.info("WebSocket connected successfully! Listening for events...")
        
        # Hook up event handlers using asyncio.create_task to run asynchronous callbacks
        stream.on(
            croo.EventType.NEGOTIATION_CREATED,
            lambda event: asyncio.create_task(handle_negotiation(event))
        )
        stream.on(
            croo.EventType.ORDER_PAID,
            lambda event: asyncio.create_task(handle_order_paid(event))
        )
        
        # Keep the main loop running
        while True:
            await asyncio.sleep(1)
            err = stream.err()
            if err:
                logger.error(f"WebSocket event stream error: {err}. Reconnecting will be handled by SDK.")
                
    except Exception as e:
        logger.error(f"Provider failed to run: {e}")
    finally:
        await client.close()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Provider stopped by user.")
