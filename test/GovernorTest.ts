// import { MyToken } from "./../typechain-types/contracts/RaffleToken.sol/MyToken";
// import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
// import { expect, use } from "chai";
// import { ethers, network } from "hardhat";
// import {
//   MyGovernor,
//   MyGovernor__factory,
//   MyToken__factory,
//   Raffle,
//   Raffle__factory,
//   RandomNumberConsumerV2,
//   RandomNumberConsumerV2__factory,
//   TimeLock,
//   TimeLock__factory,
// } from "../typechain-types";

// describe("Governance", () => {
//   let owner: HardhatEthersSigner,
//     user1: HardhatEthersSigner,
//     user2: HardhatEthersSigner,
//     user3: HardhatEthersSigner,
//     user4: HardhatEthersSigner,
//     user5: HardhatEthersSigner;

//   let raffleContract: Raffle;
//   let raffleContractAddress: string;

//   let randomNumberConsumer: RandomNumberConsumerV2;
//   let randomNumberConsumerAddress: string;

//   let raffleToken: MyToken;
//   let raffleTokenAddress: string;

//   let governance: MyGovernor;
//   let governanceAddress: string;

//   let timeLock: TimeLock;
//   let timeLockAddress: string;

//   beforeEach(async () => {
//     [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

//     const RaffleTokenFactory: MyToken__factory =
//       await ethers.getContractFactory("MyToken");
//     raffleToken = await RaffleTokenFactory.deploy();
//     raffleTokenAddress = await raffleToken.getAddress();

//     const TimeLockFactory: TimeLock__factory = await ethers.getContractFactory(
//       "TimeLock"
//     );
//     timeLock = await TimeLockFactory.deploy();
//     timeLockAddress = await timeLock.getAddress();

//     const GovernorFactory: MyGovernor__factory =
//       await ethers.getContractFactory("MyGovernor");
//     governance = await GovernorFactory.deploy();
//     governanceAddress = await governance.getAddress();

//     const RandomNumberConsumerFactory: RandomNumberConsumerV2__factory =
//       await ethers.getContractFactory("RandomNumberConsumerV2");
//     randomNumberConsumer = await RandomNumberConsumerFactory.deploy(
//       8801,
//       "0x8103b0a8a00be2ddc778e6e7eaa21791cd364625",
//       "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
//     );
//     randomNumberConsumerAddress = await randomNumberConsumer.getAddress();

//     const RaffleFactory: Raffle__factory = await ethers.getContractFactory(
//       "Raffle"
//     );
//     raffleContract = await RaffleFactory.deploy(
//       randomNumberConsumerAddress,
//       "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//       "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
//     );
//     raffleContractAddress = await raffleContract.getAddress();
//   });
// });
