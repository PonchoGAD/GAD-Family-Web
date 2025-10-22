'use client';

import React from 'react';
import { Card, GButton } from '../components/UI';

export default function WalletHome({
  address,
  onSendAction,
  onReceiveAction,
  onSwapAction,
}: {
  address: `0x${string}`;
  onSendAction: () => void;
  onReceiveAction: () => void;
  onSwapAction: () => void;
}) {
  return (
    <Card title="GAD Wallet · Family" subtitle="Total Balance">
      {/* сюда можно вывести баланс по токенам, графики и т.п. */}

      {/* адрес кошелька (аккуратно под заголовком) */}
      {address && (
        <div className="text-sm opacity-70 break-all mt-1">{address}</div>
      )}

      {/* действия */}
      <div className="flex gap-2 mt-4">
        <GButton title="Send" onClickAction={onSendAction} />
        <GButton title="Receive" onClickAction={onReceiveAction} />
        <GButton title="Swap" onClickAction={onSwapAction} />
      </div>
    </Card>
  );
}
