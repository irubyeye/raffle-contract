import { MyToken } from "./../typechain-types/contracts/RaffleToken.sol/MyToken";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect, use } from "chai";
import { ethers, network } from "hardhat";
import {
  MyGovernor,
  MyGovernor__factory,
  MyToken__factory,
  Raffle,
  Raffle__factory,
  VRFv2Consumer,
  VRFv2Consumer__factory,
  TimeLock,
  TimeLock__factory,
} from "../typechain-types";

describe.skip("Governance", () => {
  let owner: HardhatEthersSigner,
    user1: HardhatEthersSigner,
    user2: HardhatEthersSigner,
    user3: HardhatEthersSigner,
    user4: HardhatEthersSigner,
    user5: HardhatEthersSigner;

  let raffleContract: Raffle;
  let raffleContractAddress: string;

  let randomNumberConsumer: VRFv2Consumer;
  let randomNumberConsumerAddress: string;

  let raffleToken: MyToken;
  let raffleTokenAddress: string;

  let governance: MyGovernor;
  let governanceAddress: string;

  let timeLock: TimeLock;
  let timeLockAddress: string;

  beforeEach(async () => {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const RaffleTokenFactory: MyToken__factory =
      await ethers.getContractFactory("MyToken");
    raffleToken = await RaffleTokenFactory.deploy();
    raffleTokenAddress = await raffleToken.getAddress();

    const TimeLockFactory: TimeLock__factory = await ethers.getContractFactory(
      "TimeLock"
    );
    timeLock = await TimeLockFactory.deploy(3600, [], [], owner.address);
    timeLockAddress = await timeLock.getAddress();

    const GovernorFactory: MyGovernor__factory =
      await ethers.getContractFactory("MyGovernor");
    governance = await GovernorFactory.deploy(
      raffleTokenAddress,
      timeLockAddress,
      4,
      5,
      1
    );
    governanceAddress = await governance.getAddress();

    const RandomNumberConsumerFactory: VRFv2Consumer__factory =
      await ethers.getContractFactory("VRFv2Consumer");
    randomNumberConsumer = await RandomNumberConsumerFactory.deploy(8801);
    randomNumberConsumerAddress = await randomNumberConsumer.getAddress();

    const RaffleFactory: Raffle__factory = await ethers.getContractFactory(
      "Raffle"
    );
    raffleContract = await RaffleFactory.deploy(
      randomNumberConsumerAddress,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
      "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    );
    raffleContractAddress = await raffleContract.getAddress();

    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    //await timeLock.grantRole(proposerRole, governanceAddress);
    await timeLock.grantRole(executorRole, ethers.ZeroAddress);
    await timeLock.revokeRole(adminRole, owner);

    await raffleContract.transferOwnership(timeLockAddress);
  });

  describe("Deployment", () => {
    it("Should deploy contracts and set raffle owner to governance", async () => {
      expect(raffleContractAddress).to.not.equal(0);
      expect(governanceAddress).to.not.equal(undefined);
      expect(raffleTokenAddress).to.not.equal(0);
      expect(timeLockAddress).to.not.equal(0);

      const raffleOwner = await raffleContract.owner();
      expect(raffleOwner).to.equal(timeLockAddress);
    });
  });
  describe("Governance voting", () => {
    it("Should proper work due to governance logic", async () => {
      const functionCallManageTokenAndOracle =
        raffleContract.interface.encodeFunctionData("manageTokenAndOracle", [
          "0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F",
          "0xDC3EA94CD0AC27d9A86C180091e7f78C683d3699",
          true,
        ]);

      const proposeTx = await governance.propose(
        [raffleContractAddress],
        [0],
        [functionCallManageTokenAndOracle],
        "Voting #1: Add Synthetix Network Token"
      );

      console.log(owner.address);

      expect(proposeTx).to.emit(governance, "ProposalCreated").withArgs(0);
    });
  });
});
