import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

describe("AgentRegistry Contract Suite", function () {
  let nft: any;
  let reputation: any;
  let registry: any;
  let owner: any;
  let creator: any;

  beforeEach(async function () {
    [owner, creator] = await ethers.getSigners();

    const Reputation = await ethers.getContractFactory("Reputation");
    reputation = await Reputation.deploy();

    const AgentNFT = await ethers.getContractFactory("AgentNFT");
    nft = await AgentNFT.deploy();

    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    registry = await AgentRegistry.deploy(await nft.getAddress(), await reputation.getAddress());

    await nft.setRegistry(await registry.getAddress());
  });

  it("Should register an AI Agent and mint an NFT to owner", async function () {
    const name = "Research Agent";
    const category = "Research";
    const uri = "ipfs://QmAgentMetadata";
    const price = ethers.parseEther("0.05");

    await expect(registry.connect(creator).registerAgent(name, category, uri, price))
      .to.emit(registry, "AgentRegistered")
      .withArgs(1, name, creator.address, price);

    const agent = await registry.getAgent(1);
    expect(agent.name).to.equal(name);
    expect(agent.category).to.equal(category);
    expect(agent.metadataURI).to.equal(uri);
    expect(agent.pricePerCall).to.equal(price);
    expect(agent.owner).to.equal(creator.address);
    expect(agent.active).to.be.true;

    // Check NFT minted
    expect(await nft.ownerOf(1)).to.equal(creator.address);
    expect(await nft.tokenURI(1)).to.equal(uri);
  });

  it("Should allow updating agent configurations", async function () {
    await registry.connect(creator).registerAgent("A1", "Research", "uri1", ethers.parseEther("0.05"));

    const newPrice = ethers.parseEther("0.1");
    await expect(registry.connect(creator).updateAgent(1, "A1 Updated", "Analytics", "uri2", newPrice, true))
      .to.emit(registry, "AgentUpdated")
      .withArgs(1, "A1 Updated", newPrice, true);

    const agent = await registry.getAgent(1);
    expect(agent.name).to.equal("A1 Updated");
    expect(agent.category).to.equal("Analytics");
    expect(agent.metadataURI).to.equal("uri2");
    expect(agent.pricePerCall).to.equal(newPrice);
  });

  it("Should prevent non-owners from updating agent configurations", async function () {
    await registry.connect(creator).registerAgent("A1", "Research", "uri1", ethers.parseEther("0.05"));
    const [, , attacker] = await ethers.getSigners();

    await expect(
      registry.connect(attacker).updateAgent(1, "Hack", "Utility", "uri", 0, true)
    ).to.be.revertedWith("Not the agent owner or contract admin");
  });

  it("Should support deactivating agents", async function () {
    await registry.connect(creator).registerAgent("A1", "Research", "uri1", ethers.parseEther("0.05"));
    
    await expect(registry.connect(creator).deactivateAgent(1))
      .to.emit(registry, "AgentDeactivated")
      .withArgs(1);

    const agent = await registry.getAgent(1);
    expect(agent.active).to.be.false;
  });
});
