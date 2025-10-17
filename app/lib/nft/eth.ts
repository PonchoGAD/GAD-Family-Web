import { BrowserProvider, JsonRpcProvider } from "ethers";
import { DEFAULT_CHAIN } from "./chains";

export const getReadProvider = async () => {
  return new JsonRpcProvider(DEFAULT_CHAIN.rpc);
};

export const getBrowserProvider = async () => {
  if (typeof window === "undefined") throw new Error("No window");
  const anyWin = window as any;
  if (!anyWin.ethereum) throw new Error("Wallet is not available");
  return new BrowserProvider(anyWin.ethereum, "any");
};

export const getSigner = async () => {
  const provider = await getBrowserProvider();
  return await provider.getSigner();
};
