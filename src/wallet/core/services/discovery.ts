import type { Address } from 'viem';
import { publicClient } from './bscClient';
import { ERC20_ABI } from './abi';
import { TOKENS, NATIVE_SENTINEL } from './constants';

export type TokenMeta = { address: Address; symbol: string; name: string; decimals: number };

export function isNative(addrLike?: string | null): boolean {
  return !!addrLike && addrLike.toLowerCase() === NATIVE_SENTINEL.toLowerCase();
}

export async function getNativeBalance(user: `0x${string}`): Promise<number> {
  const wei = await publicClient.getBalance({ address: user });
  return Number(wei) / 1e18;
}

export async function getErc20Balance(token: Address, user: `0x${string}`, decimals = 18): Promise<number> {
  try {
    const bal = await publicClient.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [user],
    } as any) as bigint; // ← приводим один раз

    return Number(bal) / 10 ** decimals;
  } catch (e) {
    console.warn('erc20BalanceOf error (%s):', token, e);
    return 0;
  }
}

export async function getErc20Meta(address: Address): Promise<TokenMeta> {
  const [symbol, name, decimals] = await Promise.all([
    publicClient.readContract({ address, abi: ERC20_ABI, functionName: 'symbol'   } as any) as Promise<string>,
    publicClient.readContract({ address, abi: ERC20_ABI, functionName: 'name'     } as any) as Promise<string>,
    publicClient.readContract({ address, abi: ERC20_ABI, functionName: 'decimals' } as any) as Promise<number>,
  ]);

  return { address, symbol: String(symbol), name: String(name), decimals: Number(decimals) };
}

export async function getKnownBalances(user: `0x${string}`) {
  const out: Record<string, number> = {};
  out.BNB  = await getNativeBalance(user);
  out.GAD  = await getErc20Balance(TOKENS.GAD.address  as Address, user, TOKENS.GAD.decimals);
  out.USDT = await getErc20Balance(TOKENS.USDT.address as Address, user, TOKENS.USDT.decimals);
  out.WBNB = await getErc20Balance(TOKENS.WBNB.address as Address, user, TOKENS.WBNB.decimals);
  return out;
}
