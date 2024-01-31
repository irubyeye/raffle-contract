import { MyGovernor, MyToken, TimeLock, Raffle } from "../typechain-types";
import { deployments, ethers } from "hardhat";
import { assert, expect } from "chai";
import {
  FUNC,
  PROPOSAL_DESCRIPTION,
  NEW_STORE_VALUE,
  VOTING_DELAY,
  VOTING_PERIOD,
  MIN_DELAY,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";
import { moveTime } from "../utils/move-time";

describe("Governor Flow", async () => {
  let governor: MyGovernor;
  let governanceToken: MyToken;
  let timeLock: TimeLock;
  let raffle: Raffle;

  let governorAddress: string,
    timeLockAddress: string,
    governanceTokenAddress: string,
    raffleAddress: string;

  const voteWay = 1; // for
  const reason = "I lika do da cha cha";

  beforeEach(async () => {
    await deployments.fixture(["all"]);

    governorAddress = (await deployments.get("MyGovernor")).address;
    timeLockAddress = (await deployments.get("TimeLock")).address;
    governanceTokenAddress = (await deployments.get("MyToken")).address;
    raffleAddress = (await deployments.get("Raffle")).address;

    governor = await ethers.getContractAt("MyGovernor", governorAddress);
    timeLock = await ethers.getContractAt("TimeLock", timeLockAddress);
    governanceToken = await ethers.getContractAt(
      "MyToken",
      governanceTokenAddress
    );
    raffle = await ethers.getContractAt("Raffle", raffleAddress);
  });

  it("can only be changed through governance", async () => {
    await expect(
      raffle.manageTokenAndOracle(ethers.ZeroAddress, ethers.ZeroAddress, true)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("proposes, votes, waits, queues, and then executes", async () => {
    // propose
    const functionCallManageTokenAndOracle =
      raffle.interface.encodeFunctionData("manageTokenAndOracle", [
        "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
        "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
        true,
      ]);

    const proposeTx = await governor.propose(
      [raffleAddress],
      [0],
      [functionCallManageTokenAndOracle],
      "Voting #1: Add Synthetix Network Token"
    );

    const proposeReceipt = await proposeTx.wait(1);

    const proposalId = proposeReceipt?.logs![0].args!.proposalId;

    let proposalState = await governor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);

    await moveBlocks(VOTING_DELAY + 1);
    // vote
    const voteTx = await governor.castVoteWithReason(
      proposalId,
      voteWay,
      reason
    );
    await voteTx.wait(1);
    proposalState = await governor.state(proposalId);
    assert.equal(proposalState.toString(), "1");
    console.log(`Current Proposal State: ${proposalState}`);
    await moveBlocks(VOTING_PERIOD + 1);

    // queue & execute
    // const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION))
    const descriptionHash = ethers.id(PROPOSAL_DESCRIPTION);
    const queueTx = await governor.queue(
      [raffleAddress],
      [0],
      [functionCallManageTokenAndOracle],
      descriptionHash
    );
    await queueTx.wait(1);
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);

    proposalState = await governor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);

    console.log("Executing...");
    console.log;
    const exTx = await governor.execute(
      [raffleAddress],
      [0],
      [functionCallManageTokenAndOracle],
      descriptionHash
    );
    await exTx.wait(1);

    const sthxCurrency = await raffle.getCurrencyExt(
      "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F"
    );

    console.log(sthxCurrency, "Current sthx price to usd");
  });
});
