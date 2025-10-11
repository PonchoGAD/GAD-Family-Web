// app/nft/ai-mint/page.tsx
"use client";

import Link from "next/link";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";

export default function AiMintPage() {
  const { open } = useWeb3Modal();
  const { isConnected, address } = useAccount();

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">AI Mint</h1>
      <p className="text-white/70 mt-2">
        Generate an image with AI, upload to IPFS, then mint on BNB Chain.
      </p>

      <div className="mt-6 flex gap-3">
        {!isConnected ? (
          <button
            onClick={() => open?.()}
            className="rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-black"
          >
            Connect Wallet
          </button>
        ) : (
          <span className="text-white/80">Connected: {address?.slice(0, 6)}…{address?.slice(-4)}</span>
        )}

        <Link
          href="/nft"
          className="rounded-lg border border-white/20 px-4 py-2 text-white/80"
        >
          Back to NFT Home
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">What’s next</h2>
        <ol className="list-decimal pl-5 mt-3 space-y-2 text-white/80">
          <li>Use our backend (<code>/api/nft/spec</code>, <code>/api/nft/generate</code>) to get an image.</li>
          <li>Upload to IPFS via <code>/api/nft/upload</code> and pin metadata via <code>/api/nft/pin-json</code>.</li>
          <li>Mint by calling <code>mintWithFee(to, tokenURI)</code> from your connected wallet.</li>
        </ol>
      </div>
    </main>
  );
}
