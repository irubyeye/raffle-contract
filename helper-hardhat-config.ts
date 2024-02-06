export interface networkConfigItem {
  ethUsdPriceFeed?: string;
  blockConfirmations?: number;
}

export interface networkConfigInfo {
  [key: string]: networkConfigItem;
}

export const networkConfig: networkConfigInfo = {
  localhost: {},
  hardhat: {},
  sepolia: {
    blockConfirmations: 6,
  },
};

export const developmentChains = ["hardhat", "localhost"];
export const proposalsFile = "proposals.json";

export const QUORUM_PERCENTAGE = 4;
export const MIN_DELAY = 60;

export const VOTING_PERIOD = 5;
export const VOTING_DELAY = 1;
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const NEW_STORE_VALUE = 77;
export const FUNC = "manageTokenAndOracle";
export const PROPOSAL_DESCRIPTION = "Voting #1: Add Synthetix Network Token";

export const uniswapRouter = "0xC532a74256D3Db42D0Bf7a0400fEFDbad7694008";
export const wethAddress = "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9";
export const vrfContractAddress = "0x8b56001485d5d47A97f1B7b53b3B3734bA3b2FBD";
