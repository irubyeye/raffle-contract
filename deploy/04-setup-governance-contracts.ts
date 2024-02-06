import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

import { ADDRESS_ZERO } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const setupContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments } = hre;
  const { log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  const timeLockAddress = (await get("TimeLock")).address;
  const governorAddress = (await get("MyGovernor")).address;
  const timeLock = await ethers.getContractAt("TimeLock", timeLockAddress);
  log("----------------------------------------------------");
  log("Setting up contracts for roles...");
  const proposerRole = await timeLock.PROPOSER_ROLE();
  const executorRole = await timeLock.EXECUTOR_ROLE();
  const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();
  const proposerTx = await timeLock.grantRole(proposerRole, governorAddress);
  await proposerTx.wait(1);
  const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
  await executorTx.wait(1);
  const revokeTx = await timeLock.revokeRole(adminRole, deployer);
  await revokeTx.wait(1);
  log("Successful!");
};

export default setupContracts;
setupContracts.tags = ["all", "setup"];
