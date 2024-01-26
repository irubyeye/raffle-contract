import { RandomNumberConsumerV2__factory } from "./../typechain-types/factories/contracts/RandomNumberConsumerV2__factory";
import { BNB__factory } from "./../typechain-types/factories/contracts/BNBTest.sol/BNB__factory";
import { Uni__factory } from "./../typechain-types/factories/contracts/UniswapTest.sol/Uni__factory";
import { expect, use } from "chai";
import { ethers, network } from "hardhat";

import { setBalance } from "@nomicfoundation/hardhat-network-helpers";

import getProbableWinner from "../helpers/ProbableWinner";

import { HardhatEthersSigner } from "../node_modules/@nomicfoundation/hardhat-ethers/signers.js";
import {
  BNB,
  LinkToken,
  LinkToken__factory,
  Raffle__factory,
  RandomNumberConsumerV2,
  TestErc20,
  TestErc20__factory,
  TetherToken,
  TetherToken__factory,
  Uni,
  WETH9,
  WETH9__factory,
} from "../typechain-types/index.js";

import { Raffle } from "./../typechain-types/contracts/Raffle";
import exp from "constants";

describe("Advanced voting system", async () => {
  let owner: HardhatEthersSigner,
    user1: HardhatEthersSigner,
    user2: HardhatEthersSigner,
    user3: HardhatEthersSigner,
    user4: HardhatEthersSigner,
    user5: HardhatEthersSigner,
    usdtHolder: HardhatEthersSigner,
    uniswapHolder: HardhatEthersSigner,
    chainlinkHolder: HardhatEthersSigner,
    bnbHolder: HardhatEthersSigner,
    wetherHolder: HardhatEthersSigner;

  let randomNumberConsumer: RandomNumberConsumerV2;
  let randomNumberConsumerAddress: string;

  let raffleContract: Raffle;
  let raffleContractAddress: string;

  let testErc20: TestErc20;
  let testErc20Address: string;

  let tetherToken: TetherToken;
  const tetherTokenAddress: string =
    "0xdAC17F958D2ee523a2206206994597C13D831ec7";

  let uniswapToken: Uni;
  const uniswapTokenAddress: string =
    "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

  let chainlinkToken: LinkToken;
  const chainlinkTokenAddress: string =
    "0x514910771AF9Ca656af840dff83E8264EcF986CA";

  let bnbToken: BNB;
  const bnbTokenAddress: string = "0xB8c77482e45F1F44dE1745F52C74426C631bDD52";

  let wethToken: WETH9;
  const wethTokenAddress: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";

  const tetherOracle: string = "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D";
  const uniswapOracle: string = "0x553303d460EE0afB37EdFf9bE42922D8FF63220e";
  const chainlinkOracle: string = "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c";
  const bnbOracle: string = "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A";

  const initSupply: number = 100000000000;

  beforeEach(async () => {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    usdtHolder = await ethers.getImpersonatedSigner(
      "0xaf64555ddd61fcf7d094824dd9b4ebea165afc5b"
    );
    uniswapHolder = await ethers.getImpersonatedSigner(
      "0x47173b170c64d16393a52e6c480b3ad8c302ba1e"
    );
    chainlinkHolder = await ethers.getImpersonatedSigner(
      "0x0757e27ac1631beeb37eed3270cc6301dd3d57d4"
    );
    bnbHolder = await ethers.getImpersonatedSigner(
      "0x000000000000000000000000000000000000dead"
    );
    wetherHolder = await ethers.getImpersonatedSigner(
      "0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E"
    );

    await setBalance(usdtHolder.address, 100n ** 18n);
    await setBalance(uniswapHolder.address, 100n ** 18n);
    await setBalance(chainlinkHolder.address, 100n ** 18n);
    await setBalance(bnbHolder.address, 100n ** 18n);
    await setBalance(wetherHolder.address, 100n ** 18n);

    const RandomNumberConsumerFactory: RandomNumberConsumerV2__factory =
      await ethers.getContractFactory("RandomNumberConsumerV2");
    randomNumberConsumer = await RandomNumberConsumerFactory.deploy(
      8801,
      "0x8103b0a8a00be2ddc778e6e7eaa21791cd364625",
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
    );
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

    const TestErc20Factory: TestErc20__factory =
      await ethers.getContractFactory("TestErc20");
    testErc20 = await TestErc20Factory.deploy(initSupply);
    testErc20Address = await testErc20.getAddress();

    const TetherTokenFactory: TetherToken__factory =
      await ethers.getContractFactory("TetherToken");
    tetherToken = await TetherTokenFactory.attach(tetherTokenAddress);

    const UniswapTokenFactory: Uni__factory = await ethers.getContractFactory(
      "Uni"
    );
    uniswapToken = await UniswapTokenFactory.attach(uniswapTokenAddress);

    const ChainlinkTokenFactory: LinkToken__factory =
      await ethers.getContractFactory("LinkToken");
    chainlinkToken = await ChainlinkTokenFactory.attach(chainlinkTokenAddress);

    const BNBTokenFactory: BNB__factory = await ethers.getContractFactory(
      "BNB"
    );
    bnbToken = await BNBTokenFactory.attach(bnbTokenAddress);

    const wethTokenFactory: WETH9__factory = await ethers.getContractFactory(
      "WETH9"
    );
    wethToken = await wethTokenFactory.attach(wethTokenAddress);

    await raffleContract.manageTokensList(testErc20Address, false);
    await raffleContract.manageTokensList(tetherTokenAddress, true);
    await raffleContract.manageTokensList(uniswapTokenAddress, true);
    await raffleContract.manageTokensList(chainlinkTokenAddress, true);
    await raffleContract.manageTokensList(bnbTokenAddress, true);

    await raffleContract.manageCurrencyOracle(tetherTokenAddress, tetherOracle);
    await raffleContract.manageCurrencyOracle(
      uniswapTokenAddress,
      uniswapOracle
    );
    await raffleContract.manageCurrencyOracle(
      chainlinkTokenAddress,
      chainlinkOracle
    );
    await raffleContract.manageCurrencyOracle(bnbTokenAddress, bnbOracle);
  });

  describe.skip("Deployment", () => {
    it("Should deploy contracts", async () => {
      expect(randomNumberConsumerAddress).to.not.equal(0);
      expect(raffleContractAddress).to.not.equal(0);
      expect(testErc20Address).to.not.equal(0);
      expect(tetherTokenAddress).to.not.equal(0);
      expect(uniswapTokenAddress).to.not.equal(0);
      expect(chainlinkTokenAddress).to.not.equal(0);
      expect(bnbTokenAddress).to.not.equal(0);

      expect(await bnbToken.balanceOf(owner.address)).to.equal(initSupply);
      expect(await chainlinkToken.balanceOf(owner.address)).to.not.equal(0);
      expect(await uniswapToken.balanceOf(owner.address)).to.not.equal(0);
      expect(await tetherToken.balanceOf(owner.address)).to.not.equal(0);
      expect(await testErc20.balanceOf(owner.address)).to.not.equal(0);
    });
  });

  describe("Oracle receiving data", () => {
    xit("Should proper get on-chain price", async () => {
      const result = await raffleContract.getCurrencyExt(uniswapTokenAddress);
      console.log(result, " Price of token");

      expect(result).to.not.equal(0);
      expect(result).to.gt(0);
    });
    xit("Should retrieve correct oracle for token / usd", async () => {
      expect(
        await raffleContract.getTokenOracle(chainlinkTokenAddress)
      ).to.equal(chainlinkOracle);
      expect(await raffleContract.getTokenOracle(bnbTokenAddress)).to.equal(
        bnbOracle
      );
    });
  });

  describe("Raffle logic", () => {
    it.skip("Should proper derive", async () => {
      await raffleContract.getRandomNumber();

      const result1 = await raffleContract.calculateRange(119, 238);

      console.log(await raffleContract.getWinnerNumber(), "Winner number");

      console.log(result1, "Range");

      expect(result1).to.equal(BigInt(499999999999999999));
    });
    it.skip("Should deposit proper amount of allowed tokens on raffle contract", async () => {
      await chainlinkToken
        .connect(chainlinkHolder)
        .approve(raffleContractAddress, 100000);

      await raffleContract
        .connect(chainlinkHolder)
        .playRaffle(chainlinkTokenAddress, 100000);

      expect(await chainlinkToken.balanceOf(raffleContractAddress)).to.equal(
        100000
      );
    });
    it.skip("Should proper set usd balance of user due to exchange", async () => {
      await uniswapToken.approve(raffleContract, 1);

      await raffleContract.playRaffle(uniswapTokenAddress, 1);

      const result = await raffleContract.getBalanceInUsd(owner.address, 1);

      console.log(result);
    });
    it.skip("Should return random number", async () => {
      const result = await raffleContract.getRandomNumber();

      console.log(result, "RANDOM!!!");
    });
    it.skip("Should get a liquidity of current pair", async () => {
      const amounts: number[] = [1500, 1, 2000];

      console.log(
        await raffleContract.getLiquidity(tetherTokenAddress, amounts[1])
      );
    });
    it("Should proper work due to raffle-logic pipeline", async () => {
      const amounts: number[] = [1500, 1000, 2000, 10];

      await uniswapToken
        .connect(uniswapHolder)
        .transfer(owner.address, amounts[0]);

      await uniswapToken.connect(owner).approve(raffleContract, amounts[0]);

      await uniswapToken
        .connect(uniswapHolder)
        .approve(raffleContract, amounts[1]);

      await chainlinkToken
        .connect(chainlinkHolder)
        .approve(raffleContract, amounts[2]);

      await raffleContract
        .connect(owner)
        .playRaffle(uniswapTokenAddress, amounts[0]);

      await raffleContract
        .connect(uniswapHolder)
        .playRaffle(uniswapTokenAddress, amounts[1]);

      await raffleContract
        .connect(chainlinkHolder)
        .playRaffle(chainlinkToken, amounts[2]);

      await raffleContract.endRaffle();

      const winnerAddress = await getProbableWinner(raffleContract, 1);

      const isWinner: boolean = await raffleContract.verifyAndTransfer(
        1,
        winnerAddress
      );

      expect(await wethToken.balanceOf(winnerAddress)).to.be.gt(0);
    });
  });
});
