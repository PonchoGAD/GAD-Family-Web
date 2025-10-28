'use client';

import React, { useEffect, useState } from 'react';
import { Card, GButton } from '../components/UI';
import type { Address } from 'viem';
import { deriveAddressFromMnemonic } from '@/src/wallet/core/services/seed';

// ✅ единая разблокировка на 20 минут
import { useUnlock } from '@/src/wallet/core/state/UnlockProvider';

export default function ReceiveScreen() {
  const [address, setAddress] = useState<Address | null>(null);
  const { requireUnlock, getMnemonic } = useUnlock();

  useEffect(() => {
    (async () => {
      try {
        await requireUnlock(); // спросит пароль только если не разблокировано
        const m = getMnemonic();
        const addr = deriveAddressFromMnemonic(m, 0) as Address;
        setAddress(addr);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to unlock wallet';
        alert(msg);
      }
    })();
  }, [requireUnlock, getMnemonic]);

  async function copy() {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    alert('Address copied to clipboard');
  }

  return (
    <Card title="Receive" className="max-w-xl">
      <div className="grid gap-3">
        <div className="opacity-80 text-sm">Your BSC Address</div>
        {address && (
          <>
            <div className="rounded-xl bg-[#1F2430] px-3 py-2 break-all border border-[#2c3344]">
              {address}
            </div>

            <div className="mt-2">
              <GButton title="Copy address" onClickAction={copy} />
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
