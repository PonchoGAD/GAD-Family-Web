'use client';

import React, { useState } from 'react';
import { Card, GButton } from '../components/UI';
import { TOKENS } from '@/src/wallet/core/services/constants';
import { quoteExactIn } from '@/src/wallet/core/services/quote';
import type { Address } from 'viem';

export default function SwapScreen() {
  const [from, setFrom] = useState<'BNB' | 'GAD'>('BNB');
  const [to, setTo] = useState<'BNB' | 'GAD'>('GAD');
  const [amount, setAmount] = useState('');

  const onQuote = async () => {
    const v = Number(String(amount).replace(',', '.'));
    if (!v || v <= 0) {
      alert('Enter a valid amount');
      return;
    }
    const inMeta = TOKENS[from];
    const outMeta = TOKENS[to];
    const decimals = inMeta.decimals;
    const aIn: Address = inMeta.address as Address;
    const aOut: Address = outMeta.address as Address;

    try {
      const res = await quoteExactIn(aIn, aOut, BigInt(Math.floor(v * 10 ** decimals)));
      alert(`Quote\nYou'll get: ${Number(res.amountOut) / 10 ** outMeta.decimals} ${to}`);
    } catch (e: unknown) {
  const msg = e instanceof Error ? e.message : 'Swap failed';
  alert(msg);
}

  };

  return (
    <div className="max-w-xl">
      <Card title="Swap" subtitle="Quote & Execute">
        <div className="grid gap-3">
          <div className="text-sm opacity-70">From</div>
          <div className="flex gap-3">
            <GButton title="BNB" onClickAction={() => setFrom('BNB')} />
            <GButton title="GAD" onClickAction={() => setFrom('GAD')} />
          </div>
          <div className="text-sm opacity-70">To</div>
          <div className="flex gap-3">
            <GButton title="BNB" onClickAction={() => setTo('BNB')} />
            <GButton title="GAD" onClickAction={() => setTo('GAD')} />
          </div>

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="bg-[#1F2430] rounded-xl px-3 py-3 outline-none border border-[#2c3344] mt-1"
            inputMode="decimal"
          />

          <div className="mt-2">
            <GButton title="Get Quote" onClickAction={onQuote} />
          </div>
        </div>
      </Card>
    </div>
  );
}
