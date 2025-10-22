// src/wallet/core/services/bscClient.ts
import { createPublicClient, http, parseUnits } from 'viem';
import { bsc } from 'viem/chains';

const RPC =
  process.env.NEXT_PUBLIC_BSC_RPC_URL ||
  process.env.EXPO_PUBLIC_BSC_RPC_URL ||
  'https://bsc-dataseed.binance.org';

export const publicClient = createPublicClient({
  chain: bsc,
  transport: http(RPC),
});

// helpers
export function toWei(human: string, decimals = 18) {
  return parseUnits(human, decimals);
}
