import type { Abi } from 'viem';

/** ERC-20 */
export const ERC20_ABI = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ name: 'balance', type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'uint8' }] },
  { type: 'function', name: 'name', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'string' }] },
  { type: 'function', name: 'symbol', stateMutability: 'view',
    inputs: [], outputs: [{ name: '', type: 'string' }] },
  { type: 'function', name: 'transfer', stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [] },
  { type: 'function', name: 'approve', stateMutability: 'nonpayable',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [] },
  { type: 'function', name: 'allowance', stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ name: 'remaining', type: 'uint256' }] },
] as const satisfies Abi;

/** Pancake V2 Router */
export const ROUTER_ABI = [
  { type: 'function', name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    stateMutability: 'payable',
    inputs: [
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ], outputs: [] },
  { type: 'function', name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ], outputs: [] },
  { type: 'function', name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'amountIn', type: 'uint256' },
      { name: 'amountOutMin', type: 'uint256' },
      { name: 'path', type: 'address[]' },
      { name: 'to', type: 'address' },
      { name: 'deadline', type: 'uint256' },
    ], outputs: [] },
] as const satisfies Abi;

/** Factory/Pair (для котировок) */
export const FACTORY_ABI = [
  { type: 'function', name: 'getPair', stateMutability: 'view',
    inputs: [{ name: 'tokenA', type: 'address' }, { name: 'tokenB', type: 'address' }],
    outputs: [{ name: 'pair', type: 'address' }] },
] as const satisfies Abi;

export const PAIR_ABI = [
  { type: 'function', name: 'getReserves', stateMutability: 'view', inputs: [],
    outputs: [
      { name: '_reserve0', type: 'uint112' },
      { name: '_reserve1', type: 'uint112' },
      { name: '_blockTimestampLast', type: 'uint32' },
    ] },
  { type: 'function', name: 'token0', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
  { type: 'function', name: 'token1', stateMutability: 'view', inputs: [], outputs: [{ name: '', type: 'address' }] },
] as const satisfies Abi;
