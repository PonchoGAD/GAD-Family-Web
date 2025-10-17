import { ethers } from "ethers";
export { getSigner, getReadProvider } from "./eth";

/**
 * Совместимо с текущей структурой: возвращает signer и контракт по адресу+ABI.
 * Не переименовывает ничего в остальном проекте.
 */
export async function getSignerAndContract<T = ethers.Contract>(
  address: `0x${string}` | string,
  abi: any
): Promise<{ signer: ethers.Signer; contract: T }> {
  const { getSigner } = await import("./eth");
  const signer = await getSigner();
  const contract = new ethers.Contract(address as string, abi, signer) as T;
  return { signer, contract };
}
