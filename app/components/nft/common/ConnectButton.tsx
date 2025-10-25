"use client";

import { useEffect, useState } from "react";
import { connectWallet, currentAccount } from "../../../lib/nft/web3";
import AddressBadge from "./AddressBadge";

type EIP1193 = {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
};

function getEth(): EIP1193 | undefined {
  return (window as unknown as { ethereum?: EIP1193 }).ethereum;
}

export default function ConnectButton({
  onConnected,
  className = "",
}: {
  onConnected?: (account: string) => void;
  className?: string;
}) {
  const [account, setAccount] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const acc = await currentAccount();
      if (acc) {
        setAccount(acc);
        onConnected?.(acc);
      }
    })();

    const eth = getEth();
    const handler = (accounts: string[]) => {
      const acc = accounts?.[0] ?? null;
      setAccount(acc);
      if (acc) onConnected?.(acc);
    };
    eth?.on?.("accountsChanged", handler);
    return () => eth?.removeListener?.("accountsChanged", handler);
  }, [onConnected]);

  const connect = async () => {
    try {
      setBusy(true);
      const acc = await connectWallet();
      setAccount(acc);
      onConnected?.(acc);
    } catch (e: unknown) {
      const er = e as { message?: string };
      alert(er?.message ?? "Wallet connection failed");
    } finally {
      setBusy(false);
    }
  };

  if (account) {
    return <AddressBadge address={account} className={className} title="Connected wallet" />;
  }

  return (
    <button
      className={`border px-4 py-2 rounded hover:bg-black hover:text-white transition ${className}`}
      disabled={busy}
      onClick={connect}
    >
      {busy ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
