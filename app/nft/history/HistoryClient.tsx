// app/nft/history/HistoryClient.tsx
"use client";

import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function HistoryClient() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Transaction History</h1>
      {loading ? (
        <div>Loading...</div>
      ) : !isConnected ? (
        <button
          onClick={() => open()}
          className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="text-gray-300">History for {address}</div>
      )}
    </main>
  );
}
