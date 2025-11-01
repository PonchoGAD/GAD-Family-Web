"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ADDR } from "../../lib/nft/config";

type DaoStats = {
  totalBNB: string;
  usdt?: string;
  users: number;
  timestamp: number;
};

type Proposal = {
  id: string;
  title: string;
  link: string;
  status: "active" | "passed" | "rejected" | string;
};

type GovParams = {
  name: string;
  threshold: string;
  votingDelay: string;
  votingPeriod: string;
  quorum: string;
  clock: string;
  clockMode: string;
};

export default function DaoDashboard() {
  const [stats, setStats] = useState<DaoStats | null>(null);
  const [gov, setGov] = useState<GovParams | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // 🔄 Автообновление каждые 30 сек
  useEffect(() => {
    async function load() {
      try {
        const [s, p] = await Promise.all([
          fetch("/api/dao/stats").then(r => r.json()).catch(() => null),
          fetch("/api/dao/params").then(r => r.json()).catch(() => null),
        ]);
        if (s && !s.error) setStats(s as DaoStats);
        if (p && !p.error) setGov(p as GovParams);
      } catch {
        // ignore
      }
    }
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, []);

  // Mock Snapshot data (плейсхолдер)
  useEffect(() => {
    setProposals([
      { id: "1", title: "Increase Liquidity Rewards Pool by 5%", link: "https://snapshot.org/#/gadfamily.eth/proposal/1", status: "active" },
      { id: "2", title: "Add USDT Pair for GAD Token",          link: "https://snapshot.org/#/gadfamily.eth/proposal/2", status: "passed" },
    ]);
  }, []);

  const Card = ({ title, value }: { title: string; value: string | number | undefined }) => (
    <div className="bg-[#1C2025] rounded-lg p-4 text-center border border-white/10">
      <div className="text-xs uppercase opacity-60 tracking-wider">{title}</div>
      <div className="text-2xl font-bold mt-1">{value ?? "—"}</div>
    </div>
  );

  const AddressRow = ({ label, address }: { label: string; address: string }) => {
    const copy = async () => {
      await navigator.clipboard.writeText(address);
    };
    return (
      <div className="flex items-center justify-between gap-3 text-sm">
        <div className="opacity-70">{label}</div>
        <button
          onClick={copy}
          className="font-mono text-xs bg-black/30 border border-white/10 rounded px-2 py-1 hover:border-white/30"
          title="Copy address"
        >
          {address.slice(0, 8)}…{address.slice(-6)}
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0E0E12] to-[#1C2025] text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">

        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">🏛 GAD DAO Dashboard</h1>
          <div className="flex gap-2">
            <Link
              href="/dao/votes"
              className="inline-block rounded-xl px-4 py-2 border border-white/20 hover:border-white/40"
            >
              Delegate votes
            </Link>
            <Link
              href="/dao/propose"
              className="inline-block rounded-xl px-4 py-2 bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90"
            >
              + Create proposal
            </Link>
          </div>
        </header>

        {/* KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card title="TVL (BNB)" value={stats?.totalBNB} />
          <Card title="USDT on Treasury" value={stats?.usdt ?? "0"} />
          <Card title="Active Users" value={stats?.users ?? 0} />
          <Card title="Updated" value={stats ? new Date(stats.timestamp).toLocaleTimeString() : "—"} />
        </section>

        {/* Governor params + addresses */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0E0E12]/80 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-semibold">Governor Parameters</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div className="opacity-70">Name</div><div>{gov?.name ?? "—"}</div>
              <div className="opacity-70">Proposal Threshold</div><div>{gov?.threshold ?? "—"}</div>
              <div className="opacity-70">Voting Delay</div><div>{gov?.votingDelay ?? "—"}</div>
              <div className="opacity-70">Voting Period</div><div>{gov?.votingPeriod ?? "—"}</div>
              <div className="opacity-70">Quorum @clock</div><div>{gov?.quorum ?? "—"}</div>
              <div className="opacity-70">Clock</div><div>{gov?.clock ?? "—"}</div>
              <div className="opacity-70">Clock Mode</div><div className="truncate">{gov?.clockMode ?? "—"}</div>
            </div>
          </div>

          <div className="bg-[#0E0E12]/80 border border-white/10 rounded-2xl p-5">
            <h2 className="text-xl font-semibold">DAO Addresses</h2>
            <div className="mt-3 space-y-2">
              <AddressRow label="Governor" address={ADDR.GOVERNOR} />
              <AddressRow label="xGAD (StakeGADVotes)" address={ADDR.XGAD} />
              <AddressRow label="Treasury" address={ADDR.TREASURY} />
            </div>
          </div>
        </section>

        {/* Snapshot (mock) */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">🗳 Snapshot Proposals</h2>
          <div className="space-y-3">
            {proposals.map((p) => (
              <a
                key={p.id}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-white/10 p-4 rounded-xl hover:bg-white/[0.06] transition"
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{p.title}</div>
                  <div
                    className={`text-xs px-2 py-1 rounded ${
                      p.status === "active"
                        ? "bg-yellow-400/20 text-yellow-300 border border-yellow-400/30"
                        : p.status === "passed"
                        ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-white/10 text-white/70 border border-white/10"
                    }`}
                  >
                    {p.status.toUpperCase()}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
