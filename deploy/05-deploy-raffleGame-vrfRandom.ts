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
  const vrfConsumerContract = await deploy("VRFv2Consumer", {
    from: deployer,
    args: [8801],
    log: true,
    waitConfirmations: networkConfig[network.name].blockConfirmations || 1,
  });
  log(`Vrf Random generator at ${vrfConsumerContract.address}`);
  const args = [vrfConsumerContract.address, wethAddress, uniswapRouter];
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
  const vrfRandEx = await ethers.getContractAt(
    "VRFv2Consumer",
    vrfConsumerContract.address
  );
  const timeLock = await get("TimeLock");
  const transferTx = await raffleContractEx.transferOwnership(timeLock.address);
  await transferTx.wait(1);

  // const transferTx = await raffleContractEx.transferOwnership(
  //   "0xD26A862C2B5D9D20a6041158b960709719284706"
  // );
  // await transferTx.wait(1);

  const transferToRaffleTx = await vrfRandEx.transferOwnership(
    raffleContract.address
  );
  await transferToRaffleTx.wait();

  log(`Requested transfer ownership of vrf rand to raffle contract`);

  const acceptOwnerTx = await raffleContractEx.acceptingOwnership();
  await acceptOwnerTx.wait();

  log(`Accepted ownership by raffle contract`);

  const vrfOwner = await vrfRandEx.owner();

  log("----------------------------------------------------");
  log(`Deployer address: ${deployer}`);
  log(`Vrf contract address: ${vrfConsumerContract.address}`);
  log(`Raffle contract address: ${raffleContract.address}`);
  log(`Vrf owner: ${vrfOwner}`);
};

export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
