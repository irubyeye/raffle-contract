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
export const MIN_DELAY = 3600;

export const VOTING_PERIOD = 5;
export const VOTING_DELAY = 1;
export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

export const NEW_STORE_VALUE = 77;
export const FUNC = "manageTokenAndOracle";
export const PROPOSAL_DESCRIPTION = "Voting #1: Add Synthetix Network Token";
