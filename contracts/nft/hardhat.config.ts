import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";

const BSC_RPC = process.env.BSC_RPC || "https://bsc-dataseed.binance.org";
const PK = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000000";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    bsc: { type: "http", url: BSC_RPC, chainId: 56, accounts: [PK] },
    bsctest: {
      type: "http",
      url: process.env.BSC_TESTNET_RPC || "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      accounts: [PK]
    }
  },
  // @ts-expect-error: etherscan field provided by @nomicfoundation/hardhat-verify
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    }
  }
};

export default config;
