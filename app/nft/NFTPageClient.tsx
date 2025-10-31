"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import MarketGrid from "./components/MarketGrid";

// грузим кнопку кошелька ТОЛЬКО на клиенте
const WalletConnect = dynamic(() => import("../components/WalletConnectButton"), { ssr: false });

export default function NFTPageClient() {
  return (
    <main className="min-h-screen bg-[#0B0F17] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* WALLET */}
        <div className="mb-8">
          <WalletConnect />
        </div>

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold">🖼️ GAD NFT Marketplace</h1>
            <p className="text-white/70 text-sm mt-1">
              Explore, mint and trade NFTs powered by GAD Family · BNB Chain
            </p>
          </div>

          <Link
            href="/nft/ai-mint"
            className="px-4 py-2 rounded-lg bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90 transition"
          >
            + AI Mint
          </Link>
        </div>

        {/* QUICK CARDS */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/nft/ai-mint"
              className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
            >
              <div className="text-lg font-bold">AI Mint</div>
              <p className="text-white/70 mt-1">
                Generate an image with AI and mint it (user pays gas &amp; mint fee).
              </p>
              <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">Go →</div>
            </Link>

            <Link
              href="/nft/profile/0x0000000000000000000000000000000000000000"
              className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
            >
              <div className="text-lg font-bold">My Collection</div>
              <p className="text-white/70 mt-1">View all NFTs on your address via Transfer logs.</p>
              <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">Open →</div>
            </Link>

            <Link
              href="/nft/collections/0x0271167c2b1b1513434ece38f024434654781594"
              className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
            >
              <div className="text-lg font-bold">Mint History</div>
              <p className="text-white/70 mt-1">Timeline of mints (Transfer from 0x0) with BscScan links.</p>
              <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">View →</div>
            </Link>
          </div>
        </section>

        {/* GRID */}
        <MarketGrid />

        {/* FOOTER */}
        <div className="mt-10 text-xs text-white/50 text-center">
          Powered by GAD Family · BNB Chain Explorer:{" "}
          <a
            href="https://bscscan.com"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-[#FFD166]"
          >
            BscScan
          </a>
        </div>
      </div>
    </main>
  );
}
