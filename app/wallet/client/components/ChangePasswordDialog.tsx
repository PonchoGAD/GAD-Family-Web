'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import { getEncryptedMnemonic, setEncryptedMnemonic } from '@wallet/adapters/storage.web';

type Props = {
  open: boolean;
  onCloseAction: () => void;
  onChangedAction?: () => void;
};

export default function ChangePasswordDialog({ open, onCloseAction, onChangedAction }: Props) {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function changeAction() {
    setErr(null);
    setOk(null);
    const a = oldPwd.trim();
    const b = newPwd.trim();
    if (!a || !b) {
      setErr('Fill both current and new passwords');
      return;
    }
    setBusy(true);
    try {
      const m = await getEncryptedMnemonic(a);
      if (!m) {
        setErr('Wrong current password or no wallet found');
        return;
      }
      await setEncryptedMnemonic(m, b);
      setOk('Password changed successfully');
      setOldPwd('');
      setNewPwd('');
      onChangedAction?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to change password';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Change password" widthClassName="max-w-sm">
      <div className="grid gap-3">
        <input
          type="password"
          value={oldPwd}
          onChange={(e) => setOldPwd(e.currentTarget.value)}
          placeholder="Current password"
          className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
        />
        <input
          type="password"
          value={newPwd}
          onChange={(e) => setNewPwd(e.currentTarget.value)}
          placeholder="New password"
          className="bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
        />
        {err && <div className="text-sm text-red-400">{err}</div>}
        {ok && <div className="text-sm text-green-400">{ok}</div>}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCloseAction}
            className="px-4 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
            disabled={busy}
          >
            Close
          </button>
          <button
            type="button"
            onClick={changeAction}
            className="px-4 py-2 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff] disabled:opacity-60"
            disabled={busy}
          >
            {busy ? 'Changing…' : 'Change'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
