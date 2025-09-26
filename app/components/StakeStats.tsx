// components/StakeStats.tsx
'use client';

import React from 'react';

function fmt(n: string) {
  // без знаний decimals выводим как есть; если нужны 18 — можно делить на 1e18
  return new Intl.NumberFormat().format(Number(n));
}

export default function StakeStats() {
  const [stats, setStats] = React.useState<{
    uniqueStakers: number;
    pools: { pid: number; totalStaked: string }[];
    updatedAt: string;
  } | null>(null);

  React.useEffect(() => {
    const load = async () => {
      try {
        const r = await fetch('/api/staking-stats', { cache: 'no-store' });
        if (!r.ok) throw new Error('Failed to fetch stats');
        const j = await r.json();
        setStats(j);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    const id = setInterval(load, 60_000); // обновление раз в минуту
    return () => clearInterval(id);
  }, []);

  if (!stats) return null;

  const totalTVL = stats.pools.reduce((s, p) => s + Number(p.totalStaked || 0), 0);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
      <div className="text-sm text-white/70">Staking stats</div>
      <div className="mt-2 grid grid-cols-2 gap-3">
        <div className="bg-black/30 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/60">Unique stakers</div>
          <div className="text-xl font-bold">{stats.uniqueStakers}</div>
        </div>
        <div className="bg-black/30 rounded-xl p-3 border border-white/10">
          <div className="text-xs text-white/60">Total TVL (GAD)</div>
          <div className="text-xl font-bold">{fmt(String(totalTVL))}</div>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/50">
        Updated: {new Date(stats.updatedAt).toLocaleString()}
      </div>
    </div>
  );
}
