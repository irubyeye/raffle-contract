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
import BigNumber from "bignumber.js";
BigNumber.set({ DECIMAL_PLACES: 8 });

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

  const initSupply: bigint = BigInt(1 * 10 ** 18);

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

    await raffleContract.manageTokensList(testErc20Address, true);
    await raffleContract.manageTokensList(tetherTokenAddress, true);
    await raffleContract.manageTokensList(uniswapTokenAddress, true);
    await raffleContract.manageTokensList(chainlinkTokenAddress, true);
    await raffleContract.manageTokensList(bnbTokenAddress, false);

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
    it.skip("Should pass all deposit scenarios and calculate range", async () => {
      const range = await raffleContract.calculateRange(1, 1000);

      console.log(range);
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
    it.skip("Should get a liquidity of current pair with proper parsing", async () => {
      const amounts: number[] = [1500, 1, 2000];

      const bigNumber: bigint = BigInt(amounts[1]) * BigInt(10) ** BigInt(18);

      const liquidityArr = await raffleContract.getLiquidity(
        wethToken,
        uniswapToken,
        bigNumber
      );

      const number = new BigNumber(liquidityArr[1].toString());

      const number1 = new BigNumber(1000000000000000000);

      const properView = number.div(new BigNumber(10).pow(18));

      console.log(properView.toNumber());
    });
    it.skip("Should create a new liquidity pair between eth and test erc20", async () => {
      await wethToken.connect(wetherHolder).transfer(owner, 100000);

      await testErc20.connect(owner).approve(raffleContractAddress, initSupply);

      await wethToken.connect(owner).approve(raffleContractAddress, 100000);

      await raffleContract.addLiquidity(
        wethTokenAddress,
        testErc20Address,
        10000,
        initSupply,
        0,
        0,
        owner.address,
        Math.floor(Date.now() / 1000) + 600
      );

      console.log(
        await raffleContract.getLiquidity(
          testErc20,
          wethTokenAddress,
          9 * 10 ** 14
        )
      );
    });
    it("Should proper work due to raffle-logic pipeline", async () => {
      const amounts: number[] = [10, 15, 20, 10];

      const bigNumber: bigint = BigInt(10) ** BigInt(18);

      await uniswapToken
        .connect(uniswapHolder)
        .transfer(owner.address, BigInt(amounts[0]) * bigNumber);

      await uniswapToken
        .connect(owner)
        .approve(raffleContract, BigInt(amounts[0]) * bigNumber);

      await uniswapToken
        .connect(uniswapHolder)
        .approve(raffleContract, BigInt(amounts[1]) * bigNumber);

      await chainlinkToken
        .connect(chainlinkHolder)
        .approve(raffleContract, BigInt(amounts[2]) * bigNumber);

      await raffleContract
        .connect(owner)
        .playRaffle(uniswapTokenAddress, BigInt(amounts[0]) * bigNumber);

      await raffleContract
        .connect(uniswapHolder)
        .playRaffle(uniswapTokenAddress, BigInt(amounts[1]) * bigNumber);

      await raffleContract
        .connect(chainlinkHolder)
        .playRaffle(chainlinkToken, BigInt(amounts[2]) * bigNumber);

      await raffleContract.endRaffle();

      const winnerAddress = await getProbableWinner(raffleContract, 1);

      const isWinner: boolean = await raffleContract.verifyAndTransfer(
        1,
        winnerAddress
      );

      const rafflePotInWeth: bigint = await raffleContract.rafflePotInWeth(1);

      const number = new BigNumber(rafflePotInWeth.toString());

      const properView = number.div(new BigNumber(10).pow(18));

      console.log(properView.toNumber());

      expect(await wethToken.balanceOf(winnerAddress)).to.be.gt(0);
    });
  });
});
