'use client';

import React, { useEffect, useState } from 'react';
import { Card, GButton } from '../components/UI';
import type { Address } from 'viem';
import { deriveAddressFromMnemonic } from '@/src/wallet/core/services/seed';
import { getEncryptedMnemonic } from '@wallet/adapters/storage.web';

export default function ReceiveScreen() {
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    (async () => {
      const password = prompt('Password to unlock wallet');
      if (!password) return;

      const mnemonic = await getEncryptedMnemonic(password);
      if (!mnemonic) return alert('Wrong password or no wallet found');

      const addr = deriveAddressFromMnemonic(mnemonic, 0) as Address;
      setAddress(addr);
    })();
  }, []);

  // ✅ эта функция и есть тот самый "copy"
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
