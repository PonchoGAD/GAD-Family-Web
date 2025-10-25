import type { Address } from 'viem';
import { publicClient } from './bscClient';
import { ERC20_ABI } from './abi';
import { TOKENS, NATIVE_SENTINEL } from './constants';
import { readC } from './viemHelpers';

export type TokenMeta = { address: Address; symbol: string; name: string; decimals: number };

export function isNative(addrLike?: string | null): boolean {
  return !!addrLike && addrLike.toLowerCase() === NATIVE_SENTINEL.toLowerCase();
}

export async function getNativeBalance(user: `0x${string}`): Promise<number> {
  const wei = await publicClient.getBalance({ address: user });
  return Number(wei) / 1e18;
}

/**
 * Локальный «мягкий» враппер поверх readC<T>, чтобы не тянуть сюда тяжёлые generic-типы Viem.
 * На рантайме остаётся тот же readC, меняется лишь проверка типов на этапе TS.
 */
async function readLoose<T>(params: unknown): Promise<T> {
  // каст только на типовом уровне; в рантайме это тот же объект
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return readC<T>(params as never);
}

export async function getErc20Balance(
  token: Address,
  user: `0x${string}`,
  decimals = 18
): Promise<number> {
  try {
    const bal = await readLoose<bigint>({
      address: token,
      abi: ERC20_ABI,
      functionName: 'balanceOf',
      args: [user],
    });

    return Number(bal) / 10 ** decimals;
  } catch (e) {
    console.warn('erc20BalanceOf error (%s):', token, e);
    return 0;
  }
}

export async function getErc20Meta(address: Address): Promise<TokenMeta> {
  const [symbol, name, decimalsBn] = await Promise.all([
    readLoose<string>({ address, abi: ERC20_ABI, functionName: 'symbol' }),
    readLoose<string>({ address, abi: ERC20_ABI, functionName: 'name' }),
    readLoose<bigint>({ address, abi: ERC20_ABI, functionName: 'decimals' }),
  ]);

  return {
    address,
    symbol: String(symbol),
    name: String(name),
    decimals: Number(decimalsBn),
  };
}

export async function getKnownBalances(user: `0x${string}`) {
  const out: Record<string, number> = {};
  out.BNB  = await getNativeBalance(user);
  out.GAD  = await getErc20Balance(TOKENS.GAD.address  as Address, user, TOKENS.GAD.decimals);
  out.USDT = await getErc20Balance(TOKENS.USDT.address as Address, user, TOKENS.USDT.decimals);
  out.WBNB = await getErc20Balance(TOKENS.WBNB.address as Address, user, TOKENS.WBNB.decimals);
  return out;
}
