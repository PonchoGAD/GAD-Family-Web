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

/* -------------------- tiny toast system (no deps) -------------------- */
type Toast = { id: number; title: string; desc?: string };
const ToastCtx = React.createContext<{ push: (t: Omit<Toast, "id">) => void } | null>(null);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(1);

  const push = React.useCallback((t: Omit<Toast, "id">) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, ...t }]);
    // auto-hide
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      {/* viewport */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="w-[300px] rounded-xl border border-white/10 bg-[#12151B]/90 backdrop-blur px-4 py-3 shadow-xl text-white transition-all animate-[toastIn_220ms_ease-out]"
            style={{ willChange: "transform, opacity" }}
          >
            <div className="font-semibold">{t.title}</div>
            {t.desc && <div className="text-sm text-white/70 mt-0.5">{t.desc}</div>}
          </div>
        ))}
      </div>
      <style jsx global>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}

function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.push;
}

/* -------------------- small appear animation wrapper -------------------- */
function Appear({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return (
    <div
      className={
        `transition-all duration-500 will-change-transform ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"} ` +
        className
      }
    >
      {children}
    </div>
  );
}

/* -------------------- page -------------------- */

export default function NFTPageClient() {
  return (
    <ToastProvider>
      <InnerPage />
    </ToastProvider>
  );
}

function InnerPage() {
  const pushToast = useToast();
  const [account, setAccount] = React.useState<string | null>(null);

  React.useEffect(() => {
    const eth = (window as unknown as EthereumLike).ethereum;
    if (!eth?.request) return;

    eth
      .request({ method: "eth_accounts" })
      .then((res) => {
        const acc = Array.isArray(res) && res.length > 0 ? String(res[0]) : null;
        setAccount(acc);
        if (acc) {
          pushToast({ title: "Wallet connected", desc: `${acc.slice(0, 6)}…${acc.slice(-4)}` });
        }
      })
      .catch(() => {});

    const handler = (accs: unknown) => {
      const arr = Array.isArray(accs) ? accs : [];
      const next = arr.length ? String(arr[0]) : null;
      setAccount(next);
      if (next) {
        pushToast({ title: "Account changed", desc: `${next.slice(0, 6)}…${next.slice(-4)}` });
      } else {
        pushToast({ title: "Wallet disconnected" });
      }
    };
    // @ts-expect-error MetaMask events at runtime
    eth.on?.("accountsChanged", handler);

    return () => {
      // @ts-expect-error MetaMask events at runtime
      eth.removeListener?.("accountsChanged", handler);
    };
  }, [pushToast]);

  const profileHref =
    account && /^0x[0-9a-fA-F]{40}$/.test(account)
      ? `/nft/profile/${account}`
      : "/nft/profile/0x0000000000000000000000000000000000000000";

  const collectionAddr = ADDR.NFT721;

  const copyShare = async () => {
    try {
      const url = typeof window !== "undefined" ? `${window.location.origin}/nft` : "/nft";
      await navigator.clipboard.writeText(url);
      pushToast({ title: "Link copied", desc: url });
    } catch {
      pushToast({ title: "Copy failed" });
    }
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        {/* WALLET */}
        <div className="mb-8">
          <WalletConnect />
        </div>

        {/* HEADER */}
        <Appear>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold">🖼️ GAD NFT Marketplace</h1>
              <p className="text-white/70 text-sm mt-1">
                Explore, mint and trade NFTs powered by GAD Family · BNB Chain
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={copyShare}
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-sm hover:bg-white/10 transition"
                title="Copy share link"
              >
                Share
              </button>
              <Link
                href="/nft/ai-mint"
                className="px-4 py-2 rounded-lg bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90 transition"
              >
                + AI Mint
              </Link>
            </div>
          </div>
        </Appear>

        {/* QUICK CARDS */}
        <section className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Appear delay={40}>
              <Link
                href="/nft/ai-mint"
                className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition block"
              >
                <div className="text-lg font-bold">AI Mint</div>
                <p className="text-white/70 mt-1">
                  Generate an image with AI and mint it (user pays gas &amp; mint fee).
                </p>
                <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">Go →</div>
              </Link>
            </Appear>

            <Appear delay={80}>
              <Link
                href={profileHref}
                className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition block"
              >
                <div className="text-lg font-bold">My Collection</div>
                <p className="text-white/70 mt-1">View all NFTs on your address via Transfer logs.</p>
                <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">Open →</div>
              </Link>
            </Appear>

            <Appear delay={120}>
              <Link
                href={`/nft/collections/${collectionAddr}`}
                className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition block"
              >
                <div className="text-lg font-bold">Mint History</div>
                <p className="text-white/70 mt-1">Timeline of mints (from 0x0) with BscScan links.</p>
                <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">View →</div>
              </Link>
            </Appear>

            <Appear delay={160}>
              <Link
                href="/nft/market"
                className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/[0.08] transition block"
              >
                <div className="text-lg font-bold">Marketplace</div>
                <p className="text-white/70 mt-1">Explore live listings. Buy with BNB or USDT.</p>
                <div className="mt-3 text-emerald-300 group-hover:translate-x-0.5 transition">Browse →</div>
              </Link>
            </Appear>
          </div>
        </section>

        {/* GRID (preview / featured) */}
        <Appear delay={200}>
          <MarketGrid />
        </Appear>

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
