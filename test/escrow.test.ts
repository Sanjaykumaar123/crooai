import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

describe("Escrow Contract Suite", function () {
  let nft: any;
  let reputation: any;
  let registry: any;
  let executionLog: any;
  let escrow: any;
  
  let owner: any;
  let creator: any;
  let client: any;

  beforeEach(async function () {
    [owner, creator, client] = await ethers.getSigners();

    const Reputation = await ethers.getContractFactory("Reputation");
    reputation = await Reputation.deploy();

    const AgentNFT = await ethers.getContractFactory("AgentNFT");
    nft = await AgentNFT.deploy();

    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    registry = await AgentRegistry.deploy(await nft.getAddress(), await reputation.getAddress());
    await nft.setRegistry(await registry.getAddress());

    const ExecutionLog = await ethers.getContractFactory("ExecutionLog");
    executionLog = await ExecutionLog.deploy();

    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      await registry.getAddress(),
      await reputation.getAddress(),
      await executionLog.getAddress()
    );

    // Grant Escrow authority to modify Reputation & ExecutionLogs
    await reputation.setAuthorizedCaller(await escrow.getAddress(), true);
    await executionLog.setAuthorizedCaller(await escrow.getAddress(), true);

    // Register test agent
    await registry.connect(creator).registerAgent(
      "SubAgent",
      "Utility",
      "ipfs://metadata",
      ethers.parseEther("0.1")
    );
  });

  it("Should lock client funds upon creating an escrow", async function () {
    const fee = ethers.parseEther("0.1");
    const taskHash = ethers.id("task-hash");

    await expect(
      escrow.connect(client).createEscrow(1, 0, taskHash, { value: fee })
    ).to.emit(escrow, "EscrowCreated")
     .withArgs(1, 1, client.address, fee);

    const record = await escrow.getEscrow(1);
    expect(record.client).to.equal(client.address);
    expect(record.amount).to.equal(fee);
    expect(record.status).to.equal(0); // EscrowStatus.Locked
  });

  it("Should release locked escrow funds to creator and update reputation and logs", async function () {
    const fee = ethers.parseEther("0.1");
    const taskHash = ethers.id("task-hash");

    await escrow.connect(client).createEscrow(1, 0, taskHash, { value: fee });

    const initialCreatorBalance = await ethers.provider.getBalance(creator.address);

    // Release funds
    await expect(escrow.connect(client).releaseFunds(1))
      .to.emit(escrow, "EscrowReleased")
      .withArgs(1, creator.address, fee);

    const finalCreatorBalance = await ethers.provider.getBalance(creator.address);
    expect(finalCreatorBalance - initialCreatorBalance).to.equal(fee);

    // Check status
    const record = await escrow.getEscrow(1);
    expect(record.status).to.equal(1); // EscrowStatus.Released

    // Check reputation increase
    const [completed, failed, trustScore] = await reputation.getScore(1);
    expect(completed).to.equal(1);
    expect(failed).to.equal(0);
    expect(trustScore).to.equal(100);

    // Check execution logs logged
    const logs = await executionLog.getAgentExecutions(1);
    expect(logs.length).to.equal(1);
    expect(logs[0].status).to.equal("completed");
  });

  it("Should refund client funds and log failure on refund call", async function () {
    const fee = ethers.parseEther("0.1");
    const taskHash = ethers.id("task-hash");

    await escrow.connect(client).createEscrow(1, 0, taskHash, { value: fee });

    const initialClientBalance = await ethers.provider.getBalance(client.address);

    // Refund funds (sent by creator)
    const refundTx = await escrow.connect(creator).refundFunds(1);
    await refundTx.wait();

    // Balance verification: Client gets exactly the fee back
    const finalClientBalance = await ethers.provider.getBalance(client.address);
    expect(finalClientBalance - initialClientBalance).to.equal(fee);

    // Check reputation decrement
    const [completed, failed, trustScore] = await reputation.getScore(1);
    expect(completed).to.equal(0);
    expect(failed).to.equal(1);
    expect(trustScore).to.equal(0);

    // Check logs
    const logs = await executionLog.getAgentExecutions(1);
    expect(logs.length).to.equal(1);
    expect(logs[0].status).to.equal("failed");
  });
});
