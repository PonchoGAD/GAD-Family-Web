'use client';

import React, { useEffect, useState } from 'react';
import { Card, GButton } from '../components/UI';
import { TOKENS } from '@/src/wallet/core/services/constants';
import { quoteExactIn } from '@/src/wallet/core/services/quote';
import type { Address } from 'viem';
import { parseUnits, formatUnits } from 'viem';

// ✅ новый селектор токенов
import TokenSelect, { type TokenMeta } from '../components/TokenSelect';

// BNB → WBNB для пары/котировок
const WBNB_ADDR = TOKENS.WBNB.address as Address;

function toErc20Addr(token: TokenMeta): Address {
  if (token.address === 'BNB') return WBNB_ADDR; // маппим нативный BNB в WBNB
  return token.address as Address;
}

// тип входа из /api/tokenlist, чтобы не использовать any
type ApiToken = {
  address: string;
  symbol: string;
  name: string;
  decimals?: number;
  logoURI?: string;
};

export default function SwapScreen() {
  const [tokenList, setTokenList] = useState<TokenMeta[]>([]);
  const [fromToken, setFromToken] = useState<TokenMeta | null>(null);
  const [toToken, setToToken] = useState<TokenMeta | null>(null);
  const [amount, setAmount] = useState('');

  // загрузка списка токенов (локальный фоллбек через /api/tokenlist)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/tokenlist', { cache: 'no-store' });
        const data = await res.json();

        const list: TokenMeta[] = (data.tokens ?? []).map((t: ApiToken) => ({
          address: t.address === 'BNB' ? 'BNB' : (t.address as `0x${string}`),
          symbol: t.symbol,
          name: t.name,
          decimals: Number(t.decimals ?? 18),
          logoURI: t.logoURI ?? '',
        }));

        if (!alive) return;
        setTokenList(list);

        // дефолты — BNB → GAD, если ещё не выбрано
        if (!fromToken) {
          const bnb =
            list.find((x) => x.symbol?.toUpperCase() === 'BNB') ??
            ({
              address: 'BNB',
              symbol: 'BNB',
              name: 'BNB (Native)',
              decimals: 18,
              logoURI: '',
            } as TokenMeta);
          setFromToken(bnb);
        }
        if (!toToken) {
          const gad =
            list.find((x) => x.symbol?.toUpperCase() === 'GAD') ??
            ({
              address: TOKENS.GAD.address as `0x${string}`,
              symbol: 'GAD',
              name: 'GAD Family',
              decimals: 18,
              logoURI: '',
            } as TokenMeta);
          setToToken(gad);
        }
      } catch {
        // если вдруг API упало — дефолты выше всё равно выставятся
      }
    })();
    return () => {
      alive = false;
    };
  }, [fromToken, toToken]);

  const onQuote = async () => {
    if (!fromToken || !toToken) {
      alert('Select tokens first');
      return;
    }
    if (fromToken.address === toToken.address && fromToken.symbol === toToken.symbol) {
      alert('Tokens must be different');
      return;
    }

    const amt = amount.trim();
    if (!amt) {
      alert('Enter amount');
      return;
    }

    try {
      // amountIn → bigint с учётом decimals
      const amountIn = parseUnits(amt, fromToken.decimals);
      if (amountIn <= 0n) {
        alert('Enter a valid amount');
        return;
      }

      const aIn = toErc20Addr(fromToken);
      const aOut = toErc20Addr(toToken);

      const { amountOut } = await quoteExactIn(aIn, aOut, amountIn);
      const humanOut = formatUnits(amountOut, toToken.decimals);

      alert(`Quote\nYou'll get: ${humanOut} ${toToken.symbol}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Quote failed';
      alert(msg);
    }
  };

  return (
    <div className="max-w-xl">
      <Card title="Swap" subtitle="Quote & Execute">
        <div className="grid gap-3">
          <div className="text-sm opacity-70">From</div>
          <TokenSelect value={fromToken} tokens={tokenList} onChange={setFromToken} />

          <div className="text-sm opacity-70">To</div>
          <TokenSelect value={toToken} tokens={tokenList} onChange={setToToken} />

          <input
            value={amount}
            onChange={(e) => setAmount(e.currentTarget.value)}
            placeholder="Amount"
            className="bg-[#1F2430] rounded-xl px-3 py-3 outline-none border border-[#2c3344] mt-1"
            inputMode="decimal"
          />

          <div className="mt-2 flex gap-3">
            <GButton title="Get Quote" onClickAction={onQuote} />
            {/* Execute добавим после интеграции маршрутов и writeContract */}
          </div>
        </div>
      </Card>
    </div>
  );
}
