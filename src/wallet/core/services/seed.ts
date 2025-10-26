// src/wallet/core/services/seed.ts
import { mnemonicToAccount, generateMnemonic as viemGenerateMnemonic } from 'viem/accounts';
import { bytesToHex, toHex } from 'viem';

// 12/24 слов — используем дефолтный английский wordlist viem
export function generateMnemonic12(): string {
  return viemGenerateMnemonic(undefined, 128);
}

export function generateMnemonic24(): string {
  return viemGenerateMnemonic(undefined, 256);
}

export function privateKeyFromMnemonic(mnemonic: string): `0x${string}` {
  const acc = mnemonicToAccount(mnemonic);
  const pkBytes = acc.getHdKey().privateKey;
  if (!pkBytes) throw new Error('HD key does not expose a private key');
  return bytesToHex(pkBytes) as `0x${string}`;
}

// опционально: hex из строки (фиксированный size не обязателен)
export function toHexUtf8(s: string): `0x${string}` {
  return toHex(s) as `0x${string}`;
}
