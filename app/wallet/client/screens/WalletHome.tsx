'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Card, GButton } from '../components/UI';
import type { Address } from 'viem';
import { formatUnits } from 'viem';
import { useBalances, type TokenLike } from '@/src/wallet/core/state/useBalances';

// минимальный тип токена для UI (совместим с useBalances)
type Activity = {
  hash: string;
  type: 'Send' | 'Receive' | 'Swap';
  token: 'BNB' | 'GAD' | 'USDT';
  amount: string;        // человекочитаемо
  counterparty: `0x${string}`;
  time: string;          // ISO или краткая строка
};

export default function WalletHome({
  walletName,
  address,
  onSendAction,
  onReceiveAction,
  onSwapAction,
}: {
  walletName?: string;
  address: `0x${string}`;
  onSendAction: () => void;
  onReceiveAction: () => void;
  onSwapAction: () => void;
}) {
  // ---- 1) подтягиваем токен-лист (локальный API, с фоллбеком) ----
  const [allTokens, setAllTokens] = useState<TokenLike[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/tokenlist', { cache: 'no-store' });
        const data = await res.json();
        const list: TokenLike[] = (data.tokens ?? []).map((t: unknown) => {
          const tt = t as {
            address: string;
            symbol: string;
            decimals?: number;
            name?: string;
          };
          // допускаем нативный BNB как строку 'BNB'
          const addr = tt.address === 'BNB' ? 'BNB' : (tt.address as `0x${string}`);
          return {
            address: addr,
            symbol: tt.symbol,
            decimals: Number(tt.decimals ?? 18),
          };
        });

        if (!alive) return;

        // нам для главного экрана нужны минимум BNB/GAD/USDT
        const pick = (sym: string): TokenLike | null =>
          list.find((x) => x.symbol?.toUpperCase() === sym.toUpperCase()) ?? null;

        const bnb =
          pick('BNB') ?? ({ address: 'BNB', symbol: 'BNB', decimals: 18 } as const);
        const gad =
          pick('GAD') ??
          ({ address: '0x858bab88A5b8d7f29a40380C5F2D8d0b8812FE62', symbol: 'GAD', decimals: 18 } as const);
        const usdt =
          pick('USDT') ??
          ({ address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18 } as const);

        setAllTokens([bnb, gad, usdt]);
      } catch {
        // на случай падения API — строгий фоллбек
        setAllTokens([
          { address: 'BNB', symbol: 'BNB', decimals: 18 },
          { address: '0x858bab88A5b8d7f29a40380C5F2D8d0b8812FE62', symbol: 'GAD', decimals: 18 },
          { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', decimals: 18 },
        ]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ---- 2) авто-балансы раз в 12 сек (+ ручной рефреш) ----
  const { loading, balances, refetch } = useBalances(address as Address, allTokens, 12_000);

  // ---- 3) форматирование для карточек ----
  const cards = useMemo(() => {
    return allTokens.map((t) => {
      const raw = balances[t.symbol] ?? 0n;
      const human = formatUnits(raw, t.decimals);
      // простая усечённая строка
      const view =
        Number.isFinite(Number(human)) && Number(human) < 0.000001
          ? '0'
          : Number(human).toLocaleString(undefined, {
              maximumFractionDigits: 6,
            });
      return { symbol: t.symbol as 'BNB' | 'GAD' | 'USDT', value: view, fiat: '$0.00' };
    });
  }, [allTokens, balances]);

  // демо-активность (оставляю как была)
  const activity: Activity[] = useMemo(
    () => [
      {
        hash: '0xaaa...111',
        type: 'Receive',
        token: 'BNB',
        amount: '0.12',
        counterparty: '0x1234567890abcdef1234567890abcdef12345678',
        time: '2025-01-01 12:04',
      },
      {
        hash: '0xbbb...222',
        type: 'Send',
        token: 'GAD',
        amount: '1,000,000',
        counterparty: '0xabcdefabcdefabcdefabcdefabcdefabcd000001',
        time: '2025-01-01 10:31',
      },
      {
        hash: '0xccc...333',
        type: 'Swap',
        token: 'USDT',
        amount: '25.00',
        counterparty: '0x0000000000000000000000000000000000000000',
        time: '2025-01-01 09:12',
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <Card title={walletName ? `GAD Wallet · ${walletName}` : 'GAD Wallet · Family'} subtitle="Total Balance">
        {/* адрес кошелька */}
        {address && (
          <div className="text-sm opacity-80 break-all mt-1">
            {address}{' '}
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(address)}
              className="ml-2 text-xs px-2 py-1 rounded bg-[#10141E] border border-[#2c3344] hover:bg-[#172030]"
              title="Copy address"
            >
              Copy
            </button>
          </div>
        )}

        {/* быстрые действия + ручной рефреш */}
        <div className="flex flex-wrap gap-2 mt-4">
          <GButton title="Send" onClickAction={onSendAction} />
          <GButton title="Receive" onClickAction={onReceiveAction} />
          <GButton title="Swap" onClickAction={onSwapAction} />
          <button
            type="button"
            onClick={refetch}
            className="px-3 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
            title="Refresh balances"
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </Card>

      {/* balances */}
      <Card title="Balances" subtitle="BNB · GAD · USDT">
        <div className="grid sm:grid-cols-3 gap-3">
          {cards.map((b) => (
            <div
              key={b.symbol}
              className="rounded-xl bg-[#10141E] border border-[#2c3344] p-4 flex items-center justify-between"
            >
              <div>
                <div className="text-sm opacity-70">{b.symbol}</div>
                <div className="text-xl font-extrabold">{b.value}</div>
              </div>
              <div className="opacity-70 text-sm">{b.fiat}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* recent activity (как было) */}
      <Card title="Recent activity" subtitle="Latest 3 operations">
        <div className="divide-y divide-[#2c3344]">
          {activity.map((tx) => (
            <div key={tx.hash} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    tx.type === 'Send'
                      ? 'bg-[#392222] text-red-200'
                      : tx.type === 'Receive'
                      ? 'bg-[#233922] text-green-200'
                      : 'bg-[#223339] text-cyan-200'
                  }`}
                >
                  {tx.type}
                </span>
                <div className="truncate">
                  <div className="text-sm">
                    {tx.amount} {tx.token}
                  </div>
                  <div className="text-xs opacity-70 truncate">
                    {tx.type === 'Receive' ? 'from' : tx.type === 'Send' ? 'to' : 'via'}{' '}
                    {tx.counterparty.slice(0, 8)}…{tx.counterparty.slice(-6)}
                  </div>
                </div>
              </div>
              <div className="text-xs opacity-70 ml-3">{tx.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
