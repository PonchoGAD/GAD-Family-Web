// src/wallet/core/services/seed.ts
import { mnemonicToAccount, generateMnemonic as viemGenerateMnemonic } from 'viem/accounts';
import { toHex } from 'viem';

export function generateMnemonic12(): string {
  // viem по умолчанию использует английский wordlist
  return viemGenerateMnemonic(undefined, 128);
}

export function generateMnemonic24(): string {
  return viemGenerateMnemonic(undefined, 256);
}

/** Вспомогательный интерфейс для доступа к HD-ключу без `any`. */
interface HdLike {
  getHdKey(): { privateKey: Uint8Array };
}

/**
 * Возвращает приватный ключ (`0x...`) из mnemonic.
 * Используем getHdKey() -> privateKey (Uint8Array) и toHex для конвертации.
 */
export function privateKeyFromMnemonic(mnemonic: string): `0x${string}` {
  const acc = mnemonicToAccount(mnemonic);
  const hdGetter = (acc as unknown as Partial<HdLike>).getHdKey;
  const hd = typeof hdGetter === 'function' ? hdGetter.call(acc) : undefined;
  const pk = hd?.privateKey;

  if (!pk) {
    throw new Error('Failed to derive private key from mnemonic');
  }

  return toHex(pk) as `0x${string}`;
}

/**
 * Минимальные совместимые API, используемые в приложении:
 * - derivePrivKey(index, mnemonic) -> приватный ключ
 * - deriveAddressFromMnemonic(mnemonic, index) -> адрес
 *
 * Текущая реализация игнорирует index (для простоты). При необходимости
 * можно расширить до полноценной HD-деривации.
 */

/** derive private key for given index (index currently not applied) */
export function derivePrivKey(index: number, mnemonic: string): `0x${string}` {
  void index; // индекс не используется в текущей реализации
  return privateKeyFromMnemonic(mnemonic);
}

/** derive address for given index (index currently not applied) */
export function deriveAddressFromMnemonic(mnemonic: string, index: number): `0x${string}` {
  void index;
  const acc = mnemonicToAccount(mnemonic);
  return acc.address as `0x${string}`;
}

/** ensure mnemonic: если передано валидное — вернуть, иначе сгенерировать новую */
export function ensureMnemonic(mnemonic?: string | null): string {
  if (mnemonic && typeof mnemonic === 'string' && mnemonic.trim().split(/\s+/).length >= 12) {
    return mnemonic;
  }
  return generateMnemonic12();
}

/** опционально: hex из одной строки (если где-то нужно) */
export function toHexUtf8(s: string): `0x${string}` {
  return toHex(s, { size: 32 }) as `0x${string}`;
}
