// app/nft/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import NFTHomeClient from "./HomeClient";
import ClientOnly from "./components/ClientOnly";

export const metadata: Metadata = {
  title: "GAD — NFT Marketplace",
  description: "Explore, buy and sell NFTs on BNB Chain.",
};

// запрещаем SSR/пререндер, чтобы на сервере не исполнялись web3-хуки
export const dynamic = "force-dynamic";

export default function NFTPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold">NFT Marketplace</h1>
        <p className="text-white/70 mt-2">
          Explore, buy and sell NFTs. Payments in BNB or USDT.
        </p>

        {/* Quick actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/nft/ai-mint"
            className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
          >
            <div className="text-lg font-bold">AI Mint</div>
            <p className="text-white/70 mt-1">
              Generate an image with AI and mint it (user pays gas & mint fee).
            </p>
            <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">
              Go →
            </div>
          </Link>

          <Link
            href="/nft/collection"
            className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
          >
            <div className="text-lg font-bold">My Collection</div>
            <p className="text-white/70 mt-1">
              View all NFTs on your address via Transfer logs.
            </p>
            <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">
              Open →
            </div>
          </Link>

          <Link
            href="/nft/history"
            className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
          >
            <div className="text-lg font-bold">Mint History</div>
            <p className="text-white/70 mt-1">
              Timeline of mints (Transfer from 0x0) with BscScan links.
            </p>
            <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">
              View →
            </div>
          </Link>
        </div>
      </section>

      {/* ВАЖНО: web3-хуки — только внутри ClientOnly */}
      <ClientOnly>
        <NFTHomeClient />
      </ClientOnly>

      {/* FAQ */}
      <section className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-bold">How it works</h2>
        <ul className="list-disc pl-5 mt-3 space-y-2 text-white/80">
          <li>AI Mint: generate image via our API, upload to IPFS, pin metadata.</li>
          <li>Mint: call <code>mintWithFee(to, tokenURI)</code> — user pays fee & gas.</li>
          <li>Compatibility: BNB Chain, ERC-721 standard, royalties via IERC2981.</li>
          <li>Security: No private keys on API — only wallet signs on the client.</li>
        </ul>
      </section>
    </main>
  );
}
