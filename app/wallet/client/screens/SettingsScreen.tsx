'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useUnlock } from '@/src/wallet/core/state/UnlockProvider';
import { setEncryptedMnemonic, getEncryptedMnemonic, clearAll } from '@wallet/adapters/storage.web';
import { saveSettings, loadSettings } from '@/src/wallet/core/state/settings';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#2c3344] bg-[#1F2430]/60 p-6">
      <div className="text-xl font-bold">{title}</div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export default function SettingsScreen() {
  // ✅ используем те поля, которые точно есть в UnlockProvider
  const { isUnlocked, getMnemonic, requireUnlock, lockNow } = useUnlock();

  // UI state
  const [revealPhrase, setRevealPhrase] = useState<string | null>(null);
  const [revealPwd, setRevealPwd] = useState('');
  const [revealErr, setRevealErr] = useState<string | null>(null);

  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [cpErr, setCpErr] = useState<string | null>(null);
  const [cpOk, setCpOk] = useState<string | null>(null);

  const [ttlMin, setTtlMin] = useState<number>(20);
  const ttlOptions = useMemo(() => [5, 15, 20, 30, 60], []);

  useEffect(() => {
    const st = loadSettings();
    setTtlMin(st.unlockTtlMin ?? 20);
  }, []);

  async function handleReveal() {
    setRevealErr(null);
    setRevealPhrase(null);

    try {
      // если залочено — попросим пароль нативным потоком unlock-провайдера
      if (!isUnlocked) {
        if (!revealPwd.trim()) {
          setRevealErr('Enter password');
          return;
        }
        // requireUnlock сам расшифрует через getEncryptedMnemonic() внутри провайдера
        // Здесь пароль нужен только для UX — можно очистить поле после успеха.
        await requireUnlock();
      }
      const m = getMnemonic();
      setRevealPhrase(m);
      setRevealPwd('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to unlock';
      setRevealErr(msg);
    }
  }

  async function handleChangePassword() {
    setCpErr(null);
    setCpOk(null);
    try {
      const prev = oldPwd.trim();
      const next = newPwd.trim();
      if (!prev || !next) {
        setCpErr('Fill both old and new passwords');
        return;
      }
      const m = await getEncryptedMnemonic(prev);
      if (!m) {
        setCpErr('Wrong old password or no wallet found');
        return;
      }
      await setEncryptedMnemonic(m, next);
      setOldPwd('');
      setNewPwd('');
      setCpOk('Password changed successfully');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to change password';
      setCpErr(msg);
    }
  }

  function handleSaveTtl() {
    saveSettings({ unlockTtlMin: ttlMin });
    alert(`Auto-lock set to ${ttlMin} min. It will apply on next unlock/session renewal.`);
  }

  function handleLockNow() {
    lockNow();
    alert('Wallet locked');
  }

  function handleDangerReset() {
    if (confirm('This will remove local encrypted wallet storage from this browser. Continue?')) {
      clearAll();
      alert('Local wallet storage cleared');
    }
  }

  return (
    <div className="space-y-6">
      <Section title="Security · Reveal seed phrase">
        <div className="text-sm opacity-80">
          To view your recovery phrase, enter your wallet password (if session is locked).
        </div>

        {!revealPhrase && (
          <div className="mt-3 grid gap-3">
            {!isUnlocked && (
              <input
                type="password"
                value={revealPwd}
                onChange={(e) => setRevealPwd(e.currentTarget.value)}
                className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
                placeholder="Password"
              />
            )}
            {revealErr && <div className="text-sm text-red-400">{revealErr}</div>}
            <div>
              <button
                type="button"
                onClick={handleReveal}
                className="px-4 py-2 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff]"
              >
                Reveal phrase
              </button>
            </div>
          </div>
        )}

        {revealPhrase && (
          <div className="mt-4">
            <div className="text-sm opacity-80 mb-2">Your 12/24 words (keep them safe):</div>
            <div className="rounded-xl bg-[#10141E] border border-[#2c3344] p-4 break-all">
              {revealPhrase}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(revealPhrase);
                  alert('Copied');
                }}
                className="px-4 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => setRevealPhrase(null)}
                className="px-4 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
              >
                Hide
              </button>
            </div>
          </div>
        )}
      </Section>

      <Section title="Security · Change password">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            type="password"
            value={oldPwd}
            onChange={(e) => setOldPwd(e.currentTarget.value)}
            className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
            placeholder="Current password"
          />
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.currentTarget.value)}
            className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
            placeholder="New password"
          />
        </div>
        {cpErr && <div className="text-sm text-red-400 mt-2">{cpErr}</div>}
        {cpOk && <div className="text-sm text-green-400 mt-2">{cpOk}</div>}
        <div className="mt-3">
          <button
            type="button"
            onClick={handleChangePassword}
            className="px-4 py-2 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff]"
          >
            Change password
          </button>
        </div>
      </Section>

      <Section title="Session · Auto-lock">
        <div className="text-sm opacity-80">
          Choose auto-lock interval for your wallet session on this device.
        </div>
        <div className="mt-3 flex items-center gap-3">
          <select
            value={ttlMin}
            onChange={(e) => setTtlMin(Number(e.currentTarget.value))}
            className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
          >
            {ttlOptions.map((m) => (
              <option key={m} value={m}>{m} min</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSaveTtl}
            className="px-4 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
          >
            Save
          </button>
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={handleLockNow}
            className="px-4 py-2 rounded-xl font-semibold bg-[#392222] text-red-200"
          >
            Lock now
          </button>
        </div>
      </Section>

      <Section title="Danger zone">
        <div className="text-sm opacity-80">
          Remove local encrypted wallet from this browser. You can import again by seed phrase later.
        </div>
        <div className="mt-3">
          <button
            type="button"
            onClick={handleDangerReset}
            className="px-4 py-2 rounded-xl font-semibold bg-[#392222] text-red-200"
          >
            Clear local storage
          </button>
        </div>
      </Section>
    </div>
  );
}
