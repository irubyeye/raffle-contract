import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import {
  networkConfig,
  developmentChains,
  vrfContractAddress,
} from "../helper-hardhat-config";
import { ethers } from "hardhat";
import { wethAddress, uniswapRouter } from "../helper-hardhat-config";

const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts();
  log("----------------------------------------------------");
  log("Deploying Raffle and waiting for confirmations...");
  // const vrfConsumerContract = await deploy("VRFv2Consumer", {
  //   from: deployer,
  //   args: [8801],
  //   log: true,
  //   waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  // });
  // log(`Vrf Random generator at ${vrfConsumerContract.address}`);
  const args = [vrfContractAddress, wethAddress, uniswapRouter];
  const raffleContract = await deploy("Raffle", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`Raffle contract at ${raffleContract.address}`);
  const raffleContractEx = await ethers.getContractAt(
    "Raffle",
    raffleContract.address
  );
  const vrfRand = await ethers.getContractAt(
    "VRFv2Consumer",
    "0x8b56001485d5d47A97f1B7b53b3B3734bA3b2FBD"
  );
  //const timeLock = await get("TimeLock");
  const transferTx = await raffleContractEx.transferOwnership(
    "0xD26A862C2B5D9D20a6041158b960709719284706"
  );
  await transferTx.wait(1);

  const transferToRaffleTx = await vrfRand.transferOwnership(
    raffleContract.address
  );
  await transferToRaffleTx.wait();

  const acceptOwnerTx = await raffleContractEx.acceptingOwnership();
  await acceptOwnerTx.wait();

  const vrfOwner = await vrfRand.owner();

  log("----------------------------------------------------");
  log(`Deployer address: ${deployer}`);
  log(`Vrf owner: ${vrfOwner}`);
};

export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
