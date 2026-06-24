// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ExecutionLog is Ownable {
    struct LogEntry {
        uint256 id;
        uint256 callerAgentId;
        uint256 calleeAgentId;
        uint256 timestamp;
        bytes32 taskHash;
        string status;
        uint256 gasUsed;
        uint256 executionCost;
    }

    uint256 private nextLogId = 1;
    mapping(uint256 => LogEntry) private logs;
    
    // Mapping from agentId to list of execution log IDs they participated in (as caller or callee)
    mapping(uint256 => uint256[]) private agentLogIds;

    mapping(address => bool) public authorizedCallers;

    event ExecutionLogged(
        uint256 indexed logId,
        uint256 indexed callerAgentId,
        uint256 indexed calleeAgentId,
        bytes32 taskHash,
        string status,
        uint256 gasUsed,
        uint256 executionCost
    );

    event CallerAuthorizationChanged(address indexed caller, bool authorized);

    modifier onlyAuthorized() {
        require(msg.sender == owner() || authorizedCallers[msg.sender], "Not authorized to log executions");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit CallerAuthorizationChanged(caller, authorized);
    }

    function logExecution(
        uint256 callerAgentId,
        uint256 calleeAgentId,
        bytes32 taskHash,
        string calldata status,
        uint256 gasUsed,
        uint256 executionCost
    ) external onlyAuthorized returns (uint256) {
        uint256 logId = nextLogId;
        nextLogId++;

        logs[logId] = LogEntry({
            id: logId,
            callerAgentId: callerAgentId,
            calleeAgentId: calleeAgentId,
            timestamp: block.timestamp,
            taskHash: taskHash,
            status: status,
            gasUsed: gasUsed,
            executionCost: executionCost
        });

        agentLogIds[callerAgentId].push(logId);
        if (callerAgentId != calleeAgentId) {
            agentLogIds[calleeAgentId].push(logId);
        }

        emit ExecutionLogged(logId, callerAgentId, calleeAgentId, taskHash, status, gasUsed, executionCost);
        return logId;
    }

    function getExecution(uint256 logId) external view returns (LogEntry memory) {
        require(logs[logId].id != 0, "Log does not exist");
        return logs[logId];
    }

    function getAgentExecutions(uint256 agentId) external view returns (LogEntry[] memory) {
        uint256[] memory logIds = agentLogIds[agentId];
        uint256 total = logIds.length;
        LogEntry[] memory list = new LogEntry[](total);
        for (uint256 i = 0; i < total; i++) {
            list[i] = logs[logIds[i]];
        }
        return list;
    }
}
