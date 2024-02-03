import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
  QUORUM_PERCENTAGE,
  VOTING_PERIOD,
  VOTING_DELAY,
} from "../helper-hardhat-config";

const deployGovernorContract: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // // @ts-ignore
  // const { getNamedAccounts, deployments, network } = hre;
  // const { deploy, log, get } = deployments;
  // const { deployer } = await getNamedAccounts();
  // const raffleToken = await get("MyToken");
  // const timeLock = await get("TimeLock");
  // const args = [
  //   raffleToken.address,
  //   timeLock.address,
  //   QUORUM_PERCENTAGE,
  //   VOTING_PERIOD,
  //   VOTING_DELAY,
  // ];
  // log("----------------------------------------------------");
  // log("Deploying GovernorContract and waiting for confirmations...");
  // const governorContract = await deploy("MyGovernor", {
  //   from: deployer,
  //   args,
  //   log: true,
  //   waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  // });
  // log(`GovernorContract at ${governorContract.address}`);
};

export default deployGovernorContract;
//deployGovernorContract.tags = ["all", "governor"];
