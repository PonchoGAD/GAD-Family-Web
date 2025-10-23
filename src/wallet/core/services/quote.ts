import type { Address } from 'viem';
import { FACTORY_ABI, PAIR_ABI } from './abi';
import { publicClient } from './bscClient';
import { TOKENS } from './constants';

/** ---------- Вспомогательные типы ---------- */
type FactoryAbi = typeof FACTORY_ABI;
type PairAbi = typeof PAIR_ABI;

interface ReadableClient {
  readContract(p: unknown): Promise<unknown>;
}

/** ---------- Служебные формулы Uniswap v2 ---------- */
function getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
  if (amountIn === 0n || reserveIn === 0n || reserveOut === 0n) return 0n;
  const amountInWithFee = amountIn * 9975n; // 0.25% fee
  const numerator = amountInWithFee * reserveOut;
  const denominator = reserveIn * 10000n + amountInWithFee;
  return numerator / denominator;
}

/** ---------- Получить адрес пары ---------- */
export async function getPairAddress(tokenA: Address, tokenB: Address): Promise<Address> {
  const client = publicClient as unknown as ReadableClient;
  const res = (await client.readContract({
    address: (process.env.NEXT_PUBLIC_PCS_V2_FACTORY ??
      '0xCA143Ce32Fe78f1f7019d7d551a6402fC5350c73') as Address,
    abi: FACTORY_ABI as FactoryAbi,
    functionName: 'getPair',
    args: [tokenA, tokenB],
  })) as Address;
  return res;
}

/** ---------- Резервы пары ---------- */
export async function getReserves(pair: Address): Promise<{
  reserve0: bigint;
  reserve1: bigint;
  blockTimestampLast: number;
}> {
  const client = publicClient as unknown as ReadableClient;
  const [r0, r1, ts] = (await client.readContract({
    address: pair,
    abi: PAIR_ABI as PairAbi,
    functionName: 'getReserves',
  })) as readonly [bigint, bigint, number];

  return { reserve0: r0, reserve1: r1, blockTimestampLast: ts };
}

/** ---------- Котировка: сколько выйдет tokenOut за amountIn tokenIn ---------- */
export async function quoteExactIn(
  tokenIn: Address,
  tokenOut: Address,
  amountIn: bigint
): Promise<{ amountOut: bigint; path: Address[] }> {
  try {
    if (tokenIn.toLowerCase() === tokenOut.toLowerCase()) {
      return { amountOut: amountIn, path: [tokenIn] };
    }

    const ZERO = '0x0000000000000000000000000000000000000000';

    // Прямая пара
    const directPair = await getPairAddress(tokenIn, tokenOut);
    if (directPair && directPair.toLowerCase() !== ZERO) {
      const { reserve0, reserve1 } = await getReserves(directPair);
      const out =
        tokenIn.toLowerCase() < tokenOut.toLowerCase()
          ? getAmountOut(amountIn, reserve0, reserve1)
          : getAmountOut(amountIn, reserve1, reserve0);
      return { amountOut: out, path: [tokenIn, tokenOut] };
    }

    // Через WBNB
    const WBNB = TOKENS.WBNB.address as Address;
    const pairA = await getPairAddress(tokenIn, WBNB);
    const pairB = await getPairAddress(WBNB, tokenOut);

    if (pairA && pairB && pairA.toLowerCase() !== ZERO && pairB.toLowerCase() !== ZERO) {
      const { reserve0: r0a, reserve1: r1a } = await getReserves(pairA);
      const { reserve0: r0b, reserve1: r1b } = await getReserves(pairB);

      const mid =
        tokenIn.toLowerCase() < WBNB.toLowerCase()
          ? getAmountOut(amountIn, r0a, r1a)
          : getAmountOut(amountIn, r1a, r0a);

      const out =
        WBNB.toLowerCase() < tokenOut.toLowerCase()
          ? getAmountOut(mid, r0b, r1b)
          : getAmountOut(mid, r1b, r0b);

      return { amountOut: out, path: [tokenIn, WBNB, tokenOut] };
    }

    // Нет пары
    return { amountOut: 0n, path: [tokenIn, tokenOut] };
  } catch (e) {
    console.warn('quoteExactIn error:', e);
    return { amountOut: 0n, path: [tokenIn, tokenOut] };
  }
}
