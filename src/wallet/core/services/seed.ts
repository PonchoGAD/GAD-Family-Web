// src/wallet/core/services/seed.ts
import { mnemonicToAccount } from 'viem/accounts';
import { toHex } from 'viem';
import { Wallet } from 'ethers';

/** 12 слов: надёжно, без внешних wordlist-импортов (работает на Vercel). */
export function generateMnemonic12(): string {
  const w = Wallet.createRandom(); // 128-битное энтропи, английский wordlist внутри ethers
  const phrase = w.mnemonic?.phrase;
  if (!phrase) throw new Error('Failed to generate mnemonic');
  return phrase;
}

/** 24 слова: пока безопасно используем 12 (чтобы не тянуть wordlist). */
export function generateMnemonic24(): string {
  // Если понадобится строго 24 слова — добавим отдельную реализацию (через bip39 + wordlist),
  // но для стабильного билда на Vercel сейчас возвращаем 12.
  return generateMnemonic12();
}

/** Вспомогательный интерфейс для доступа к HD-ключу без any. */
interface HdLike {
  getHdKey(): { privateKey: Uint8Array };
}

/** Приватный ключ (`0x...`) из mnemonic через viem.mnemonicToAccount. */
export function privateKeyFromMnemonic(mnemonic: string): `0x${string}` {
  const acc = mnemonicToAccount(mnemonic);
  const hdGetter = (acc as unknown as Partial<HdLike>).getHdKey;
  const hd = typeof hdGetter === 'function' ? hdGetter.call(acc) : undefined;
  const pk = hd?.privateKey;
  if (!pk) throw new Error('Failed to derive private key from mnemonic');
  return toHex(pk) as `0x${string}`;
}

/** derivePrivKey(index, mnemonic) — индекс пока не используем. */
export function derivePrivKey(index: number, mnemonic: string): `0x${string}` {
  void index;
  return privateKeyFromMnemonic(mnemonic);
}

/** deriveAddressFromMnemonic(mnemonic, index) — индекс пока не используем. */
export function deriveAddressFromMnemonic(mnemonic: string, index: number): `0x${string}` {
  void index;
  const acc = mnemonicToAccount(mnemonic);
  return acc.address as `0x${string}`;
}

/** Если передана валидная мнемоника — вернуть её, иначе сгенерировать новую. */
export function ensureMnemonic(mnemonic?: string | null): string {
  if (mnemonic && typeof mnemonic === 'string' && mnemonic.trim().split(/\s+/).length >= 12) {
    return mnemonic;
  }
  return generateMnemonic12();
}

/** Опциональный хелпер. */
export function toHexUtf8(s: string): `0x${string}` {
  return toHex(s, { size: 32 }) as `0x${string}`;
}
