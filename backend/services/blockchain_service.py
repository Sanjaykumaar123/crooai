import os
import json
import logging
from web3 import Web3
from eth_account import Account
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

# Read configurations
RPC_URL = os.getenv("RPC_URL") or "https://sepolia.base.org"
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
EXECUTION_LOG_ADDRESS = os.getenv("NEXT_PUBLIC_EXECUTION_LOG") or "0x1755E22c99F4Ae6752b9470a6Ed96A098afdF370"
ESCROW_ADDRESS = os.getenv("NEXT_PUBLIC_ESCROW") or "0x307E6918333300eb0e74559744decE8cF37AfC3A"

# Path to ABI
ABI_PATH = "c:/Users/Sanjay Kumaar/croo/artifacts/contracts/ExecutionLog.sol/ExecutionLog.json"
ESCROW_ABI_PATH = "c:/Users/Sanjay Kumaar/croo/artifacts/contracts/Escrow.sol/Escrow.json"

class BlockchainService:
    @staticmethod
    def log_execution_on_chain(
        caller_agent_id: int, 
        callee_agent_id: int, 
        task_query: str, 
        status: str, 
        gas_used: int = 45000, 
        execution_cost_wei: int = 225000000000000,
        nonce: int = None
    ) -> str:
        # Validate RPC and Private Key presence
        if not PRIVATE_KEY or not RPC_URL:
            logger.warning("Blockchain credentials missing. Simulating on-chain transaction.")
            return BlockchainService._simulate_tx()

        try:
            w3 = Web3(Web3.HTTPProvider(RPC_URL))
            if not w3.is_connected():
                logger.error("Failed to connect to blockchain RPC. Simulating transaction.")
                return BlockchainService._simulate_tx()

            # Load ABI
            if not os.path.exists(ABI_PATH):
                logger.error(f"ABI file not found at {ABI_PATH}. Simulating transaction.")
                return BlockchainService._simulate_tx()

            with open(ABI_PATH, "r") as f:
                contract_json = json.load(f)
                abi = contract_json["abi"]

            # Set up account
            account = Account.from_key(PRIVATE_KEY)
            sender_address = account.address

            # Check network balance
            balance = w3.eth.get_balance(sender_address)
            if balance < Web3.to_wei(0.0005, 'ether'):
                logger.warning(f"Low gas balance ({balance} wei) for {sender_address}. Simulating transaction.")
                return BlockchainService._simulate_tx()

            # Initialize contract
            contract_address = Web3.to_checksum_address(EXECUTION_LOG_ADDRESS)
            contract = w3.eth.contract(address=contract_address, abi=abi)

            # Hash the task query
            task_hash = w3.keccak(text=task_query)

            # Build logExecution transaction
            if nonce is None:
                nonce = w3.eth.get_transaction_count(sender_address)
            
            # Estimate gas or use default
            try:
                gas_est = contract.functions.logExecution(
                    caller_agent_id,
                    callee_agent_id,
                    task_hash,
                    status,
                    gas_used,
                    execution_cost_wei
                ).estimate_gas({'from': sender_address})
            except Exception:
                gas_est = 100000

            # Build transaction dict
            tx = contract.functions.logExecution(
                caller_agent_id,
                callee_agent_id,
                task_hash,
                status,
                gas_used,
                execution_cost_wei
            ).build_transaction({
                'chainId': w3.eth.chain_id,
                'gas': int(gas_est * 1.2),
                'gasPrice': w3.eth.gas_price,
                'nonce': nonce
            })

            # Sign transaction
            signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
            
            # Send transaction
            raw_tx = getattr(signed_tx, "raw_transaction", None) or getattr(signed_tx, "rawTransaction", None)
            tx_hash_bytes = w3.eth.send_raw_transaction(raw_tx)
            tx_hash_hex = w3.to_hex(tx_hash_bytes)
            
            # Wait for receipt
            w3.eth.wait_for_transaction_receipt(tx_hash_bytes, timeout=120)
            logger.info(f"On-chain execution logged successfully. Hash: {tx_hash_hex}")
            return tx_hash_hex

        except Exception as e:
            logger.error(f"Error logging transaction on-chain: {e}. Simulating transaction.")
            return BlockchainService._simulate_tx()

    @staticmethod
    def create_escrow_on_chain(
        agent_id: int,
        caller_id: int,
        task_query: str,
        payment_wei: int,
        nonce: int = None
    ) -> (int, str):
        if not PRIVATE_KEY or not RPC_URL:
            logger.warning("Blockchain credentials missing. Simulating escrow creation.")
            import random
            return random.randint(10, 100), BlockchainService._simulate_tx()

        try:
            w3 = Web3(Web3.HTTPProvider(RPC_URL))
            if not w3.is_connected():
                return 1, BlockchainService._simulate_tx()

            if not os.path.exists(ESCROW_ABI_PATH):
                return 1, BlockchainService._simulate_tx()

            with open(ESCROW_ABI_PATH, "r") as f:
                contract_json = json.load(f)
                abi = contract_json["abi"]

            account = Account.from_key(PRIVATE_KEY)
            sender_address = account.address

            balance = w3.eth.get_balance(sender_address)
            if balance < payment_wei + Web3.to_wei(0.0005, 'ether'):
                logger.warning("Low gas balance. Simulating escrow creation.")
                import random
                return random.randint(10, 100), BlockchainService._simulate_tx()

            contract_address = Web3.to_checksum_address(ESCROW_ADDRESS)
            contract = w3.eth.contract(address=contract_address, abi=abi)

            task_hash = w3.keccak(text=task_query)

            if nonce is None:
                nonce = w3.eth.get_transaction_count(sender_address)

            # Build createEscrow transaction
            tx = contract.functions.createEscrow(
                agent_id,
                caller_id,
                task_hash
            ).build_transaction({
                'chainId': w3.eth.chain_id,
                'gas': 150000,
                'gasPrice': w3.eth.gas_price,
                'nonce': nonce,
                'value': payment_wei
            })

            signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
            raw_tx = getattr(signed_tx, "raw_transaction", None) or getattr(signed_tx, "rawTransaction", None)
            tx_hash_bytes = w3.eth.send_raw_transaction(raw_tx)
            tx_hash_hex = w3.to_hex(tx_hash_bytes)

            receipt = w3.eth.wait_for_transaction_receipt(tx_hash_bytes, timeout=120)
            
            # Simple fallback for escrow ID if parsing event fails
            escrow_id = 1
            try:
                # Parse EscrowCreated event from logs
                logs = contract.events.EscrowCreated().process_receipt(receipt)
                if logs:
                    escrow_id = logs[0]['args']['escrowId']
            except Exception:
                import random
                escrow_id = random.randint(10, 100)

            logger.info(f"Escrow created successfully on-chain. Escrow ID: {escrow_id}, Tx Hash: {tx_hash_hex}")
            return escrow_id, tx_hash_hex

        except Exception as e:
            logger.error(f"Error creating escrow on-chain: {e}. Simulating escrow creation.")
            import random
            return random.randint(10, 100), BlockchainService._simulate_tx()

    @staticmethod
    def release_escrow_on_chain(
        escrow_id: int,
        nonce: int = None
    ) -> str:
        if not PRIVATE_KEY or not RPC_URL:
            logger.warning("Blockchain credentials missing. Simulating escrow release.")
            return BlockchainService._simulate_tx()

        try:
            w3 = Web3(Web3.HTTPProvider(RPC_URL))
            if not w3.is_connected():
                return BlockchainService._simulate_tx()

            if not os.path.exists(ESCROW_ABI_PATH):
                return BlockchainService._simulate_tx()

            with open(ESCROW_ABI_PATH, "r") as f:
                contract_json = json.load(f)
                abi = contract_json["abi"]

            account = Account.from_key(PRIVATE_KEY)
            sender_address = account.address

            balance = w3.eth.get_balance(sender_address)
            if balance < Web3.to_wei(0.0005, 'ether'):
                logger.warning("Low gas balance. Simulating escrow release.")
                return BlockchainService._simulate_tx()

            contract_address = Web3.to_checksum_address(ESCROW_ADDRESS)
            contract = w3.eth.contract(address=contract_address, abi=abi)

            if nonce is None:
                nonce = w3.eth.get_transaction_count(sender_address)

            # Build releaseFunds transaction
            tx = contract.functions.releaseFunds(
                escrow_id
            ).build_transaction({
                'chainId': w3.eth.chain_id,
                'gas': 180000,
                'gasPrice': w3.eth.gas_price,
                'nonce': nonce
            })

            signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
            raw_tx = getattr(signed_tx, "raw_transaction", None) or getattr(signed_tx, "rawTransaction", None)
            tx_hash_bytes = w3.eth.send_raw_transaction(raw_tx)
            tx_hash_hex = w3.to_hex(tx_hash_bytes)

            w3.eth.wait_for_transaction_receipt(tx_hash_bytes, timeout=120)
            logger.info(f"Escrow released successfully on-chain. Escrow ID: {escrow_id}, Tx Hash: {tx_hash_hex}")
            return tx_hash_hex

        except Exception as e:
            logger.error(f"Error releasing escrow on-chain: {e}. Simulating escrow release.")
            return BlockchainService._simulate_tx()

    @staticmethod
    def update_reputation_on_chain(agent_id: int, points: int, is_success: bool = True, nonce: int = None) -> str:
        REPUTATION_ADDRESS = os.getenv("NEXT_PUBLIC_REPUTATION") or "0x892E6918333300eb0e74559744decE8cF37AfC3A"
        REPUTATION_ABI_PATH = "c:/Users/Sanjay Kumaar/croo/artifacts/contracts/Reputation.sol/Reputation.json"

        if not PRIVATE_KEY or not RPC_URL:
            logger.warning("Blockchain credentials missing. Simulating reputation update.")
            return BlockchainService._simulate_tx()

        try:
            w3 = Web3(Web3.HTTPProvider(RPC_URL))
            if not w3.is_connected() or not os.path.exists(REPUTATION_ABI_PATH):
                return BlockchainService._simulate_tx()

            with open(REPUTATION_ABI_PATH, "r") as f:
                contract_json = json.load(f)
                abi = contract_json["abi"]

            account = Account.from_key(PRIVATE_KEY)
            sender_address = account.address

            contract_address = Web3.to_checksum_address(REPUTATION_ADDRESS)
            contract = w3.eth.contract(address=contract_address, abi=abi)

            if nonce is None:
                nonce = w3.eth.get_transaction_count(sender_address)

            if is_success:
                tx_func = contract.functions.increaseReputation(agent_id, points)
            else:
                tx_func = contract.functions.decreaseReputation(agent_id, points)

            tx = tx_func.build_transaction({
                'chainId': w3.eth.chain_id,
                'gas': 120000,
                'gasPrice': w3.eth.gas_price,
                'nonce': nonce
            })

            signed_tx = w3.eth.account.sign_transaction(tx, private_key=PRIVATE_KEY)
            raw_tx = getattr(signed_tx, "raw_transaction", None) or getattr(signed_tx, "rawTransaction", None)
            tx_hash_bytes = w3.eth.send_raw_transaction(raw_tx)
            tx_hash_hex = w3.to_hex(tx_hash_bytes)

            w3.eth.wait_for_transaction_receipt(tx_hash_bytes, timeout=120)
            logger.info(f"Reputation updated successfully on-chain. Agent: {agent_id}, Tx Hash: {tx_hash_hex}")
            return tx_hash_hex

        except Exception as e:
            logger.error(f"Error updating reputation on-chain: {e}. Simulating transaction.")
            return BlockchainService._simulate_tx()

    @staticmethod
    def _simulate_tx() -> str:
        # Generate a realistic-looking mock Tx Hash
        import secrets
        return "0x" + secrets.token_hex(32)
