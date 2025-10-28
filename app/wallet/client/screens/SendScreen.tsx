'use client';

import React, { useEffect, useState } from 'react';
import { Card, GButton } from '../components/UI';
import type { Address } from 'viem';
import { parseUnits } from 'viem';

import { sendNative, sendERC20 } from '@/src/wallet/core/services/send';
import { TOKENS } from '@/src/wallet/core/services/constants';
import { derivePrivKey } from '@/src/wallet/core/services/seed';

// 🔓 20-минутная сессия разблокировки
import { useUnlock } from '@/src/wallet/core/state/UnlockProvider';

// Выпадающий список токенов
import TokenSelect, { type TokenMeta } from '../components/TokenSelect';

// Тип данных токена, возвращаемого из API
type ApiToken = {
  address: string;
  symbol: string;
  name: string;
  decimals?: number;
  logoURI?: string;
};

export default function SendScreen() {
  const { requireUnlock, getMnemonic } = useUnlock();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [privKey, setPrivKey] = useState<`0x${string}` | null>(null);

  // список токенов и выбранный токен
  const [tokenList, setTokenList] = useState<TokenMeta[]>([]);
  const [selected, setSelected] = useState<TokenMeta | null>(null);

  // Подтянуть mnemonic один раз (если нет активной сессии — спросит пароль)
  useEffect(() => {
    (async () => {
      try {
        await requireUnlock(); // один раз на 20 мин
        const m = getMnemonic();
        if (!m) return;
        const pk = derivePrivKey(0, m);
        setPrivKey(pk as `0x${string}`);
      } catch (e) {
        console.error('Unlock failed:', e);
        alert(e instanceof Error ? e.message : 'Failed to unlock wallet');
      }
    })();
  }, [requireUnlock, getMnemonic]);

  // Подгружаем список токенов (локальный API) и ставим дефолт — BNB
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/tokenlist', { cache: 'no-store' });
        const data = await res.json();

        const list: TokenMeta[] = (data.tokens ?? []).map((t: ApiToken) => ({
          address: t.address === 'BNB' ? 'BNB' : (t.address as `0x${string}`),
          symbol: String(t.symbol),
          name: String(t.name ?? t.symbol),
          decimals: Number(t.decimals ?? 18),
          logoURI: String(t.logoURI ?? ''),
        }));

        if (!alive) return;
        setTokenList(list);

        // дефолт — BNB
        const bnb =
          list.find((x) => x.symbol?.toUpperCase() === 'BNB') ??
          ({
            address: 'BNB',
            symbol: 'BNB',
            name: 'BNB (Native)',
            decimals: 18,
            logoURI: '',
          } as TokenMeta);
        setSelected((prev) => prev ?? bnb);
      } catch (e) {
        console.warn('tokenlist fetch failed:', e);
        // если API недоступно — fallback список
        const fallback: TokenMeta[] = [
          {
            address: 'BNB' as const,
            symbol: 'BNB',
            name: 'BNB (Native)',
            decimals: 18,
            logoURI: '',
          },
          {
            address: TOKENS.GAD.address as `0x${string}`,
            symbol: 'GAD',
            name: 'GAD Family',
            decimals: 18,
            logoURI: '',
          },
          {
            address: TOKENS.USDT.address as `0x${string}`,
            symbol: 'USDT',
            name: 'Tether USD',
            decimals: 18,
            logoURI: '',
          },
        ];
        setTokenList(fallback);
        setSelected((prev) => prev ?? fallback[0]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSend() {
    if (!privKey) return alert('Wallet is not ready');

    if (!recipient || !/^0x[0-9a-fA-F]{40}$/.test(recipient)) {
      return alert('Enter a valid recipient address');
    }

    const amtStr = String(amount).replace(',', '.').trim();
    if (!amtStr) return alert('Enter a valid amount');

    if (!selected) return alert('Select a token');
    const decimals = Number(selected.decimals ?? 18);

    try {
      if (selected.address === 'BNB') {
        const amountWei = parseUnits(amtStr, 18);
        const tx = await sendNative(privKey, recipient as Address, amountWei.toString());
        alert(`Sent ${amtStr} BNB\nTx: ${tx}`);
      } else {
        const tokenAddr = selected.address as `0x${string}`;
        const amountWei = parseUnits(amtStr, decimals);
        const tx = await sendERC20(privKey, tokenAddr, recipient as Address, amountWei);
        alert(`Sent ${amtStr} ${selected.symbol}\nTx: ${tx}`);
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
        <label className="text-sm opacity-80">Token:</label>
        <TokenSelect value={selected} tokens={tokenList} onChange={setSelected} />

        <label className="text-sm opacity-80 mt-2">Recipient:</label>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.currentTarget.value)}
          className="bg-[#1F2430] rounded-xl px-3 py-3 outline-none border border-[#2c3344]"
          placeholder="0x..."
        />

        <label className="text-sm opacity-80 mt-2">Amount:</label>
        <input
          value={amount}
          onChange={(e) => setAmount(e.currentTarget.value)}
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
