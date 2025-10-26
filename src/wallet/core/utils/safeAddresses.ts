// src/wallet/core/utils/safeAddresses.ts
import { getAddress } from 'viem';
import { TOKENS, NATIVE, WBNB } from '../../../wallet/core/state/WalletStore'; // путь под твой алиас, оставь относительный если так надёжнее

type KnownSymbol = keyof typeof TOKENS; // 'BNB' | 'WBNB' | 'GAD' | 'USDT'

// ❗ Запрет на использование NATIVE в качестве адреса контракта/получателя,
// потому что это псевдо-адрес ТОЛЬКО для UI.
export function assertNotNativeTo(to: string): asserts to is `0x${string}` {
  if (to === NATIVE) {
    throw new Error('Native pseudo-address must not be used on-chain. Use a real 0x... address.');
  }
  if (!to.startsWith('0x')) {
    throw new Error('Recipient must be a valid on-chain address (0x...).');
  }
}

// ✅ Для случаев, когда нужен ERC-20 адрес токена
// - BNB/NATIVE → WBNB
// - Иначе: checksum-нормализация адреса токена
export function toErc20Address(input: KnownSymbol | `0x${string}`): `0x${string}` {
  if (typeof input === 'string' && input.toLowerCase() === 'bnb') {
    return WBNB as `0x${string}`;
  }
  if (input === NATIVE) {
    return WBNB as `0x${string}`;
  }
  if (input in TOKENS) {
    const token = TOKENS[input as KnownSymbol];
    if (token.address === NATIVE) {
      return WBNB as `0x${string}`;
    }
    return getAddress(token.address as `0x${string}`);
  }
  // Уже 0x-адрес — нормализуем
  return getAddress(input as `0x${string}`);
}

// 🧰 Удобно: нормализовать “что угодно” в корректный on-chain адрес отправки средств.
// Тут запрет на NATIVE — это адрес получателя для транзакций, его нельзя подменять.
export function normalizeRecipient(to: string): `0x${string}` {
  assertNotNativeTo(to);
  return getAddress(to as `0x${string}`);
}
