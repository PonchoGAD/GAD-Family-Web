'use client';

import { http } from 'viem';
import { bsc } from 'wagmi/chains';
import { createPublicClient } from 'viem';
import { getWalletClient } from '@wagmi/core';
import { config } from './wagmi';

let initialized = false;

export function initWeb3ModalOnce() {
  if (initialized) return;
  initialized = true;

  if (typeof window === 'undefined') return;
  const ethereum = (window as unknown as { ethereum?: unknown }).ethereum;
  if (!ethereum) {
    console.warn('⚠️ No injected provider detected. Skipping initWeb3ModalOnce().');
  } else {
    console.log('✅ Web3 ready (safe-web3.ts)');
  }
}

export async function getReadProvider() {
  return createPublicClient({
    chain: bsc,
    transport: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://bsc-dataseed1.binance.org'),
  });
}

export async function getBrowserProvider() {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error('Wallet not connected.');
  return walletClient;
}

export async function getSigner() {
  const walletClient = await getWalletClient(config);
  if (!walletClient) throw new Error('Wallet not connected.');
  return walletClient;
}
