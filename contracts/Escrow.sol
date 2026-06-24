// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AgentRegistry.sol";
import "./Reputation.sol";
import "./ExecutionLog.sol";

contract Escrow is Ownable, ReentrancyGuard {
    enum EscrowStatus { Locked, Released, Refunded }

    struct EscrowRecord {
        uint256 id;
        uint256 agentId; // Callee Agent
        uint256 callerId; // Caller Agent (or 0 if user)
        address client;
        uint256 amount;
        EscrowStatus status;
        bytes32 taskHash;
    }

    AgentRegistry public registry;
    Reputation public reputation;
    ExecutionLog public executionLog;

    uint256 private nextEscrowId = 1;
    mapping(uint256 => EscrowRecord) private escrows;

    event EscrowCreated(uint256 indexed escrowId, uint256 indexed agentId, address indexed client, uint256 amount);
    event EscrowReleased(uint256 indexed escrowId, address indexed receiver, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, address indexed receiver, uint256 amount);

    constructor(
        address _registryAddress,
        address _reputationAddress,
        address _executionLogAddress
    ) Ownable(msg.sender) {
        require(_registryAddress != address(0), "Invalid registry address");
        require(_reputationAddress != address(0), "Invalid reputation address");
        require(_executionLogAddress != address(0), "Invalid execution log address");
        
        registry = AgentRegistry(_registryAddress);
        reputation = Reputation(_reputationAddress);
        executionLog = ExecutionLog(_executionLogAddress);
    }

    function createEscrow(
        uint256 agentId,
        uint256 callerId,
        bytes32 taskHash
    ) external payable returns (uint256) {
        AgentRegistry.Agent memory agent = registry.getAgent(agentId);
        require(agent.active, "Agent is not active");
        require(msg.value >= agent.pricePerCall, "Insufficient payment lock value");

        uint256 escrowId = nextEscrowId;
        nextEscrowId++;

        escrows[escrowId] = EscrowRecord({
            id: escrowId,
            agentId: agentId,
            callerId: callerId,
            client: msg.sender,
            amount: msg.value,
            status: EscrowStatus.Locked,
            taskHash: taskHash
        });

        emit EscrowCreated(escrowId, agentId, msg.sender, msg.value);
        return escrowId;
    }

    function releaseFunds(uint256 escrowId) external nonReentrant {
        uint256 startGas = gasleft();
        EscrowRecord storage esc = escrows[escrowId];
        require(esc.id != 0, "Escrow contract not found");
        require(esc.status == EscrowStatus.Locked, "Funds already released or refunded");
        
        AgentRegistry.Agent memory agent = registry.getAgent(esc.agentId);
        // Only owner, client, or authorized oracles/nodes can release
        require(
            msg.sender == owner() || 
            msg.sender == esc.client || 
            msg.sender == agent.owner, 
            "Not authorized to release funds"
        );

        esc.status = EscrowStatus.Released;

        // Trigger Reputation and ExecutionLog updates
        reputation.increaseReputation(esc.agentId);

        uint256 gasUsed = startGas - gasleft() + 21000;
        uint256 executionCost = tx.gasprice > 0 ? tx.gasprice * gasUsed : 5 gwei * gasUsed; // Default to 5 gwei in test environment
        executionLog.logExecution(esc.callerId, esc.agentId, esc.taskHash, "completed", gasUsed, executionCost);

        // Send payment to callee agent owner
        (bool success, ) = payable(agent.owner).call{value: esc.amount}("");
        require(success, "Payment release failed");

        emit EscrowReleased(escrowId, agent.owner, esc.amount);
    }

    function refundFunds(uint256 escrowId) external nonReentrant {
        uint256 startGas = gasleft();
        EscrowRecord storage esc = escrows[escrowId];
        require(esc.id != 0, "Escrow contract not found");
        require(esc.status == EscrowStatus.Locked, "Funds already released or refunded");

        AgentRegistry.Agent memory agent = registry.getAgent(esc.agentId);
        // Only contract owner, client, or callee agent owner can request refund
        require(
            msg.sender == owner() || 
            msg.sender == esc.client || 
            msg.sender == agent.owner, 
            "Not authorized to refund"
        );

        esc.status = EscrowStatus.Refunded;

        // Trigger Reputation and ExecutionLog updates
        reputation.decreaseReputation(esc.agentId);

        uint256 gasUsed = startGas - gasleft() + 21000;
        uint256 executionCost = tx.gasprice > 0 ? tx.gasprice * gasUsed : 5 gwei * gasUsed;
        executionLog.logExecution(esc.callerId, esc.agentId, esc.taskHash, "failed", gasUsed, executionCost);

        // Send payment back to client
        (bool success, ) = payable(esc.client).call{value: esc.amount}("");
        require(success, "Refund payout failed");

        emit EscrowRefunded(escrowId, esc.client, esc.amount);
    }

    function getEscrow(uint256 escrowId) external view returns (EscrowRecord memory) {
        require(escrows[escrowId].id != 0, "Escrow does not exist");
        return escrows[escrowId];
    }
}
