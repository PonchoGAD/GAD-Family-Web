'use client';

import React, { useMemo, useState } from 'react';
import WalletHome from './screens/WalletHome';
import SendScreen from './screens/SendScreen';
import ReceiveScreen from './screens/ReceiveScreen';
import SwapScreen from './screens/SwapScreen';
import type { Address } from 'viem';
import { deriveAddressFromMnemonic, generateMnemonic12 } from '@wallet/core/services/seed';
import { getEncryptedMnemonic, setEncryptedMnemonic, clearAll } from '@wallet/adapters/storage.web';

type Tab = 'Wallet' | 'Send' | 'Receive' | 'Swap';
type Stage = 'landing' | 'create-step1' | 'create-step2' | 'open' | 'dashboard';

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
      <a href="#" style={{ background: '#0A84FF', color: '#fff', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
        iOS — soon
      </a>
      <a href="#" style={{ background: '#0A84FF', color: '#fff', padding: '8px 12px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
        Android — soon
      </a>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('Wallet');

  // Onboarding state
  const [stage, setStage] = useState<Stage>('landing');
  const [walletName, setWalletName] = useState<string>('');
  const [mnemonic, setMnemonic] = useState<string>('');
  const [confirmStored, setConfirmStored] = useState<boolean>(false);

  // Active wallet state
  const [address, setAddress] = useState<Address | null>(null);

  // Reset action
  const DangerReset = useMemo(
    () => () => {
      clearAll();
      localStorage.removeItem('walletName');
      location.reload();
    },
    []
  );

  // Handlers: Landing
  function createNewWalletAction() {
    setWalletName('');
    setConfirmStored(false);
    setMnemonic('');
    setStage('create-step1');
  }

  // ✅ устойчивый вариант на async/await
  async function openExistingWalletAction() {
    const pwd = window.prompt('Enter your wallet password');
    if (!pwd) return;

    try {
      const m = await getEncryptedMnemonic(pwd);
      if (!m) {
        window.alert('Wrong password or no wallet found');
        return;
      }
      const addr = deriveAddressFromMnemonic(m, 0) as Address;
      setMnemonic(m);
      setAddress(addr);
      const savedName = localStorage.getItem('walletName') || 'My Wallet';
      setWalletName(savedName);
      setStage('dashboard');
      console.debug('[Wallet] stage -> dashboard (open existing)');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to open wallet';
      window.alert(msg);
    }
  }

  // Handlers: Create (Step 1)
  function continueFromStep1Action() {
    const name = walletName.trim();
    if (!name) {
      window.alert('Please enter a wallet name');
      return;
    }

    try {
      const m12 = generateMnemonic12();
      if (!m12 || typeof m12 !== 'string' || m12.trim().split(/\s+/).length < 12) {
        window.alert('Failed to generate recovery phrase. Please try again.');
        return;
      }
      setMnemonic(m12);
      setStage('create-step2');
      console.debug('[Wallet] stage -> create-step2');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unexpected error on mnemonic generation';
      console.error('[Wallet] continueFromStep1Action error:', e);
      window.alert(msg);
    }
  }

  // Handlers: Create (Step 2)
  function copyMnemonicAction() {
    navigator.clipboard
      .writeText(mnemonic)
      .then(() => window.alert('Copied'))
      .catch(() => window.alert('Copy failed'));
  }

  // ✅ защита от пустой mnemonic + нормализация имени
  async function finalizeCreateAction() {
    if (!confirmStored) {
      window.alert('Please confirm that you have safely stored your 12-word phrase');
      return;
    }
    let name = walletName.trim();
    if (!name) name = 'My Wallet';

    let m = (mnemonic ?? '').trim();
    if (!m || m.split(/\s+/).length < 12) {
      try {
        m = generateMnemonic12();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to generate recovery phrase';
        window.alert(msg);
        return;
      }
      setMnemonic(m);
    }

    const pwd = window.prompt('Set a password to encrypt your wallet');
    if (!pwd) return;

    try {
      await setEncryptedMnemonic(m, pwd);
      localStorage.setItem('walletName', name);
      const addr = deriveAddressFromMnemonic(m, 0) as Address;
      setAddress(addr);
      setWalletName(name);
      setStage('dashboard');
      console.debug('[Wallet] stage -> dashboard (created)');
      window.alert('Wallet created successfully. Keep your 12 words safe!');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to create wallet';
      window.alert(msg);
    }
  }

  // UI blocks
  function TopBar() {
    return (
      <div className="sticky top-0 z-10 bg-[#0B0C10] border-b border-[#222]">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-extrabold">GAD Wallet</div>

          {stage === 'dashboard' && (
            <div className="flex gap-2">
              {(['Wallet', 'Send', 'Receive', 'Swap'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    tab === t ? 'bg-[#0A84FF]' : 'bg-[#1F2430] hover:bg-[#242a39]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <button type="button" onClick={DangerReset} className="px-3 py-2 rounded-lg bg-[#392222] text-red-200">
            reset
          </button>
        </div>
      </div>
    );
  }

  function Landing() {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-white">
        <DownloadBanner />
        <div className="rounded-2xl border border-[#2c3344] bg-[#1F2430]/60 p-6">
          <div className="text-2xl font-extrabold">Welcome to GAD Wallet</div>
          <div className="opacity-80 mt-1">A self-custody wallet for BSC (BNB). Save your 12 words securely.</div>

          <div className="grid sm:grid-cols-2 gap-3 mt-6">
            <button
              type="button"
              onClick={createNewWalletAction}
              className="px-4 py-3 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff]"
            >
              Create new wallet
            </button>
            <button
              type="button"
              onClick={openExistingWalletAction}
              className="px-4 py-3 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
            >
              Open existing
            </button>
          </div>
        </div>
      </div>
    );
  }

  function CreateStep1() {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-white">
        <div className="rounded-2xl border border-[#2c3344] bg-[#1F2430]/60 p-6">
          <div className="text-2xl font-extrabold">Step 1 — Name your wallet</div>
          <div className="opacity-80 mt-1">You can change it later.</div>

          <input
            value={walletName}
            onChange={(e) => setWalletName(e.currentTarget.value)}
            className="mt-5 w-full bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
            placeholder="Wallet name"
            autoFocus
          />

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setStage('landing')}
              className="px-4 py-3 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={continueFromStep1Action}
              className="px-4 py-3 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff]"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  function CreateStep2() {
    const words = (mnemonic || '').trim() ? mnemonic.trim().split(/\s+/) : [];
    return (
      <div className="max-w-5xl mx-auto px-4 py-10 text-white">
        <div className="rounded-2xl border border-[#2c3344] bg-[#1F2430]/60 p-6">
          <div className="text-2xl font-extrabold">Step 2 — Your 12-word recovery phrase</div>
          <div className="opacity-80 mt-1">Write these words down in order and keep them in a safe place.</div>

          <div className="grid sm:grid-cols-3 gap-2 mt-5">
            {words.map((w, i) => (
              <div
                key={i}
                className="rounded-lg bg-[#10141E] border border-[#2c3344] px-3 py-2 flex items-center gap-2"
              >
                <div className="opacity-60 text-sm w-6">{i + 1}.</div>
                <div className="font-mono">{w}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={copyMnemonicAction}
              className="px-4 py-3 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
            >
              Copy phrase
            </button>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmStored}
                onChange={(e) => setConfirmStored(e.target.checked)}
              />
              <span className="text-sm">I have safely stored my 12-word phrase</span>
            </label>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              type="button"
              onClick={() => setStage('create-step1')}
              className="px-4 py-3 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
            >
              Back
            </button>
            <button
              type="button"
              onClick={finalizeCreateAction}
              className="px-4 py-3 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff]"
            >
              Create wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  function Dashboard() {
    if (!address) {
      return (
        <div className="w-full h-[60vh] flex items-center justify-center text-white">
          Initializing wallet…
        </div>
      );
    }
    return (
      <div className="max-w-5xl mx-auto px-4 py-6">
        <DownloadBanner />
        {tab === 'Wallet' && (
          <WalletHome
            walletName={walletName || 'My Wallet'}
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
    );
  }

  return (
    <div className="min-h-[100dvh] text-white">
      <TopBar />
      {stage === 'landing' && <Landing />}
      {stage === 'create-step1' && <CreateStep1 />}
      {stage === 'create-step2' && <CreateStep2 />}
      {stage === 'open' && <Landing />}
      {stage === 'dashboard' && <Dashboard />}
    </div>
  );
}
