// app/nft/components/WalletConnectButton.tsx
"use client";
import { useWallet } from "../nft/hooks/useWallet";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletConnectButton({ className = "" }: { className?: string }) {
  const { account, connect, disconnect } = useWallet();

  if (account) {
    return (
      <button
        onClick={disconnect}
        className={`px-4 py-2 rounded-xl bg-neutral-800 text-white hover:opacity-90 ${className}`}
      >
        {short(account)} · Disconnect
      </button>
    );
  }

  return (
    <button
      onClick={connect}
      className={`px-4 py-2 rounded-xl bg-yellow-400 text-black font-medium hover:opacity-90 ${className}`}
    >
      Connect Wallet
    </button>
  );
}
