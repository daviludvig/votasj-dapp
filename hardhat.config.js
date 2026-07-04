require("@nomicfoundation/hardhat-toolbox");

const AMOY_RPC_URL = process.env.AMOY_RPC_URL || "";
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    hardhat: {},
    amoy: {
      url: AMOY_RPC_URL,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
  gasReporter: {
    enabled: true,
    noColors: true,
    outputFile: "reports/gas-report.txt",
    forceConsoleOutput: true,
    reportPureAndViewMethods: false,
    excludeContracts: [],
  },
};
