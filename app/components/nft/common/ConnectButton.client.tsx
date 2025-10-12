"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount, useDisconnect } from "wagmi";

export default function ConnectButtonClient() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <button
        className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90"
        onClick={() => open()}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm opacity-80">
        {address?.slice(0, 6)}…{address?.slice(-4)}
      </span>
      <button
        className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20"
        onClick={() => disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}
