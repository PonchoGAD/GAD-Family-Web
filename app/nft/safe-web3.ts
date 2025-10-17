"use client";

import { ethers } from "ethers";

let initialized = false;

/**
 * Простая инициализация Web3Modal или MetaMask,
 * чтобы не падал импорт в NftClientRoot.
 */
export function initWeb3ModalOnce() {
  if (initialized) return;
  initialized = true;

  if (typeof window === "undefined") return;
  const eth = (window as any).ethereum;

  if (!eth) {
    console.warn("⚠️ MetaMask not detected. Web3Modal skipped.");
    return;
  }

  console.log("✅ Web3Modal initialized (safe-web3.ts)");
}

/** Возвращает read-only провайдер (без MetaMask) */
export async function getReadProvider() {
  return new ethers.JsonRpcProvider(
    process.env.NEXT_PUBLIC_RPC_URL ||
      "https://bsc-dataseed1.binance.org"
  );
}

/** Возвращает BrowserProvider (через MetaMask) */
export async function getBrowserProvider() {
  if (!(window as any).ethereum)
    throw new Error("MetaMask not found. Please install MetaMask.");
  return new ethers.BrowserProvider((window as any).ethereum);
}

/** Возвращает signer (подключённый пользователь) */
export async function getSigner() {
  const provider = await getBrowserProvider();
  return await provider.getSigner();
}
