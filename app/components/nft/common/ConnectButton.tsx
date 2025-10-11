// app/components/nft/common/ConnectButton.tsx
"use client";

import * as React from "react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useBalance, useDisconnect } from "wagmi";

function short(addr?: string) {
  return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
}

export default function ConnectButton() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const { data: bal } = useBalance({
    address,
    // В wagmi@2 обновлён API: используем query-настройки вместо legacy watch
    query: { refetchInterval: 10_000, enabled: !!address },
  });

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-white font-semibold"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
        <div className="text-sm text-white/80">{short(address)}</div>
        <div className="text-xs text-white/60">
          {bal ? `${bal.formatted.slice(0, 6)} ${bal.symbol}` : "…"}
        </div>
      </div>
      <button
        onClick={() => disconnect()}
        className="rounded-lg bg-white/10 hover:bg-white/20 px-3 py-2 text-white"
      >
        Disconnect
      </button>
    </div>
  );
}
