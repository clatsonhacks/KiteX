import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    kite: {
      url: process.env.KITE_RPC_URL || "https://rpc.gokite.ai/",
      chainId: 2366,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    apiKey: {
      kite: process.env.KITESCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "kite",
        chainId: 2368,
        urls: {
          apiURL: "https://kitescan.ai/api",
          browserURL: "https://kitescan.ai",
        },
      },
    ],
  },
};

export default config;
