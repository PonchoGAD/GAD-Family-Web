// app/lib/nft/config.ts
// только базовые значения проекта — без импорта constants.ts

export const config = {
  RPC_URL: "https://bsc-dataseed.binance.org/",
  CHAIN_ID: 56,
  START_BLOCK: 39000000,
  ADDR: {
    NFT721: "0x6d5F5c36C91AaC4FEdE8fE8FbFEcBd8cbdD8d8C1",
    MARKETPLACE: "0x8b5f5EeB14D3B1eF4e901F50A8579d91E8dD83F0",
    USDT: "0x55d398326f99059fF775485246999027B3197955",
    LIQUIDITY_VAULT: "0xB8A0458C30C3F77E5E8d2a5B44a8f2A9eF6508Ea",
  },
  EXPLORER_TX: "https://bscscan.com/tx/"
} as const;
