// lib/nft/eth.ts
import {
  BrowserProvider,
  JsonRpcProvider,
  type Eip1193Provider,
  type Signer,
} from "ethers";
import { DEFAULT_CHAIN } from "./chains";

/**
 * Универсальная функция для получения window.ethereum
 */
function getEth(): Eip1193Provider {
  const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  if (!eth) throw new Error("Wallet (window.ethereum) not found");
  return eth;
}

/**
 * 🔹 Read-only провайдер (SSR / Public RPC)
 * Используется для публичных запросов: токены, цены, метаданные и т.д.
 */
export const getReadProvider = async (): Promise<JsonRpcProvider> => {
  return new JsonRpcProvider(DEFAULT_CHAIN.rpc, DEFAULT_CHAIN.id);
};

/**
 * 🔹 BrowserProvider — обёртка Metamask/EVM
 */
export const getBrowserProvider = async (): Promise<BrowserProvider> => {
  if (typeof window === "undefined") throw new Error("No browser context");
  const eth = getEth();
  return new BrowserProvider(eth, "any");
};

/**
 * 🔹 Signer — активный пользовательский кошелёк (Metamask)
 * Делает запрос на подключение и пробует переключить сеть.
 */
export const getSigner = async (): Promise<Signer> => {
  const provider = await getBrowserProvider();
  await provider.send("eth_requestAccounts", []);

  // Мягкое переключение сети (BNB Chain / Testnet)
  try {
    const eth = getEth();
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + DEFAULT_CHAIN.id.toString(16) }],
    });
  } catch {
    // пользователь мог отменить — просто продолжаем
  }

  return provider.getSigner();
};
