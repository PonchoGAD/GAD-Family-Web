import { createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc } from 'viem/chains';
import { ERC20_ABI } from './abi';
import { publicClient } from './bscClient';

const RPC = process.env.NEXT_PUBLIC_BSC_RPC_URL || 'https://bsc-dataseed.binance.org';

function makeWallet(privKey: `0x${string}`) {
  const account = privateKeyToAccount(privKey);
  const wallet = createWalletClient({ chain: bsc, transport: http(RPC), account });
  return { wallet, account };
}

export async function sendNative(privKey: `0x${string}`, to: Address, amountWei: string | bigint) {
  const { wallet, account } = makeWallet(privKey);
  const value = typeof amountWei === 'string' ? BigInt(amountWei) : amountWei;
  const hash = await wallet.sendTransaction({ account, to, value });
  await publicClient.waitForTransactionReceipt({ hash });
  return hash;
}

export async function sendERC20(
  privKey: `0x${string}`,
  token: Address,
  to: Address,
  amountWei: bigint
) {
  const { wallet, account } = makeWallet(privKey);
  const w = wallet as unknown as { writeContract: (p: unknown) => Promise<`0x${string}`> };

  const params = {
    address: token,
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [to, amountWei] as const,
    account,
  } as const;

  const txHash = await w.writeContract(params);
  await publicClient.waitForTransactionReceipt({ hash: txHash });
  return txHash;
}
