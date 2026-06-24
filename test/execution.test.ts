import pkg from "hardhat";
const { ethers } = pkg;
import { expect } from "chai";

describe("ExecutionLog Contract Suite", function () {
  let executionLog: any;
  let owner: any;
  let authorized: any;
  let unauthorized: any;

  beforeEach(async function () {
    [owner, authorized, unauthorized] = await ethers.getSigners();
    const ExecutionLog = await ethers.getContractFactory("ExecutionLog");
    executionLog = await ExecutionLog.deploy();

    await executionLog.setAuthorizedCaller(authorized.address, true);
  });

  it("Should log execution details successfully", async function () {
    const callerAgentId = 1;
    const calleeAgentId = 2;
    const taskHash = ethers.id("task-data-hash");
    const status = "completed";
    const gasUsed = 50000;
    const executionCost = ethers.parseEther("0.00025");

    await expect(executionLog.connect(authorized).logExecution(callerAgentId, calleeAgentId, taskHash, status, gasUsed, executionCost))
      .to.emit(executionLog, "ExecutionLogged")
      .withArgs(1, callerAgentId, calleeAgentId, taskHash, status, gasUsed, executionCost);

    const log = await executionLog.getExecution(1);
    expect(log.callerAgentId).to.equal(callerAgentId);
    expect(log.calleeAgentId).to.equal(calleeAgentId);
    expect(log.taskHash).to.equal(taskHash);
    expect(log.status).to.equal(status);
    expect(log.gasUsed).to.equal(gasUsed);
    expect(log.executionCost).to.equal(executionCost);
  });

  it("Should return accurate records of executions participated in by agent", async function () {
    const task1 = ethers.id("t1");
    const task2 = ethers.id("t2");
    const gas = 45000;
    const cost = 225000n;

    // Log 1: Agent 1 calls Agent 2
    await executionLog.connect(authorized).logExecution(1, 2, task1, "completed", gas, cost);
    // Log 2: Agent 2 calls Agent 3
    await executionLog.connect(authorized).logExecution(2, 3, task2, "failed", gas, cost);

    // Agent 2 should be in both log records
    const agent2Logs = await executionLog.getAgentExecutions(2);
    expect(agent2Logs.length).to.equal(2);
    expect(agent2Logs[0].taskHash).to.equal(task1);
    expect(agent2Logs[1].taskHash).to.equal(task2);

    // Agent 1 should only have log 1
    const agent1Logs = await executionLog.getAgentExecutions(1);
    expect(agent1Logs.length).to.equal(1);
    expect(agent1Logs[0].taskHash).to.equal(task1);
  });

  it("Should prevent unauthorized users from recording executions", async function () {
    const task = ethers.id("t");
    await expect(
      executionLog.connect(unauthorized).logExecution(1, 2, task, "running", 30000, 150000n)
    ).to.be.revertedWith("Not authorized to log executions");
  });
});
