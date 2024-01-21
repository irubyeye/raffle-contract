import "@nomicfoundation/hardhat-toolbox";

require("dotenv").config();

const INFURA_API_KEY: string = process.env.INFURA_API_KEY || "";
const SEPOLIA_PRIVATE_KEY: string = process.env.SEPOLIA_PRIVATE_KEY || "";
const ALCHEMY_API_KEY: string = proces.env.ALCHEMY_API_KEY || "";
const COVERAGE = process.env.COVERAGE === "true";

if (COVERAGE) {
  require("solidity-coverage");
}

require("./tasks/deploy");

module.exports = {
  defaultNetwork: "hardhat",
  solidity: "0.8.23",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
    hardhat: {
      forking: {
        url: `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      },
    },
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
  },
};
