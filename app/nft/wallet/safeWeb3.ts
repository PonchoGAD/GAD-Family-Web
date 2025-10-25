// app/nft/wallet/safeWeb3.ts
"use client";
import { ethers, type Eip1193Provider } from "ethers";

export type Web3State = {
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
  chainId: number | null;
};

function getInjected(): Eip1193Provider | undefined {
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
}

export async function connectWallet(): Promise<Web3State> {
  if (typeof window === "undefined" || !getInjected()) {
    throw new Error("Не найден injected-кошелёк (MetaMask / OKX / и т.п.).");
  }
  const provider = new ethers.BrowserProvider(getInjected()!);
  const accounts = (await provider.send("eth_requestAccounts", [])) as unknown as string[];
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
  // Если есть injected провайдер — используем его для чтения
  if (typeof window !== "undefined" && getInjected()) {
    return new ethers.BrowserProvider(getInjected()!);
  }
  // Иначе — fallback на RPC (если нужен readonly)
  if (!rpcUrl) {
    throw new Error("Нет доступного провайдера (и не задан rpcUrl).");
  }
  return new ethers.JsonRpcProvider(rpcUrl);
}
