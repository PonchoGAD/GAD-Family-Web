"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import MarketGrid from "./components/MarketGrid";
import { ADDR } from "../lib/nft/config";
import { ethers } from "ethers";

// грузим кнопку кошелька ТОЛЬКО на клиенте
const WalletConnect = dynamic(() => import("../components/WalletConnectButton"), { ssr: false });

type EthereumLike = { ethereum?: ethers.Eip1193Provider };

export default function NFTPageClient() {
  const [account, setAccount] = React.useState<string | null>(null);

  React.useEffect(() => {
    const eth = (window as unknown as EthereumLike).ethereum;
    if (!eth?.request) return;

    // первичный запрос аккаунтов
    eth
      .request({ method: "eth_accounts" })
      .then((res) => {
        const acc = Array.isArray(res) && res.length > 0 ? String(res[0]) : null;
        setAccount(acc);
      })
      .catch(() => {});

    // подписка на смену аккаунта
    const handler = (accs: unknown) => {
      const arr = Array.isArray(accs) ? accs : [];
      setAccount(arr.length ? String(arr[0]) : null);
    };
    // @ts-expect-error: MetaMask events at runtime
    eth.on?.("accountsChanged", handler);

    return () => {
      // @ts-expect-error: MetaMask events at runtime
      eth.removeListener?.("accountsChanged", handler);
    };
  }, []);

  const profileHref =
    account && /^0x[0-9a-fA-F]{40}$/.test(account)
      ? `/nft/profile/${account}`
      : "/nft/profile/0x0000000000000000000000000000000000000000";

  const collectionAddr = ADDR.NFT721; // наш адрес коллекции для карточки "Mint History"

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              href={profileHref}
              className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
            >
              <div className="text-lg font-bold">My Collection</div>
              <p className="text-white/70 mt-1">
                View all NFTs on your address via Transfer logs.
              </p>
              <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">Open →</div>
            </Link>

            <Link
              href={`/nft/collections/${collectionAddr}`}
              className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
            >
              <div className="text-lg font-bold">Mint History</div>
              <p className="text-white/70 mt-1">
                Timeline of mints (Transfer from 0x0) with BscScan links.
              </p>
              <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">View →</div>
            </Link>

            <Link
              href="/nft/market"
              className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition"
            >
              <div className="text-lg font-bold">Marketplace</div>
              <p className="text-white/70 mt-1">
                Explore live listings. Buy with BNB or USDT.
              </p>
              <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">Browse →</div>
            </Link>
          </div>
        </section>

        {/* GRID (preview / featured) */}
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
