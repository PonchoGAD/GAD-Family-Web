// src/wallet/core/services/constants.ts
import type { Address } from 'viem';

function env(...keys: string[]) {
  for (const k of keys) {
    const v = (process.env as Record<string, string | undefined>)[k];
    if (v) return v;
  }
  return undefined;
}
const trimHex = (v: string | undefined, fb: string): Address =>
  (v ?? fb).trim().replace(/^"+|"+$/g, '').replace(/^'+|'+$/g, '') as Address;

export const PCS_V2_ROUTER  = trimHex(
  env('NEXT_PUBLIC_PCS_V2_ROUTER', 'EXPO_PUBLIC_PCS_V2_ROUTER'),
  '0x10ED43C718714eb63d5aA57B78B54704E256024E'
);
export const PCS_V2_FACTORY = trimHex(
  env('NEXT_PUBLIC_PCS_V2_FACTORY', 'EXPO_PUBLIC_PCS_V2_FACTORY'),
  '0xCA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
);
export const WBNB = trimHex(
  env('NEXT_PUBLIC_WBNB', 'EXPO_PUBLIC_WBNB'),
  '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
);
export const USDT = trimHex(
  env('NEXT_PUBLIC_USDT', 'EXPO_PUBLIC_USDT'),
  '0x55d398326f99059fF775485246999027B3197955'
);
export const GAD = trimHex(
  env('NEXT_PUBLIC_GAD_TOKEN', 'EXPO_PUBLIC_GAD_TOKEN'),
  '0x858bab88A5b8d7f29a40380C5F2D8d0b8812FE62'
);

// «нативная заглушка» для маршрутизатора (ETH/BNB)
export const NATIVE_SENTINEL = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as Address;

export const TOKENS = {
  BNB:  { address: NATIVE_SENTINEL, symbol: 'BNB',  name: 'BNB',          decimals: 18 },
  WBNB: { address: WBNB,            symbol: 'WBNB', name: 'Wrapped BNB',  decimals: 18 },
  USDT: { address: USDT,            symbol: 'USDT', name: 'Tether USD',   decimals: 18 },
  GAD:  { address: GAD,             symbol: 'GAD',  name: 'GAD',          decimals: 18 },
} as const;
