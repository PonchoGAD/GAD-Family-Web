// src/wallet/core/services/seed.ts
import { mnemonicToAccount, generateMnemonic as viemGenerateMnemonic } from 'viem/accounts';
import { toHex } from 'viem';

// 12/24 слов — viem по умолчанию использует английский wordlist.
// Передаём undefined, чтобы не импортировать списки слов явно.
export function generateMnemonic12(): string {
  return viemGenerateMnemonic(undefined as unknown as string[], 128);
}

export function generateMnemonic24(): string {
  return viemGenerateMnemonic(undefined as unknown as string[], 256);
}

export function privateKeyFromMnemonic(mnemonic: string): `0x${string}` {
  const acc = mnemonicToAccount(mnemonic);
  const hd = acc.getHdKey();
  const pk = hd.privateKey;
  if (!pk) throw new Error('Failed to derive private key from mnemonic');
  // pk — Uint8Array; превращаем в 0x-hex
  return toHex(pk);
}

// опционально: hex из одной строки (если где-то нужно)
export function toHexUtf8(s: string): `0x${string}` {
  return toHex(s, { size: 32 });
}
