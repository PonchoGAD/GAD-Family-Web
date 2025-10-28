// src/wallet/core/services/seed.ts
import { mnemonicToAccount, generateMnemonic as viemGenerateMnemonic } from 'viem/accounts';
import { toHex } from 'viem';

export function generateMnemonic12(): string {
  // без явного wordlist — viem берёт дефолтный (английский)
  return viemGenerateMnemonic(undefined, 128);
}

export function generateMnemonic24(): string {
  return viemGenerateMnemonic(undefined, 256);
}

/** Вспомогательный интерфейс для доступа к HD-ключу без `any`. */
interface HdLike {
  getHdKey(): { privateKey: Uint8Array };
}

/** Приватный ключ из mnemonic */
export function privateKeyFromMnemonic(mnemonic: string): `0x${string}` {
  const acc = mnemonicToAccount(mnemonic);
  const hdGetter = (acc as unknown as Partial<HdLike>).getHdKey;
  const hd = typeof hdGetter === 'function' ? hdGetter.call(acc) : undefined;
  const pk = hd?.privateKey;
  if (!pk) throw new Error('Failed to derive private key from mnemonic');
  return toHex(pk) as `0x${string}`;
}

/** derivePrivKey(index не используется в текущей реализации) */
export function derivePrivKey(index: number, mnemonic: string): `0x${string}` {
  void index;
  return privateKeyFromMnemonic(mnemonic);
}

/** deriveAddressFromMnemonic (index не используется) */
export function deriveAddressFromMnemonic(mnemonic: string, index: number): `0x${string}` {
  void index;
  const acc = mnemonicToAccount(mnemonic);
  return acc.address as `0x${string}`;
}

/** ensureMnemonic: если есть валидная — вернуть, иначе сгенерировать */
export function ensureMnemonic(mnemonic?: string | null): string {
  if (mnemonic && typeof mnemonic === 'string' && mnemonic.trim().split(/\s+/).length >= 12) {
    return mnemonic;
  }
  return generateMnemonic12();
}

/** опционально: hex из строки фиксированного размера */
export function toHexUtf8(s: string): `0x${string}` {
  return toHex(s, { size: 32 }) as `0x${string}`;
}
