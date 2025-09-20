'use client';

import dynamic from 'next/dynamic';

const FarmingDashboard = dynamic(() => import('../components/FarmingDashboard'), { ssr: false });
const ZapBox           = dynamic(() => import('../components/ZapBox'),           { ssr: false });
const HowToFarm        = dynamic(() => import('../components/HowToFarm'),        { ssr: false });

export default function EarnPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold">Liquidity Mining</h1>
      <p className="text-white/70 mt-2">
        Total program: 100B GAD • Emissions split by pools (allocPoints)
      </p>

      {/* Links to BscScan contracts */}
      <div className="mt-4 text-sm text-white/70 space-y-1">
        <p>
          GAD Token:{" "}
          <a
            href="https://bscscan.com/token/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62"
            target="_blank"
            rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            0x858bab...FE62
          </a> ✅
        </p>
        <p>
          MasterChef (Farming):{" "}
          <a
            href="https://bscscan.com/address/0x5C5c0b9eE66CC106f90D7b1a3727dc126C4eF188"
            target="_blank"
            rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            0x5C5c0b...F188
          </a> ✅
        </p>
        <p>
          Zap Contract:{" "}
          <a
            href="https://bscscan.com/address/0x15Acdc7636FB0214aEfa755377CE5ab3a9Cc99BC"
            target="_blank"
            rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            0x15Acdc...99BC
          </a> ✅
        </p>
      </div>

      {/* Zap-кнопки */}
      <div className="mt-8">
        <ZapBox />
      </div>

      {/* Дашборд фарминга */}
      <div className="mt-10">
        <FarmingDashboard />
      </div>

      {/* How to farm guide */}
      <div className="mt-10">
        <HowToFarm />
      </div>
    </main>
  );
}
