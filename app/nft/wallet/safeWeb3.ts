// app/nft/wallet/safeWeb3.ts
"use client";
import { ethers } from "ethers";

export type Web3State = {
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
};

export async function connectWallet(): Promise<Web3State> {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    throw new Error("Не найден injected-кошелёк (MetaMask / OKX / и т.п.).");
  }
  const provider = new ethers.BrowserProvider((window as any).ethereum);
  const accounts: string[] = await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const network = await provider.getNetwork();

  return {
    provider,
    signer,
    account: accounts[0] ?? null,
    chainId: Number(network.chainId),
  };
}

export async function getReadonlyProvider(rpcUrl?: string) {
  // Если есть инжектed провайдер — используем его для чтения
  if (typeof window !== "undefined" && (window as any).ethereum) {
    return new ethers.BrowserProvider((window as any).ethereum);
  }
  // Иначе — fallback на RPC (если нужен readonly)
  if (!rpcUrl) {
    throw new Error("Нет доступного провайдера (и не задан rpcUrl).");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
}
