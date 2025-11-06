'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { useUnlock } from '@/src/wallet/core/state/UnlockProvider';

type Props = {
  open: boolean;
  onCloseAction: () => void;
};

export default function ViewSeedDialog({ open, onCloseAction }: Props) {
  const { isUnlocked, requireUnlock, getMnemonic } = useUnlock();

  const [phrase, setPhrase] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function revealAction() {
    setErr(null);
    setBusy(true);
    try {
      if (!isUnlocked) {
        await requireUnlock(); // спросит пароль через стандартный механизм
      }
      const m = getMnemonic();
      setPhrase(m);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to unlock';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  function copyAction() {
    if (!phrase) return;
    navigator.clipboard.writeText(phrase);
    alert('Copied');
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Reveal seed phrase" widthClassName="max-w-lg">
      <div className="grid gap-3">
        {!phrase && (
          <>
            <div className="text-sm opacity-80">
              To view your recovery phrase, you may need to unlock your session.
            </div>
            {err && <div className="text-sm text-red-400">{err}</div>}
            <div>
              <button
                type="button"
                onClick={revealAction}
                disabled={busy}
                className="px-4 py-3 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff] disabled:opacity-60"
              >
                {busy ? 'Checking…' : 'Reveal phrase'}
              </button>
            </div>
          </>
        )}

        {phrase && (
          <>
            <div className="text-sm opacity-80">Your 12/24 words (keep them safe):</div>
            <div className="rounded-xl bg-[#10141E] border border-[#2c3344] p-4 break-all">
              {phrase}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={copyAction}
                className="px-4 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => setPhrase(null)}
                className="px-4 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
              >
                Hide
              </button>
            </div>
          </>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCloseAction}
            className="px-4 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
