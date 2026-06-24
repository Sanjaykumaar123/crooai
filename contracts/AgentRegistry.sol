// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AgentNFT.sol";
import "./Reputation.sol";

contract AgentRegistry is Ownable {
    struct Agent {
        uint256 id;
        string name;
        string category;
        string metadataURI;
        address owner;
        uint256 pricePerCall;
        uint256 reputation;
        bool active;
    }

    AgentNFT public agentNFT;
    Reputation public reputationContract;

    uint256 private nextAgentId = 1;
    
    // Mapping from agent ID to Agent details
    mapping(uint256 => Agent) private agents;
    // Array of all registered agent IDs
    uint256[] private agentIds;

    event AgentRegistered(uint256 indexed id, string name, address indexed owner, uint256 pricePerCall);
    event AgentUpdated(uint256 indexed id, string name, uint256 pricePerCall, bool active);
    event AgentDeactivated(uint256 indexed id);

    constructor(address _nftAddress, address _reputationAddress) Ownable(msg.sender) {
        require(_nftAddress != address(0), "Invalid NFT address");
        require(_reputationAddress != address(0), "Invalid Reputation address");
        agentNFT = AgentNFT(_nftAddress);
        reputationContract = Reputation(_reputationAddress);
    }

    function registerAgent(
        string calldata name,
        string calldata category,
        string calldata metadataURI,
        uint256 pricePerCall
    ) external returns (uint256) {
        uint256 newId = nextAgentId;
        nextAgentId++;

        agents[newId] = Agent({
            id: newId,
            name: name,
            category: category,
            metadataURI: metadataURI,
            owner: msg.sender,
            pricePerCall: pricePerCall,
            reputation: 100, // Starting default reputation
            active: true
        });

        agentIds.push(newId);

        // Mint NFT to creator representing agent registration
        agentNFT.mint(msg.sender, newId, metadataURI);

        emit AgentRegistered(newId, name, msg.sender, pricePerCall);
        return newId;
    }

    function updateAgent(
        uint256 id,
        string calldata name,
        string calldata category,
        string calldata metadataURI,
        uint256 pricePerCall,
        bool active
    ) external {
        Agent storage agent = agents[id];
        require(agent.id != 0, "Agent does not exist");
        require(agent.owner == msg.sender || msg.sender == owner(), "Not the agent owner or contract admin");

        agent.name = name;
        agent.category = category;
        agent.metadataURI = metadataURI;
        agent.pricePerCall = pricePerCall;
        agent.active = active;

        emit AgentUpdated(id, name, pricePerCall, active);
    }

    function deactivateAgent(uint256 id) external {
        Agent storage agent = agents[id];
        require(agent.id != 0, "Agent does not exist");
        require(agent.owner == msg.sender || msg.sender == owner(), "Not authorized");
        
        agent.active = false;
        emit AgentDeactivated(id);
    }

    function getAgent(uint256 id) external view returns (Agent memory) {
        Agent memory agent = agents[id];
        require(agent.id != 0, "Agent does not exist");

        // Query the live reputation score dynamically
        (,, uint256 trustScore) = reputationContract.getScore(id);
        agent.reputation = trustScore;

        return agent;
    }

    function getAllAgents() external view returns (Agent[] memory) {
        uint256 total = agentIds.length;
        Agent[] memory list = new Agent[](total);
        for (uint256 i = 0; i < total; i++) {
            uint256 id = agentIds[i];
            list[i] = agents[id];
            (,, uint256 trustScore) = reputationContract.getScore(id);
            list[i].reputation = trustScore;
        }
        return list;
    }
}
