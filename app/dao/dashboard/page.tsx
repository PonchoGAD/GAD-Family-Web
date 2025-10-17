"use client";

import { useEffect, useState } from "react";

type DaoStats = {
  totalBNB: string;
  users: number;
  timestamp: number;
};

type Proposal = {
  id: string;
  title: string;
  link: string;
  status: string;
};

export default function DaoDashboard() {
  const [stats, setStats] = useState<DaoStats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  // 🔄 Автообновление каждые 30 секунд
  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/dao/stats");
        const data = await res.json();
        setStats(data);
      } catch {
        console.warn("No stats yet");
      }
    }

    loadStats();
    const interval = setInterval(loadStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // mock data для Snapshot
    setProposals([
      {
        id: "1",
        title: "Increase Liquidity Rewards Pool by 5%",
        link: "https://snapshot.org/#/gadfamily.eth/proposal/1",
        status: "active",
      },
      {
        id: "2",
        title: "Add USDT Pair for GAD Token",
        link: "https://snapshot.org/#/gadfamily.eth/proposal/2",
        status: "passed",
      },
    ]);
  }, []);

  return (
    <main className="p-8 max-w-6xl mx-auto text-white space-y-10">
      <h1 className="text-3xl font-bold">🏛 GAD DAO Liquidity Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
        <div className="bg-[#1C2025] rounded-lg p-4">
          <div className="text-sm uppercase opacity-60">TVL</div>
          <div className="text-2xl font-bold">{stats?.totalBNB || "—"} BNB</div>
        </div>
        <div className="bg-[#1C2025] rounded-lg p-4">
          <div className="text-sm uppercase opacity-60">Active Users</div>
          <div className="text-2xl font-bold">{stats?.users || 0}</div>
        </div>
        <div className="bg-[#1C2025] rounded-lg p-4">
          <div className="text-sm uppercase opacity-60">Updated</div>
          <div className="text-2xl font-bold">
            {stats ? new Date(stats.timestamp).toLocaleTimeString() : "—"}
          </div>
        </div>
      </div>

      <section>
        <h2 className="text-2xl font-semibold mb-4">🗳 Snapshot Proposals</h2>
        <div className="space-y-3">
          {proposals.map((p) => (
            <a
              key={p.id}
              href={p.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block border border-[#2A2A1E] p-3 rounded-lg hover:bg-[#0E0E12]"
            >
              <div className="flex justify-between">
                <div>
                  <b>{p.title}</b>
                </div>
                <div
                  className={`text-sm ${
                    p.status === "active"
                      ? "text-yellow-400"
                      : p.status === "passed"
                      ? "text-green-400"
                      : "text-gray-400"
                  }`}
                >
                  {p.status.toUpperCase()}
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
