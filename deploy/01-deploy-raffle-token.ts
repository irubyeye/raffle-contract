import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployGovernanceToken: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  // const { getNamedAccounts, deployments, network } = hre;
  // const { deploy, log } = deployments;
  // const { deployer } = await getNamedAccounts();
  // log("----------------------------------------------------");
  // log("Deploying GovernanceToken and waiting for confirmations...");
  // const raffleToken = await deploy("MyToken", {
  //   from: deployer,
  //   args: [],
  //   log: true,
  //   waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  // });
  // log(`GovernanceToken at ${raffleToken.address}`);
  // log(`Delegating to ${deployer}`);
  // await delegate(raffleToken.address, deployer);
  // log("Delegated!");
};

const delegate = async (
  raffleTokenAddress: string,
  delegatedAccount: string
) => {
  // const raffleToken = await ethers.getContractAt("MyToken", raffleTokenAddress);
  // const transactionResponse = await raffleToken.delegate(delegatedAccount);
  // await transactionResponse.wait(1);
  // console.log(
  //   `Checkpoints: ${await raffleToken.numCheckpoints(delegatedAccount)}`
  // );
};

export default deployGovernanceToken;
//deployGovernanceToken.tags = ["all", "governor"];
