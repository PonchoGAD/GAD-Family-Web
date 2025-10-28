'use client';

import React, { useState } from 'react';
import { Card, GButton } from '../components/UI';
import type { Address } from 'viem';

import { toWei } from '@/src/wallet/core/services/bscClient';
import { sendNative, sendERC20 } from '@/src/wallet/core/services/send';
import { TOKENS } from '@/src/wallet/core/services/constants';
import { derivePrivKey } from '@/src/wallet/core/services/seed';

// 🔒 берём одноразовую разблокировку вместо prompt()
import { useUnlock } from '@/src/wallet/core/state/UnlockProvider';

export default function SendScreen() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState<'BNB' | 'GAD' | 'USDT'>('BNB');

  const { requireUnlock, getMnemonic } = useUnlock();

  async function handleSend() {
    // единообразная разблокировка (если уже разблокировано — просто вернётся)
    await requireUnlock();
    const m = getMnemonic();
    const pk = derivePrivKey(0, m) as `0x${string}`;

    if (!recipient || !/^0x[0-9a-fA-F]{40}$/.test(recipient))
      return alert('Enter a valid recipient address');

    const v = Number(String(amount).replace(',', '.'));
    if (!v || v <= 0) return alert('Enter a valid amount');

    const tokenMeta = TOKENS[tokenSymbol];
    const decimals = tokenSymbol === 'BNB' ? 18 : tokenMeta.decimals;
    const tokenAddr = tokenMeta.address as Address;
    const wei = toWei(String(v), decimals);

    try {
      if (tokenSymbol === 'BNB') {
        const tx = await sendNative(pk, recipient as Address, wei.toString());
        alert(`Sent ${amount} ${tokenSymbol}\nTx: ${tx}`);
      } else {
        const tx = await sendERC20(pk, tokenAddr, recipient as Address, wei);
        alert(`Sent ${amount} ${tokenSymbol}\nTx: ${tx}`);
      }
      setAmount('');
      setRecipient('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to send';
      alert(msg);
    }
  }

  return (
    <Card title="Send Tokens" className="max-w-xl">
      <div className="grid gap-2">
        <label className="text-sm opacity-80">Token (BNB / GAD / USDT):</label>
        <input
          value={tokenSymbol}
          onChange={(e) => {
            const up = e.target.value.toUpperCase() as 'BNB' | 'GAD' | 'USDT';
            if (up === 'BNB' || up === 'GAD' || up === 'USDT') setTokenSymbol(up);
          }}
          className="bg-[#1F2430] rounded-xl px-3 py-3 outline-none border border-[#2c3344]"
          placeholder="BNB"
        />

        <label className="text-sm opacity-80 mt-2">Recipient:</label>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="bg-[#1F2430] rounded-xl px-3 py-3 outline-none border border-[#2c3344]"
          placeholder="0x..."
        />

        <label className="text-sm opacity-80 mt-2">Amount:</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="bg-[#1F2430] rounded-xl px-3 py-3 outline-none border border-[#2c3344]"
          placeholder="0.0"
          inputMode="decimal"
        />

        <div className="mt-4">
          <GButton title="Send" onClickAction={handleSend} />
        </div>
      </div>
    </Card>
  );
}
