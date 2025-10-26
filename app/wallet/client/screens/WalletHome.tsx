'use client';

import React, { useMemo } from 'react';
import { Card, GButton } from '../components/UI';

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
  // TODO: заменить на реальные данные из стора/бекенда
  const balances = useMemo(
    () => [
      { symbol: 'BNB' as const, value: '0.0000', fiat: '$0.00' },
      { symbol: 'GAD' as const, value: '0',      fiat: '$0.00' },
      { symbol: 'USDT' as const, value: '0.00',  fiat: '$0.00' },
    ],
    []
  );

  // Демонстрационный список (замените при подключении RPC/индексера)
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

        {/* быстрые действия */}
        <div className="flex gap-2 mt-4">
          <GButton title="Send" onClickAction={onSendAction} />
          <GButton title="Receive" onClickAction={onReceiveAction} />
          <GButton title="Swap" onClickAction={onSwapAction} />
        </div>
      </Card>

      {/* balances */}
      <Card title="Balances" subtitle="BNB · GAD · USDT">
        <div className="grid sm:grid-cols-3 gap-3">
          {balances.map((b) => (
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

      {/* recent activity */}
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
