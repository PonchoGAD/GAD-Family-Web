import { DEFAULT_CHAIN } from "./chains";
import type { Eip1193Provider } from "ethers";

function getEth(): Eip1193Provider | undefined {
  return (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
}

export const currentAccount = async (): Promise<string | null> => {
  const eth = getEth();
  if (!eth) return null;
  const accounts = (await eth.request({ method: "eth_accounts" })) as string[];
  return accounts?.[0] ?? null;
};

export const connectWallet = async (): Promise<string> => {
  const eth = getEth();
  if (!eth) throw new Error("Wallet is not available");
  const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
  if (!accounts?.[0]) throw new Error("No accounts returned");
  return accounts[0];
};

export const ensureChain = async (): Promise<void> => {
  const eth = getEth();
  if (!eth) throw new Error("Wallet is not available");
  const chainHex = (await eth.request({ method: "eth_chainId" })) as string;
  const current = parseInt(chainHex, 16);
  if (current !== DEFAULT_CHAIN.id) {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + DEFAULT_CHAIN.id.toString(16) }],
    });
  }
};
