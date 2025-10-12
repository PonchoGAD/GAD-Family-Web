// app/nft/sell/SellClient.tsx
"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

export default function SellClient() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  if (!ready) {
    return (
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Sell NFT</h1>
        <div>Loading…</div>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Sell NFT</h1>

      {!isConnected ? (
        <button
          onClick={() => open()}
          className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="space-y-2">
          <div className="opacity-70 text-sm">Wallet: {address}</div>
          {/* твоя форма листинга/логика продажи тут (оставляю пустым, чтобы не ломать существующие имена переменных) */}
          <div className="border rounded p-4">
            Put your listing form here…
          </div>
        </div>
      )}
    </main>
  );
}
