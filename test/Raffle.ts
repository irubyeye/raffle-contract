import { BNB__factory } from "./../typechain-types/factories/contracts/BNBTest.sol/BNB__factory";
import { Uni__factory } from "./../typechain-types/factories/contracts/UniswapTest.sol/Uni__factory";
import { expect, use } from "chai";
import { ethers, network } from "hardhat";

import type { HardhatEthersSigner } from "../node_modules/@nomicfoundation/hardhat-ethers/signers.ts";
import {
  BNB,
  LinkToken,
  LinkToken__factory,
  Raffle__factory,
  TestErc20,
  TestErc20__factory,
  TetherToken,
  TetherToken__factory,
  Uni,
} from "../typechain-types/index.js";

import { Raffle } from "./../typechain-types/contracts/Raffle";
import exp from "constants";

describe("Advanced voting system", () => {
  let owner: HardhatEthersSigner,
    user1: HardhatEthersSigner,
    user2: HardhatEthersSigner,
    user3: HardhatEthersSigner,
    user4: HardhatEthersSigner,
    user5: HardhatEthersSigner;

  let raffleContract: Raffle;
  let raffleContractAddress: string;

  let testErc20: TestErc20;
  let testErc20Address: string;

  let tetherToken: TetherToken;
  let tetherTokenAddress: string;

  let uniswapToken: Uni;
  let uniswapTokenAddress: string;

  let chainlinkToken: LinkToken;
  let chainlinkTokenAddress: string;

  let bnbToken: BNB;
  let bnbTokenAddress: string;

  let tetherOracle: string = "0x3E7d1eAB13ad0104d2750B8863b489D65364e32D";
  let uniswapOracle: string = "0x553303d460EE0afB37EdFf9bE42922D8FF63220e";
  let chainlinkOracle: string = "0x2c1d072e956AFFC0D435Cb7AC38EF18d24d9127c";
  let bnbOracle: string = "0x14e613AC84a31f709eadbdF89C6CC390fDc9540A";

  const initSupply: number = 100000000000;

  beforeEach(async () => {
    [owner, user1, user2, user3, user4, user5] = await ethers.getSigners();

    const RaffleFactory: Raffle__factory = await ethers.getContractFactory(
      "Raffle"
    );
    raffleContract = await RaffleFactory.deploy();
    raffleContractAddress = await raffleContract.getAddress();

    const TestErc20Factory: TestErc20__factory =
      await ethers.getContractFactory("TestErc20");
    testErc20 = await TestErc20Factory.deploy(initSupply);
    testErc20Address = await testErc20.getAddress();

    const TetherTokenFactory: TetherToken__factory =
      await ethers.getContractFactory("TetherToken");
    tetherToken = await TetherTokenFactory.deploy(
      initSupply,
      "Tether USD",
      "USDT",
      10 * 10 ** 6
    );
    tetherTokenAddress = await tetherToken.getAddress();

    const UniswapTokenFactory: Uni__factory = await ethers.getContractFactory(
      "Uni"
    );
    uniswapToken = await UniswapTokenFactory.deploy(
      owner.address,
      owner.address,
      0
    );
    uniswapTokenAddress = await uniswapToken.getAddress();

    const ChainlinkTokenFactory: LinkToken__factory =
      await ethers.getContractFactory("LinkToken");
    chainlinkToken = await ChainlinkTokenFactory.deploy();
    chainlinkTokenAddress = await chainlinkToken.getAddress();

    const BNBTokenFactory: BNB__factory = await ethers.getContractFactory(
      "BNB"
    );
    bnbToken = await BNBTokenFactory.deploy(
      initSupply,
      "BNB",
      10 * 10 ** 8,
      "BNB"
    );
    bnbTokenAddress = await bnbToken.getAddress();

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
    it("Should proper get on-chain price", async () => {
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
    it.skip("Should deposit proper amount of allowed tokens on raffle contract", async () => {
      await chainlinkToken.approve(raffleContractAddress, 100000);

      await raffleContract.deposite(chainlinkTokenAddress, 100000);

      expect(await chainlinkToken.balanceOf(raffleContractAddress)).to.equal(
        100000
      );
    });
    it("Should proper set usd balance of user due to exchange", async () => {
      await uniswapToken.approve(raffleContract, 2);

      await raffleContract.deposite(uniswapTokenAddress, 2);

      const result = await raffleContract.getBalanceInUsd();

      console.log(result);
    });
  });
});
