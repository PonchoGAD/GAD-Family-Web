"use client";

import AiMintClient from "./AiMintClient";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-lg w-full text-center space-y-6">
        <h1 className="text-3xl font-extrabold">🤖 GAD AI Mint</h1>
        <p className="text-white/70 text-sm">
          Connect your wallet to start minting AI-generated NFTs on the BNB Chain.
        </p>

        <AiMintClient />

        <div className="text-xs text-white/50 mt-10">
          Powered by GAD Family · BNB Chain
        </div>
      </div>
    </main>
  );
}
