"use client";

import { useEffect, useState } from "react";
import { connectWallet, currentAccount } from "../../../lib/nft/web3";
import AddressBadge from "./AddressBadge";

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

    const anyWin = window as any;
    const eth = anyWin?.ethereum;
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
    } catch (e: any) {
      alert(e?.message ?? "Wallet connection failed");
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
