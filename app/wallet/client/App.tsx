'use client';

import React, { useEffect, useMemo, useState } from 'react';
import WalletHome from './screens/WalletHome';
import SendScreen from './screens/SendScreen';
import ReceiveScreen from './screens/ReceiveScreen';
import SwapScreen from './screens/SwapScreen';
import type { Address } from 'viem';
import { deriveAddressFromMnemonic, ensureMnemonic } from '@wallet/core/services/seed';

import { getEncryptedMnemonic, setEncryptedMnemonic, clearAll } from '@wallet/adapters/storage.web';

type Tab = 'Wallet' | 'Send' | 'Receive' | 'Swap';

function DownloadBanner() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8px 12px',
        background: 'linear-gradient(90deg, rgba(10,132,255,0.12), rgba(212,175,55,0.06))',
        borderRadius: 12,
        margin: '12px 0',
      }}
    >
      <div style={{ fontWeight: 700 }}>Download Wallet</div>
      <a href="#" style={{ background: '#0A84FF', color: '#fff', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>iOS — soon</a>
      <a href="#" style={{ background: '#0A84FF', color: '#fff', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>Android — soon</a>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Wallet');
  const [mnemo, setMnemo] = useState<string | null>(null);
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    (async () => {
      const password = prompt('Enter your wallet password (new or existing)');
      if (!password) return alert('Password required');

      let m = await getEncryptedMnemonic(password);
      if (!m) {
        m = ensureMnemonic(null);
        await setEncryptedMnemonic(m, password);
        alert('New wallet created! Save your 12 words safely.');
      }

      setMnemo(m);
      setAddress(deriveAddressFromMnemonic(m, 0) as Address);
    })();
  }, []);

  const DangerReset = useMemo(() => () => {
    clearAll();
    location.reload();
  }, []);

  if (!mnemo || !address) {
    return <div className="w-full h-[60vh] flex items-center justify-center text-white">Initializing wallet…</div>;
  }

  return (
    <div className="min-h-[100dvh] text-white">
      <div className="sticky top-0 z-10 bg-[#0B0C10] border-b border-[#222]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-extrabold">GAD Wallet</div>
          <div className="flex gap-2">
            {(['Wallet', 'Send', 'Receive', 'Swap'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-xl font-semibold ${tab === t ? 'bg-[#0A84FF]' : 'bg-[#1F2430] hover:bg-[#242a39]'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={DangerReset} className="px-3 py-2 rounded-lg bg-[#392222] text-red-200">reset</button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <DownloadBanner />
        {tab === 'Wallet' && (
          <WalletHome
            address={address}
            onSendAction={() => setTab('Send')}
            onReceiveAction={() => setTab('Receive')}
            onSwapAction={() => setTab('Swap')}
          />
        )}
        {tab === 'Send' && <SendScreen />}
        {tab === 'Receive' && <ReceiveScreen />}
        {tab === 'Swap' && <SwapScreen />}
      </div>
    </div>
  );
}
