import type { Address } from 'viem';
import { publicClient, toWei } from './bscClient';
import { walletClientFromPriv } from './signer';
import { ERC20_ABI, ROUTER_ABI } from './abi';
import { PCS_V2_ROUTER as ROUTER, NATIVE_SENTINEL } from './constants';
import { quoteExactIn } from './quote';
import { erc20Allowance } from './erc20';

/** ---------- Helpers ---------- */
const isNative = (addr: string) => addr.toLowerCase() === NATIVE_SENTINEL.toLowerCase();
const normalizePath = (p: Address[]) => p;

function minOutWithSlippage(amountOut: bigint, slippageBps: number): bigint {
  const bps = BigInt(Math.min(10_000, slippageBps));
  return (amountOut * (10_000n - bps)) / 10_000n;
}

// Узкий интерфейс для writeContract, чтобы не использовать any
type NarrowWriter = {
  writeContract: (p: {
    address: Address;
    abi: ReadonlyArray<unknown>;
    functionName: string;
    args?: readonly unknown[];
    account: { address: Address } | Address;
    value?: bigint;
  }) => Promise<`0x${string}`>;
};

/** ---------- Approve ---------- */
async function approveIfNeeded(
  privKey: `0x${string}`,
  token: Address,
  owner: Address,
  amountIn: bigint
): Promise<`0x${string}` | null> {
  const allowance = await erc20Allowance(token, owner, ROUTER as Address);
  if (allowance >= amountIn) return null;

  const { wallet, account } = walletClientFromPriv(privKey);
  const w = wallet as unknown as NarrowWriter;

  const txHash = await w.writeContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [ROUTER as Address, amountIn],
    account,
  });

  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}

/** ---------- Swap ---------- */
export async function swapExactIn(params: {
  privKey: `0x${string}`;
  tokenIn: Address;
  tokenOut: Address;
  amountInHuman: string;
  slippageBps?: number;
  to: Address;
  deadlineSec?: number;
}) {
  const {
    privKey,
    tokenIn,
    tokenOut,
    amountInHuman,
    slippageBps = 100,
    to,
    deadlineSec = 60,
  } = params;

  const { wallet, account } = walletClientFromPriv(privKey);
  const amountIn = toWei(amountInHuman, 18);

  const { amountOut, path } = await quoteExactIn(tokenIn, tokenOut, amountIn);
  if (amountOut === 0n) throw new Error('No liquidity route');

  const minOut = minOutWithSlippage(amountOut, slippageBps);
  const onchainPath = normalizePath(path);
  const deadline = BigInt(Math.floor(Date.now() / 1000) + deadlineSec);

  const w = wallet as unknown as NarrowWriter;

  // ---------- Native → Token ----------
  if (isNative(tokenIn)) {
    const txHash = await w.writeContract({
      address: ROUTER as Address,
      abi: ROUTER_ABI,
      functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
      args: [minOut, onchainPath, to, deadline],
      account,
      value: amountIn,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    return { quoteOut: amountOut, minOut, path: onchainPath, txHash, receipt };
  }

  // ---------- Token → Native ----------
  if (isNative(tokenOut)) {
    await approveIfNeeded(privKey, tokenIn, account.address as Address, amountIn);

    const txHash = await w.writeContract({
      address: ROUTER as Address,
      abi: ROUTER_ABI,
      functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
      args: [amountIn, minOut, onchainPath, to, deadline],
      account,
    });

    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
    return { quoteOut: amountOut, minOut, path: onchainPath, txHash, receipt };
  }

  // ---------- Token → Token ----------
  await approveIfNeeded(privKey, tokenIn, account.address as Address, amountIn);

  const txHash = await w.writeContract({
    address: ROUTER as Address,
    abi: ROUTER_ABI,
    functionName: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    args: [amountIn, minOut, onchainPath, to, deadline],
    account,
  });

  const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
  return { quoteOut: amountOut, minOut, path: onchainPath, txHash, receipt };
}
