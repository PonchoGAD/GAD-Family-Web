import {
  BrowserProvider,
  JsonRpcProvider,
  type Eip1193Provider,
  type Signer,
} from "ethers";
import { DEFAULT_CHAIN } from "./chains";

function getEth(): Eip1193Provider {
  const eth = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
  if (!eth) throw new Error("Wallet is not available");
  return eth;
}

export const getReadProvider = async (): Promise<JsonRpcProvider> => {
  return new JsonRpcProvider(DEFAULT_CHAIN.rpc);
};

export const getBrowserProvider = async (): Promise<BrowserProvider> => {
  if (typeof window === "undefined") throw new Error("No window");
  const eth = getEth();
  return new BrowserProvider(eth, "any");
};

export const getSigner = async (): Promise<Signer> => {
  const provider = await getBrowserProvider();
  return provider.getSigner();
};
