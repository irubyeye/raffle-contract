import { task, types } from "hardhat/config";
require("@nomicfoundation/hardhat-toolbox");

task("deploy", "Deploying a smart contract").setAction(
  async (taskArgs, hre) => {
    try {
      const { setNetwork } = taskArgs;
      const votingTime: bigint = BigInt(3600);
      const [deployer] = await ethers.getSigners();

      const currentNetwork = hre.network.name;
      console.log(
        `Deploying contracts with the account on network ${currentNetwork}:`,
        deployer.address
      );

      const MyERC20 = await ethers.getContractFactory("MyERC20");
      const token = await MyERC20.deploy(votingTime);

      console.log("Token address:", await token.getAddress());
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }
);
