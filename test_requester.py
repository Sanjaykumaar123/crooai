import asyncio
import os
import sys
import json
from dotenv import load_dotenv

# Ensure the root directory is in the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    import croo
except ImportError:
    print("Error: 'croo-sdk' is not installed. Run 'pip install croo-sdk'.")
    sys.exit(1)

load_dotenv()

# Read configurations
CROO_API_URL = os.getenv("CROO_API_URL") or "https://api.croo.network"
CROO_WS_URL = os.getenv("CROO_WS_URL") or "wss://api.croo.network/ws"
# Requester key can be read from environment or custom var
REQUESTER_KEY = os.getenv("REQUESTER_SDK_KEY")
TARGET_SERVICE_ID = os.getenv("CROO_TARGET_SERVICE_ID")

async def main():
    if not REQUESTER_KEY or REQUESTER_KEY == "croo_sk_requester_key_placeholder":
        print("Error: REQUESTER_SDK_KEY not configured or set to placeholder in .env file.")
        print("Please register a second agent as a requester and set: REQUESTER_SDK_KEY=croo_sk_...")
        return
        
    if not TARGET_SERVICE_ID or TARGET_SERVICE_ID == "service_id_placeholder":
        print("Error: CROO_TARGET_SERVICE_ID not configured or set to placeholder in .env file.")
        print("Please add your provider's service ID: CROO_TARGET_SERVICE_ID=<service-id-from-dashboard>")
        return

    print("Initializing Requester Client...")
    config = croo.Config(base_url=CROO_API_URL, ws_url=CROO_WS_URL)
    client = croo.AgentClient(config, REQUESTER_KEY)

    query = "Compare OpenAI and Anthropic models"
    print(f"Creating order negotiation for query: '{query}'")
    
    try:
        # 1. Negotiate Order
        negotiate_req = croo.NegotiateOrderRequest(
            service_id=TARGET_SERVICE_ID,
            requirements=json.dumps({"query": query}),
            fund_amount="100000",
            fund_token="0x036cbd53842c5426634e7929541ec2318f3dcf7e"
        )
        negotiation = await client.negotiate_order(negotiate_req)
        negotiation_id = negotiation.negotiation_id
        print(f"Negotiation created successfully. ID: {negotiation_id}")
        print("Waiting for Provider to accept negotiation (polling status)...")
        
        # Poll negotiation until accepted
        order_id = None
        for i in range(30):
            neg_status = await client.get_negotiation(negotiation_id)
            print(f"[{i+1}] Negotiation Status: {neg_status.status}")
            if neg_status.status == croo.NegotiationStatus.ACCEPTED:
                # If accepted, look for orders
                orders = await client.list_orders()
                for o in orders:
                    if o.negotiation_id == negotiation_id:
                        order_id = o.order_id
                        break
                if order_id:
                    break
            elif neg_status.status == croo.NegotiationStatus.REJECTED:
                print(f"Negotiation rejected: {neg_status.reject_reason}")
                return
            await asyncio.sleep(2)
            
        if not order_id:
            print("Timeout waiting for provider to accept negotiation, or order not found.")
            return

        print(f"Order created successfully. ID: {order_id}")
        
        # 2. Pay Order
        print(f"Paying order {order_id} (locking USDC escrow)...")
        pay_result = await client.pay_order(order_id)
        print(f"Payment successful! Tx Hash: {pay_result.tx_hash}")
        print("Waiting for Provider to deliver deliverables (polling status)...")
        
        # Poll order status until completed/delivered
        for i in range(60):
            order = await client.get_order(order_id)
            print(f"[{i+1}] Order Status: {order.status}")
            if order.status == croo.OrderStatus.COMPLETED:
                break
            elif order.status in [croo.OrderStatus.REJECTED, croo.OrderStatus.DELIVER_FAILED]:
                print(f"Order failed or rejected: {order.status} - {order.reject_reason}")
                return
            await asyncio.sleep(3)
            
        # 3. Get Delivery
        print("Order completed! Fetching delivery content...")
        delivery = await client.get_delivery(order_id)
        print("\n=================== Deliverable Text ===================")
        print(delivery.deliverable_text)
        print("========================================================\n")
        
    except Exception as e:
        print(f"Error during requester flow: {e}")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(main())
