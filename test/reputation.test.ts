import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

describe("Reputation Contract Suite", function () {
  let reputation: any;
  let owner: any;
  let authorized: any;
  let unauthorized: any;

  beforeEach(async function () {
    [owner, authorized, unauthorized] = await ethers.getSigners();
    const Reputation = await ethers.getContractFactory("Reputation");
    reputation = await Reputation.deploy();

    await reputation.setAuthorizedCaller(authorized.address, true);
  });

  it("Should default score to 100 for newly registered agents", async function () {
    const [completed, failed, trustScore] = await reputation.getScore(1);
    expect(completed).to.equal(0);
    expect(failed).to.equal(0);
    expect(trustScore).to.equal(100);
  });

  it("Should increase reputation score when completed tasks are logged", async function () {
    await reputation.connect(authorized).increaseReputation(1);
    const [completed, failed, trustScore] = await reputation.getScore(1);
    expect(completed).to.equal(1);
    expect(failed).to.equal(0);
    expect(trustScore).to.equal(100);
  });

  it("Should calculate accurate ratios under combined task loads", async function () {
    // 3 successes, 1 failure = 75%
    await reputation.connect(authorized).increaseReputation(1);
    await reputation.connect(authorized).increaseReputation(1);
    await reputation.connect(authorized).increaseReputation(1);
    await reputation.connect(authorized).decreaseReputation(1);

    const [completed, failed, trustScore] = await reputation.getScore(1);
    expect(completed).to.equal(3);
    expect(failed).to.equal(1);
    expect(trustScore).to.equal(75);
  });

  it("Should deny reputation updates from unauthorized accounts", async function () {
    await expect(
      reputation.connect(unauthorized).increaseReputation(1)
    ).to.be.revertedWith("Not authorized to update reputation");
  });
});
