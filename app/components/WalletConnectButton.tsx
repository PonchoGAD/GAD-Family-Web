// app/components/WalletConnectButton.tsx
"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

function short(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function WalletConnectButton({ className = "" }: { className?: string }) {
  const { address, isConnected } = useAccount();
  // ВАЖНО: ничего не передаём в options; коннекторы берутся из createConfig
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <button
        onClick={() => disconnect()}
        className={`px-4 py-2 rounded-xl bg-neutral-800 text-white hover:opacity-90 ${className}`}
        aria-label="Disconnect wallet"
      >
        {short(address)} · Disconnect
      </button>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending || connectors.length === 0}
      className={`px-4 py-2 rounded-xl bg-yellow-400 text-black font-medium hover:opacity-90 disabled:opacity-60 ${className}`}
      aria-label="Connect wallet"
    >
      {isPending ? "Connecting…" : "Connect Wallet"}
    </button>
  );
}
