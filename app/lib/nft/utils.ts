import { formatUnits } from "ethers";

export function fmtPriceWei(p: string, decimals = 18) {
  try { return formatUnits(BigInt(p), decimals); } catch { return p; }
}
export function short(a: string, n = 6) {
  return a ? `${a.slice(0, n)}…${a.slice(-4)}` : "";
}
