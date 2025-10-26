// src/wallet/core/state/WalletStore.ts
// ✅ Centralized config for all BSC-related constants
'use client';

import { getAddress } from 'viem';

const c = (a: `0x${string}`) => getAddress(a); // checksum-normalize

export const BSC_CHAIN_ID = 56;

export const PCS_V2_ROUTER = c('0x10ED43C718714eb63d5aA57B78B54704E256024E');
export const PCS_V2_FACTORY = c('0xCA143Ce32Fe78f1f7019d7d551a6402fC5350c73');
export const WBNB = c('0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c');

// Pseudo address for native BNB (UI only; NEVER send on chain)
export const NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as const;

// Main tokens used in GAD Wallet
export const TOKENS = {
  BNB: {
    address: NATIVE,    // UI only; convert to WBNB on-chain when needed
    symbol: 'BNB',
    decimals: 18,
  },
  WBNB: {
    address: WBNB,
    symbol: 'WBNB',
    decimals: 18,
  },
  GAD: {
    address: c('0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62'),
    symbol: 'GAD',
    decimals: 18,
  },
  USDT: {
    address: c('0x55d398326f99059fF775485246999027B3197955'),
    symbol: 'USDT',
    decimals: 18,
  },
} as const;
