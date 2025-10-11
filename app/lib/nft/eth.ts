import { ethers } from "ethers";
import { RPC_URL } from "./constants";

export function getReadProvider() {
  if (!RPC_URL) throw new Error("RPC_URL is empty");
  return new ethers.JsonRpcProvider(RPC_URL);
}

export async function getBrowserProvider() {
  const eth = (globalThis as any)?.ethereum;
  if (!eth) throw new Error("Ethereum provider not found");
  return new ethers.BrowserProvider(eth);
}

export async function getSigner() {
  const p = await getBrowserProvider();
  return p.getSigner();
}
