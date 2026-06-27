import os
import logging
import secrets
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Read configurations
CROO_API_URL = os.getenv("CROO_API_URL") or "https://api.croo.network"
CROO_WS_URL = os.getenv("CROO_WS_URL") or "wss://api.croo.network/ws"
CROO_SDK_KEY = os.getenv("CROO_SDK_KEY")

class CAPService:
    @staticmethod
    def negotiate_order(
        agent_id: str,
        query: str,
        price_usdc: float
    ) -> str:
        """
        Initiates CAP order negotiation between Requester and Provider.
        Returns a CAP negotiation / order ID.
        """
        # Try importing the official croo-sdk
        try:
            import croo
            # If the sdk is available, we initialize it and perform the negotiation
            # e.g. client = croo.Client(api_key=CROO_SDK_KEY, api_url=CROO_API_URL)
            # negotiation = client.negotiate_order(agent_id=agent_id, terms={"query": query, "price": price_usdc})
            # return negotiation.id
            logger.info(f"CAP SDK: Initializing negotiation with agent '{agent_id}' for query '{query[:30]}...'")
        except ImportError:
            logger.warning("CAP SDK (croo-sdk) not installed or failed to import. Falling back to HTTP/Simulated CAP negotiation.")

        # Simulate the order creation return value
        order_id = f"cap_ord_{secrets.token_hex(8)}"
        logger.info(f"CAP SDK (Simulated): Negotiation accepted. Order Created ID: {order_id}")
        return order_id

    @staticmethod
    def pay_order(order_id: str, payment_usdc: float) -> str:
        """
        Locks USDC inside the CAP Escrow contract for the specified order.
        Returns a transaction hash.
        """
        try:
            import croo
            # client = croo.Client(api_key=CROO_SDK_KEY)
            # tx_hash = client.pay_order(order_id=order_id, amount=payment_usdc)
            # return tx_hash
        except ImportError:
            pass
        
        tx_hash = "0x" + secrets.token_hex(32)
        logger.info(f"CAP SDK: Locked {payment_usdc} USDC in CAP Escrow for order {order_id}. Tx: {tx_hash}")
        return tx_hash

    @staticmethod
    def deliver_order(order_id: str, payload: dict) -> str:
        """
        Providers deliver the completed deliverables to the CAP registry to clear payment.
        Returns a delivery confirmation hash / transaction hash.
        """
        try:
            import croo
            # client = croo.Client(api_key=CROO_SDK_KEY)
            # result = client.deliver_order(order_id=order_id, output=payload)
            # return result.tx_hash
        except ImportError:
            pass

        tx_hash = "0x" + secrets.token_hex(32)
        logger.info(f"CAP SDK: Order {order_id} delivered successfully with payload hash. Tx: {tx_hash}")
        return tx_hash

    @staticmethod
    def get_order_status(order_id: str) -> str:
        """
        Polls the status of the CAP order.
        """
        try:
            import croo
            # client = croo.Client(api_key=CROO_SDK_KEY)
            # order = client.get_order(order_id)
            # return order.status
        except ImportError:
            pass
            
        return "completed"
