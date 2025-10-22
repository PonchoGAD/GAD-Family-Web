// src/wallet/core/services/signer.ts
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';

const RPC = process.env.NEXT_PUBLIC_BSC_RPC_URL
  || process.env.EXPO_PUBLIC_BSC_RPC_URL
  || 'https://bsc-dataseed.binance.org';

export function walletClientFromPriv(privKey: `0x${string}`) {
  const account = privateKeyToAccount(privKey);
  const wallet = createWalletClient({
    chain: bsc,
    transport: http(RPC),
    account,
  });
  return { wallet, account };
}
