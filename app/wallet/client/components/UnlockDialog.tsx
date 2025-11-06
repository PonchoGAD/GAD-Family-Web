'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { useUnlock } from '@/src/wallet/core/state/UnlockProvider';
import { getEncryptedMnemonic } from '@wallet/adapters/storage.web';

type Props = {
  open: boolean;
  onCloseAction: () => void;
  onUnlockedAction?: () => void;
};

export default function UnlockDialog({ open, onCloseAction, onUnlockedAction }: Props) {
  const { setSession } = useUnlock();
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleUnlock() {
    setErr(null);
    if (!pwd.trim()) {
      setErr('Enter password');
      return;
    }
    setBusy(true);
    try {
      const m = await getEncryptedMnemonic(pwd.trim());
      if (!m) {
        setErr('Wrong password or no wallet found');
        return;
      }
      setSession(m);
      setPwd('');
      onUnlockedAction?.();
      onCloseAction();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to unlock';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Unlock wallet" widthClassName="max-w-sm">
      <div className="grid gap-3">
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.currentTarget.value)}
          placeholder="Password"
          className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
          autoFocus
        />
        {err && <div className="text-sm text-red-400">{err}</div>}
        <button
          type="button"
          onClick={handleUnlock}
          disabled={busy}
          className="px-4 py-3 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff] disabled:opacity-60"
        >
          {busy ? 'Unlocking…' : 'Unlock'}
        </button>
      </div>
    </Modal>
  );
}
