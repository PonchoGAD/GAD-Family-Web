// src/wallet/core/utils/safeAddresses.ts

// Нормализация адресов для ERC-20 вызовов (BNB/zero → WBNB)
export const WBNB: `0x${string}` = '0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

function isZeroAddress(a: string): boolean {
  return /^0x0{40}$/i.test(a);
}

/**
 * Приводит входной адрес токена к безопасному ERC-20 адресу:
 *  - 'BNB' или 0x000...000 → WBNB
 *  - иначе: нижний регистр, типизированный hex-адрес
 */
export function toErc20Address(addr: `0x${string}` | 'BNB'): `0x${string}` {
  if (addr === 'BNB') return WBNB;
  const lower = (addr as string).toLowerCase() as `0x${string}`;
  if (isZeroAddress(lower)) return WBNB;
  return lower;
}

// ─────────────────────────────────────────────────────────────────────────────
// Дополнение — безопасная нормализация получателя
// ─────────────────────────────────────────────────────────────────────────────
import { isAddress, getAddress } from 'viem';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Безопасная нормализация адреса получателя:
 * - режет пробелы
 * - запрещает псевдо-«адреса» типа 'BNB'/'NATIVE'
 * - валидирует через viem.isAddress
 * - возвращает checksummed адрес через viem.getAddress
 * - запрещает zero-address
 */
export function normalizeRecipient(input: string | `0x${string}`): `0x${string}` {
  const raw = String(input).trim();

  const lower = raw.toLowerCase();
  if (lower === 'bnb' || lower === 'native') {
    throw new Error("Recipient must be a valid EVM address (not 'BNB'/'NATIVE').");
  }

  if (!isAddress(raw)) {
    throw new Error('Invalid recipient address.');
  }

  const checksummed = getAddress(raw as `0x${string}`);
  if (checksummed.toLowerCase() === ZERO_ADDRESS) {
    throw new Error('Zero address is not allowed.');
  }

  return checksummed;
}
