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

    function increaseReputation(uint256 agentId, uint256 points) external onlyAuthorized {
        Score storage score = agentScores[agentId];
        if (score.completedTasks == 0 && score.failedTasks == 0 && score.trustScore == 0) {
            score.trustScore = 100;
        }
        score.completedTasks += 1;
        score.trustScore = (score.trustScore + points > 100) ? 100 : score.trustScore + points;
        emit ReputationUpdated(agentId, score.completedTasks, score.failedTasks, score.trustScore);
    }

    function decreaseReputation(uint256 agentId, uint256 points) external onlyAuthorized {
        Score storage score = agentScores[agentId];
        if (score.completedTasks == 0 && score.failedTasks == 0 && score.trustScore == 0) {
            score.trustScore = 100;
        }
        score.failedTasks += 1;
        score.trustScore = (score.trustScore > points) ? score.trustScore - points : 0;
        emit ReputationUpdated(agentId, score.completedTasks, score.failedTasks, score.trustScore);
    }

    function getScore(uint256 agentId) external view returns (uint256 completed, uint256 failed, uint256 trustScore) {
        Score memory score = agentScores[agentId];
        uint256 calculatedTrust = (score.completedTasks == 0 && score.failedTasks == 0 && score.trustScore == 0) ? 100 : score.trustScore;
        return (score.completedTasks, score.failedTasks, calculatedTrust);
    }
}
