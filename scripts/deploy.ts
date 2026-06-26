import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  console.log("Starting deployment of AgentChain Marketplace Smart Contracts...");

  // 1. Deploy Reputation Contract
  console.log("Deploying Reputation...");
  const Reputation = await ethers.getContractFactory("Reputation");
  const reputation = await Reputation.deploy();
  await reputation.waitForDeployment();
  const reputationAddress = await reputation.getAddress();
  console.log(`Reputation deployed to: ${reputationAddress}`);

  // 2. Deploy AgentNFT Contract
  console.log("Deploying AgentNFT...");
  const AgentNFT = await ethers.getContractFactory("AgentNFT");
  const agentNFT = await AgentNFT.deploy();
  await agentNFT.waitForDeployment();
  const agentNFTAddress = await agentNFT.getAddress();
  console.log(`AgentNFT deployed to: ${agentNFTAddress}`);

  // 3. Deploy AgentRegistry Contract (links to NFT and Reputation)
  console.log("Deploying AgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const registry = await AgentRegistry.deploy(agentNFTAddress, reputationAddress);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`AgentRegistry deployed to: ${registryAddress}`);

  // 4. Deploy ExecutionLog Contract
  console.log("Deploying ExecutionLog...");
  const ExecutionLog = await ethers.getContractFactory("ExecutionLog");
  const executionLog = await ExecutionLog.deploy();
  await executionLog.waitForDeployment();
  const executionLogAddress = await executionLog.getAddress();
  console.log(`ExecutionLog deployed to: ${executionLogAddress}`);

  // 5. Deploy Escrow Contract (links to Registry, Reputation, and ExecutionLog)
  console.log("Deploying Escrow...");
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(registryAddress);
  await escrow.waitForDeployment();
  const escrowAddress = await escrow.getAddress();
  console.log(`Escrow deployed to: ${escrowAddress}`);

  // 6. Link contracts & authorize callers
  console.log("Setting registry address in AgentNFT...");
  const nftLinkTx = await agentNFT.setRegistry(registryAddress);
  await nftLinkTx.wait();
  console.log("Registry linked in AgentNFT successfully.");

  console.log("Authorizing Escrow in Reputation contract...");
  const repAuthTx = await reputation.setAuthorizedCaller(escrowAddress, true);
  await repAuthTx.wait();
  console.log("Escrow authorized in Reputation successfully.");

  console.log("Authorizing Escrow in ExecutionLog contract...");
  const logAuthTx = await executionLog.setAuthorizedCaller(escrowAddress, true);
  await logAuthTx.wait();
  console.log("Escrow authorized in ExecutionLog successfully.");

  // 7. Register default agents in AgentRegistry so they exist and are active on-chain
  console.log("\nRegistering default agents in AgentRegistry...");
  const agentsToRegister = [
    { name: "Research Agent", category: "Research", price: "0.02" },
    { name: "News Agent", category: "Data", price: "0.015" },
    { name: "Analytics Agent", category: "Analytics", price: "0.025" },
    { name: "Verification Agent", category: "Utility", price: "0.018" },
    { name: "Report Agent", category: "Content", price: "0.015" },
    { name: "Code Review Agent", category: "Development", price: "0.022" }
  ];

  for (const agent of agentsToRegister) {
    console.log(`Registering ${agent.name}...`);
    const tx = await registry.registerAgent(
      agent.name,
      agent.category,
      `https://agentchain.ai/metadata/${agent.name.toLowerCase().replace(/\s+/g, '-')}`,
      ethers.parseEther(agent.price)
    );
    await tx.wait();
  }
  console.log("Default agents registered successfully!");

  console.log("\n--- Deployment Complete ---");
  console.log({
    Reputation: reputationAddress,
    AgentNFT: agentNFTAddress,
    AgentRegistry: registryAddress,
    ExecutionLog: executionLogAddress,
    Escrow: escrowAddress
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
