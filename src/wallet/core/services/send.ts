// src/wallet/core/services/send.ts
import {
  sendTransaction,
  waitForTransactionReceipt,
  writeContract,
  getAccount,
} from "@wagmi/core";
import { parseEther, parseUnits, type Abi, type Hash } from "viem";
import { config } from "@/app/nft/wagmi";
import { bsc } from "wagmi/chains";

/** Литеральный chainId для типов waitForTransactionReceipt */
const CHAIN_ID = 56 as const;

/** Минимальный ABI transfer(address,uint256) */
const ERC20_ABI = [
  {
    type: "function",
    name: "transfer",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const satisfies Abi;

/** Требуем подключённый аккаунт */
function requireAccount() {
  const acc = getAccount(config);
  if (!acc?.address) throw new Error("Wallet is not connected");
  return acc;
}

/* ===========================
 *   SEND NATIVE (BNB)
 * ===========================
 * 1) new:    sendNative(to, amountEthStr)
 * 2) legacy: sendNative(privKey, to, amountWeiStr)
 */
export async function sendNative(
  to: `0x${string}`,
  amountEth: string
): Promise<Hash>;
export async function sendNative(
  _privKey: string,
  to: `0x${string}`,
  amountWei: string
): Promise<Hash>;

// реализация — сразу после перегрузок
export async function sendNative(
  ...args: [string, string] | [string, string, string]
): Promise<Hash> {
  const acc = requireAccount();

  let to: `0x${string}`;
  let value: bigint;

  if (args.length === 3) {
    // legacy: (privKey, to, amountWei)
    to = args[1] as `0x${string}`;
    value = BigInt(args[2]);
  } else {
    // new: (to, amountEth)
    to = args[0] as `0x${string}`;
    value = parseEther(args[1]);
  }

  // В этой версии core для sendTransaction можно передать chain
  const hash = await sendTransaction(config, {
    to,
    value,
    account: acc.address,
    chain: bsc,
  });

  // А вот тут — строго chainId
  await waitForTransactionReceipt(config, {
    hash,
    chainId: CHAIN_ID,
  });

  return hash;
}

/* ===========================
 *   SEND ERC20
 * ===========================
 * 1) new:    sendERC20(token, to, amountHumanStr, decimals?)
 * 2) legacy: sendERC20(privKey, token, to, amountWeiBigint)
 */
export async function sendERC20(
  token: `0x${string}`,
  to: `0x${string}`,
  amountHuman: string,
  decimals?: number
): Promise<Hash>;
export async function sendERC20(
  _privKey: string,
  token: `0x${string}`,
  to: `0x${string}`,
  amountWei: bigint
): Promise<Hash>;

// реализация — сразу после перегрузок
export async function sendERC20(
  ...args:
    | [`0x${string}`, `0x${string}`, string, number?] // new
    | [string, `0x${string}`, `0x${string}`, bigint]  // legacy
): Promise<Hash> {
  const acc = requireAccount();

  const isLegacy = args.length === 4 && typeof args[3] === "bigint";

  let token: `0x${string}`;
  let to: `0x${string}`;
  let amount: bigint;

  if (isLegacy) {
    // legacy: (privKey, token, to, amountWei)
    token = args[1] as `0x${string}`;
    to = args[2] as `0x${string}`;
    amount = args[3] as bigint;
  } else {
    // new: (token, to, amountHumanStr, decimals?)
    token = args[0] as `0x${string}`;
    to = args[1] as `0x${string}`;
    const amountHuman = args[2] as string;
    const decimals = (args[3] as number | undefined) ?? 18;
    amount = parseUnits(amountHuman, decimals);
  }

  // Для writeContract в твоей версии типов нужны и account, и chain (именно chain, не chainId)
  const hash = await writeContract(config, {
    address: token,
    abi: ERC20_ABI,
    functionName: "transfer",
    args: [to, amount],
    account: acc.address,
    chain: bsc,
  });

  // Тут снова chainId
  await waitForTransactionReceipt(config, {
    hash,
    chainId: CHAIN_ID,
  });

  return hash;
}
