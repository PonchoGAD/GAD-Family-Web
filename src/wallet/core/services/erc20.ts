import type { Address } from "viem";
import { ERC20_ABI } from "./abi";
import { publicClient } from "./bscClient";

/**
 * Универсальная безопасная обёртка для чтения контракта
 * — не ругается на generic'и Viem и возвращает значение как есть.
 */
async function safeRead<T>(
  params: { address: Address; abi: any; functionName: string; args?: any[] }
): Promise<T> {
  try {
    const result = await (publicClient as any).readContract(params);
    return result as T;
  } catch (e) {
    console.warn("safeRead error:", e);
    throw e;
  }
}

export async function erc20BalanceOf(token: Address, owner: Address): Promise<bigint> {
  try {
    return await safeRead<bigint>({
      address: token,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [owner],
    });
  } catch (e) {
    console.warn(`erc20BalanceOf error (${token}):`, e);
    return 0n;
  }
}

export async function erc20Decimals(token: Address): Promise<number> {
  try {
    const d = await safeRead<bigint>({
      address: token,
      abi: ERC20_ABI,
      functionName: "decimals",
    });
    return Number(d);
  } catch (e) {
    console.warn(`erc20Decimals error (${token}):`, e);
    return 18;
  }
}

export async function erc20Symbol(token: Address): Promise<string> {
  try {
    const s = await safeRead<string>({
      address: token,
      abi: ERC20_ABI,
      functionName: "symbol",
    });
    return String(s);
  } catch (e) {
    console.warn(`erc20Symbol error (${token}):`, e);
    return "UNKNOWN";
  }
}

export async function erc20Allowance(
  token: Address,
  owner: Address,
  spender: Address
): Promise<bigint> {
  try {
    return await safeRead<bigint>({
      address: token,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner, spender],
    });
  } catch (e) {
    console.warn(`erc20Allowance error (${token}):`, e);
    return 0n;
  }
}
