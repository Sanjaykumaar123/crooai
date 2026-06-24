// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Reputation is Ownable {
    struct Score {
        uint256 completedTasks;
        uint256 failedTasks;
        uint256 trustScore; // Scale of 0-100
    }

    // Mapping from agentId to reputation Score
    mapping(uint256 => Score) private agentScores;

    // Authorized addresses allowed to update reputation (e.g. Escrow, Registry)
    mapping(address => bool) public authorizedCallers;

    event ReputationUpdated(uint256 indexed agentId, uint256 completedTasks, uint256 failedTasks, uint256 trustScore);
    event CallerAuthorizationChanged(address indexed caller, bool authorized);

    modifier onlyAuthorized() {
        require(msg.sender == owner() || authorizedCallers[msg.sender], "Not authorized to update reputation");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function setAuthorizedCaller(address caller, bool authorized) external onlyOwner {
        authorizedCallers[caller] = authorized;
        emit CallerAuthorizationChanged(caller, authorized);
    }

    function increaseReputation(uint256 agentId) external onlyAuthorized {
        Score storage score = agentScores[agentId];
        score.completedTasks += 1;
        score.trustScore = _calculateScore(score.completedTasks, score.failedTasks);
        emit ReputationUpdated(agentId, score.completedTasks, score.failedTasks, score.trustScore);
    }

    function decreaseReputation(uint256 agentId) external onlyAuthorized {
        Score storage score = agentScores[agentId];
        score.failedTasks += 1;
        score.trustScore = _calculateScore(score.completedTasks, score.failedTasks);
        emit ReputationUpdated(agentId, score.completedTasks, score.failedTasks, score.trustScore);
    }

    function getScore(uint256 agentId) external view returns (uint256 completed, uint256 failed, uint256 trustScore) {
        Score memory score = agentScores[agentId];
        // If it's a new agent with 0 tasks, default trustScore to 100
        uint256 calculatedTrust = (score.completedTasks == 0 && score.failedTasks == 0) ? 100 : score.trustScore;
        return (score.completedTasks, score.failedTasks, calculatedTrust);
    }

    function _calculateScore(uint256 completed, uint256 failed) internal pure returns (uint256) {
        uint256 total = completed + failed;
        if (total == 0) return 100;
        return (completed * 100) / total;
    }
}
