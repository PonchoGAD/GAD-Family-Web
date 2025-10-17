import { getBrowserProvider } from "./eth";
import { DEFAULT_CHAIN } from "./chains";

export const currentAccount = async (): Promise<string | null> => {
  const anyWin = window as any;
  if (!anyWin?.ethereum) return null;
  const accounts = (await anyWin.ethereum.request({ method: "eth_accounts" })) as string[];
  return accounts?.[0] ?? null;
};

export const connectWallet = async (): Promise<string> => {
  const anyWin = window as any;
  if (!anyWin?.ethereum) throw new Error("Wallet is not available");
  const accounts = (await anyWin.ethereum.request({ method: "eth_requestAccounts" })) as string[];
  return accounts[0];
};

export const ensureChain = async () => {
  const anyWin = window as any;
  if (!anyWin?.ethereum) throw new Error("Wallet is not available");
  const chainHex = await anyWin.ethereum.request({ method: "eth_chainId" });
  const current = parseInt(chainHex, 16);
  if (current !== DEFAULT_CHAIN.id) {
    // try switch
    await anyWin.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x" + DEFAULT_CHAIN.id.toString(16) }],
    });
  }
};
