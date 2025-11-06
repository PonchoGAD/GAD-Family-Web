'use client';

import React, { useMemo, useState } from 'react';
import Modal from './Modal';
import { erc20Symbol, erc20Decimals } from '@/src/wallet/core/services/erc20';
import { toErc20Address } from '@/src/wallet/core/utils/safeAddresses';

type TokenItem = {
  address: `0x${string}`;
  symbol: string;
  name?: string;
  decimals: number;
  source: 'default' | 'local';
};

type Props = {
  open: boolean;
  onCloseAction: () => void;
  defaultTokens: TokenItem[];
  onSaveLocalAction?: (local: TokenItem[]) => void;
};

export default function ManageTokensDialog({
  open,
  onCloseAction,
  defaultTokens,
  onSaveLocalAction,
}: Props) {
  const [localTokens, setLocalTokens] = useState<TokenItem[]>([]);
  const [addrInput, setAddrInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const all = useMemo(() => {
    const map = new Map<string, TokenItem>();
    for (const t of defaultTokens) map.set(t.address.toLowerCase(), t);
    for (const t of localTokens) map.set(t.address.toLowerCase(), t);
    return Array.from(map.values()).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [defaultTokens, localTokens]);

  async function addCustom() {
    setErr(null);
    setBusy(true);
    try {
      const raw = addrInput.trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(raw)) {
        setErr('Enter valid token address');
        return;
      }
      const address = toErc20Address(raw as `0x${string}`);

      const [symbol, decimals] = await Promise.all([
        erc20Symbol(address),
        erc20Decimals(address),
      ]);

      const item: TokenItem = {
        address,
        symbol: symbol || 'UNKNOWN',
        name: symbol || 'Token',
        decimals: Number.isFinite(decimals) ? Number(decimals) : 18,
        source: 'local',
      };

      setLocalTokens((prev) => {
        if (prev.some((x) => x.address.toLowerCase() === address.toLowerCase())) return prev;
        return [...prev, item];
      });
      setAddrInput('');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to fetch token metadata';
      setErr(msg);
    } finally {
      setBusy(false);
    }
  }

  function removeLocal(address: `0x${string}`) {
    setLocalTokens((prev) => prev.filter((t) => t.address.toLowerCase() !== address.toLowerCase()));
  }

  function saveAll() {
    onSaveLocalAction?.(localTokens);
    onCloseAction();
  }

  return (
    <Modal open={open} onCloseAction={onCloseAction} title="Manage tokens" widthClassName="max-w-3xl">
      <div className="grid gap-4">
        <div>
          <div className="text-sm opacity-80 mb-2">Add custom token (address):</div>
          <div className="flex gap-2">
            <input
              value={addrInput}
              onChange={(e) => setAddrInput(e.currentTarget.value)}
              className="flex-1 bg-[#10141E] border border-[#2c3344] rounded-xl px-4 py-3 outline-none"
              placeholder="0x..."
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={busy}
              className="px-4 py-3 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff]"
            >
              {busy ? 'Adding…' : 'Add'}
            </button>
          </div>
          {err && <div className="text-sm text-red-400 mt-2">{err}</div>}
        </div>

        <div className="rounded-xl border border-[#2c3344]">
          <div className="px-4 py-2 text-sm opacity-70 border-b border-[#2c3344]">
            Default + Local (local are marked)
          </div>
          <div className="max-h-72 overflow-auto">
            {all.map((t) => (
              <div
                key={t.address}
                className="px-4 py-2 flex items-center gap-3 border-b border-[#2c3344] last:border-0"
              >
                <div className="font-semibold">{t.symbol}</div>
                <div className="opacity-60 text-xs">· {t.address.slice(0, 6)}…{t.address.slice(-4)}</div>
                <div className="ml-auto text-xs opacity-70">
                  {t.source === 'local' ? 'local' : 'default'}
                </div>
                {t.source === 'local' && (
                  <button
                    type="button"
                    onClick={() => removeLocal(t.address)}
                    className="ml-3 px-2 py-1 rounded-lg bg-[#392222] text-red-200 text-xs"
                  >
                    remove
                  </button>
                )}
              </div>
            ))}
            {all.length === 0 && <div className="px-4 py-3 opacity-70 text-sm">No tokens</div>}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCloseAction}
            className="px-4 py-2 rounded-xl font-semibold bg-[#1F2430] hover:bg-[#242a39] border border-[#2c3344]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveAll}
            className="px-4 py-2 rounded-xl font-semibold bg-[#0A84FF] hover:bg-[#1a8cff]"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
