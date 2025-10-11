// app/lib/nft/constants.ts
// финальная сборка конфигурации из .env + config.ts

import { config } from "./config";

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL ?? config.RPC_URL;
export const CHAIN_ID = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? config.CHAIN_ID);
export const START_BLOCK = Number(process.env.NEXT_PUBLIC_START_BLOCK ?? config.START_BLOCK);

export const ADDR = {
  NFT721: process.env.NEXT_PUBLIC_NFT721 ?? config.ADDR.NFT721,
  MARKETPLACE: process.env.NEXT_PUBLIC_MARKETPLACE ?? config.ADDR.MARKETPLACE,
  USDT: process.env.NEXT_PUBLIC_USDT ?? config.ADDR.USDT,
  LIQUIDITY_VAULT: process.env.NEXT_PUBLIC_LIQUIDITY_VAULT ?? config.ADDR.LIQUIDITY_VAULT,
} as const;

export const EXPLORER_TX = process.env.NEXT_PUBLIC_EXPLORER_TX ?? config.EXPLORER_TX;

const _compat = { RPC_URL, CHAIN_ID, START_BLOCK, ADDR, EXPLORER_TX };
export default _compat;
