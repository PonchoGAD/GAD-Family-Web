export type ChainInfo = {
  id: number;
  name: string;
  rpc: string;
  explorer: string;
  nativeSymbol: string;
};

export const BSC: ChainInfo = {
  id: 56,
  name: "BNB Smart Chain",
  rpc: process.env.NEXT_PUBLIC_RPC_BSC || "https://bsc-dataseed1.ninicoin.io",
  explorer: "https://bscscan.com",
  nativeSymbol: "BNB",
};

export const BSC_TESTNET: ChainInfo = {
  id: 97,
  name: "BSC Testnet",
  rpc: process.env.NEXT_PUBLIC_RPC_BSC_TESTNET || "https://bsc-testnet.publicnode.com",
  explorer: "https://testnet.bscscan.com",
  nativeSymbol: "tBNB",
};

export const DEFAULT_CHAIN: ChainInfo =
  Number(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID) === 97 ? BSC_TESTNET : BSC;
