'use client';
import { useEffect, useMemo, useState, useCallback } from 'react';
import type { Address } from 'viem';
import { publicClient } from '@/src/wallet/core/services/bscClient';
import { erc20BalanceOf } from '@/src/wallet/core/services/erc20';

export type TokenLike = {
  address: `0x${string}` | 'BNB';
  symbol: string;
  decimals: number;
};

export function useBalances(addr: Address | null, tokens: TokenLike[], pollMs = 12000) {
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState<Record<string, bigint>>({});

  const list = useMemo(() => tokens ?? [], [tokens]);

  // ✅ useCallback чтобы не пересоздавалась функция и ESLint был доволен
  const refetch = useCallback(async () => {
    if (!addr || !list.length) return;
    setLoading(true);
    try {
      const out: Record<string, bigint> = {};
      for (const t of list) {
        if (t.address === 'BNB') {
          const b = await publicClient.getBalance({ address: addr });
          out[t.symbol] = b;
        } else {
          const b = await erc20BalanceOf(t.address as `0x${string}`, addr);
          out[t.symbol] = b;
        }
      }
      setMap(out);
    } finally {
      setLoading(false);
    }
  }, [addr, list]);

  // первичный рефетч при изменении addr или токенов
  useEffect(() => {
    void refetch();
  }, [refetch]);

  // автопуллинг раз в pollMs
  useEffect(() => {
    if (!addr) return;
    const id = setInterval(refetch, pollMs);
    return () => clearInterval(id);
  }, [addr, pollMs, refetch]);

  return { loading, balances: map, refetch };
}
