// src/wallet/core/services/seed.ts
import { mnemonicToAccount, generateMnemonic as viemGenerateMnemonic } from 'viem/accounts';
import { wordlist } from '@scure/bip39/wordlists/english';
import { toHex } from 'viem';

// 12/24 слов
export function generateMnemonic(words: 12 | 24 = 12): string {
  const strength = words === 24 ? 256 : 128; // 128 -> 12 слов, 256 -> 24
  return viemGenerateMnemonic(wordlist, strength);
}

// адрес по сид-фразе (index = 0..)
export function deriveAddressFromMnemonic(mnemonic: string, index = 0): string {
  const acc = mnemonicToAccount(mnemonic, { path: `m/44'/60'/0'/0/${index}` });
  return acc.address;
}

// приватный ключ по сид-фразе (index = 0..)
export function derivePrivKey(index: number, mnemonic: string): `0x${string}` {
  const acc = mnemonicToAccount(mnemonic, { path: `m/44'/60'/0'/0/${index}` });
  const pkBytes = acc.getHdKey().privateKey;
  if (!pkBytes) throw new Error('Failed to derive private key');
  return toHex(pkBytes) as `0x${string}`;
}

// чтобы где-то гарантировать наличие сид-фразы
export function ensureMnemonic(current: string | null | undefined): string {
  return current ?? generateMnemonic(12);
}
