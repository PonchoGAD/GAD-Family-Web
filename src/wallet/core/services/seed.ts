// src/wallet/core/services/seed.ts
import { mnemonicToAccount, generateMnemonic as viemGenerateMnemonic } from 'viem/accounts';
import { toHex } from 'viem';
import { wordlists } from '@scure/bip39'; // ✅ правильный импорт для Vercel

export function generateMnemonic12(): string {
  // Viem требует явный wordlist — используем английский
  return viemGenerateMnemonic(wordlists.english, 128);
}

export function generateMnemonic24(): string {
  return viemGenerateMnemonic(wordlists.english, 256);
}

/** Вспомогательный интерфейс для доступа к HD-ключу без any */
interface HdLike {
  getHdKey(): { privateKey: Uint8Array };
}

export function privateKeyFromMnemonic(mnemonic: string): `0x${string}` {
  const acc = mnemonicToAccount(mnemonic);
  const hdGetter = (acc as unknown as Partial<HdLike>).getHdKey;
  const hd = typeof hdGetter === 'function' ? hdGetter.call(acc) : undefined;
  const pk = hd?.privateKey;
  if (!pk) throw new Error('Failed to derive private key from mnemonic');
  return toHex(pk) as `0x${string}`;
}

export function derivePrivKey(index: number, mnemonic: string): `0x${string}` {
  void index;
  return privateKeyFromMnemonic(mnemonic);
}

export function deriveAddressFromMnemonic(mnemonic: string, index: number): `0x${string}` {
  void index;
  const acc = mnemonicToAccount(mnemonic);
  return acc.address as `0x${string}`;
}

export function ensureMnemonic(mnemonic?: string | null): string {
  if (mnemonic && typeof mnemonic === 'string' && mnemonic.trim().split(/\s+/).length >= 12) {
    return mnemonic;
  }
  return generateMnemonic12();
}

export function toHexUtf8(s: string): `0x${string}` {
  return toHex(s, { size: 32 }) as `0x${string}`;
}
