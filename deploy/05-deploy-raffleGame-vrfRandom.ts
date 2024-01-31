import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  log("----------------------------------------------------");
  log("Deploying Raffle, VRF Random and waiting for confirmations...");
  const vrfConsumerContract = await deploy("VRFv2Consumer", {
    from: deployer,
    args: [8801],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`Vrf Random generator at ${vrfConsumerContract.address}`);
  const args = [
    vrfConsumerContract.address,
    "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  ];
  const raffleContract = await deploy("Raffle", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`Raffle contract at ${raffleContract.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(raffleContract.address, []);
    await verify(vrfConsumerContract.address, []);
  }
  const raffleContractEx = await ethers.getContractAt(
    "Raffle",
    raffleContract.address
  );
  const timeLock = await get("TimeLock");
  const transferTx = await raffleContractEx.transferOwnership(timeLock.address);
  await transferTx.wait(1);
  log("----------------------------------------------------");
  log(`Deployer address: ${deployer}`);
};

export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
