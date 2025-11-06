'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { setEncryptedMnemonic } from '@wallet/adapters/storage.web';
import { useUnlock } from '@/src/wallet/core/state/UnlockProvider';
import { deriveAddressFromMnemonic } from '@/src/wallet/core/services/seed';
import type { Address } from 'viem';

type Props = {
  open: boolean;
  onCloseAction: () => void;
  onImportedAction?: (addr: Address) => void;
};

function normalizeMnemonic(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export default function SeedImportDialog({ open, onCloseAction, onImportedAction }: Props) {
  const { setSession } = useUnlock();
  const [seed, setSeed] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleImport() {
    setErr(null);
    const m = normalizeMnemonic(seed);
    const words = m.split(' ').filter(Boolean);
    if (words.length !== 12 && words.length !== 24) {
      setErr('Seed phrase must be 12 or 24 words');
      return;
    }
    if (!pwd.trim()) {
      setErr('Set a password to encrypt your wallet');
      return;
    }
    setBusy(true);
    try {
      await setEncryptedMnemonic(m, pwd.trim());
      setSession(m);
      const addr = deriveAddressFromMnemonic(m, 0) as Address;
      onImportedAction?.(addr);
      setSeed('');
      setPwd('');
      onCloseAction();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to import seed';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Import by seed phrase" widthClassName="max-w-lg">
      <div className="grid gap-3">
        <textarea
          value={seed}
          onChange={(e) => setSeed(e.currentTarget.value)}
          rows={4}
          placeholder="Enter 12/24 words…"
          className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none resize-y"
        />
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.currentTarget.value)}
          placeholder="Set password"
          className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
        />
        {err && <div className="text-sm text-red-400">{err}</div>}
        <button
          type="button"
          onClick={handleImport}
          disabled={busy}
          className="px-4 py-3 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff] disabled:opacity-60"
        >
          {busy ? 'Importing…' : 'Import & unlock'}
        </button>
      </div>
    </Modal>
  );
}
