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
export function toErc20Address(
  addr: `0x${string}` | 'BNB'
): `0x${string}` {
  if (addr === 'BNB') return WBNB;
  const lower = (addr as string).toLowerCase() as `0x${string}`;
  if (isZeroAddress(lower)) return WBNB;
  return lower;
}
