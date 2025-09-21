'use client';

import dynamic from 'next/dynamic';
import React from 'react';

const FarmingDashboard = dynamic(() => import('../components/FarmingDashboard'), { ssr: false });
const ZapBox           = dynamic(() => import('../components/ZapBox'),           { ssr: false });
const HowToFarm        = dynamic(() => import('../components/HowToFarm'),        { ssr: false });

function Countdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = React.useState('');

  React.useEffect(() => {
    const tick = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance <= 0) {
        setTimeLeft('✅ Claim is LIVE!');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="font-mono">{timeLeft}</span>;
}

export default function EarnPage() {
  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* ==== AIRDROP INFO ==== */}
      <section className="bg-black/30 border border-white/10 rounded-2xl p-6 mb-8">
        <h2 className="text-2xl font-bold text-[#ffd166]">🎁 Airdrop Season 1</h2>
        <p className="text-white/80 mt-2">
          A total of <b>100M GAD</b> is allocated for Season&nbsp;1.<br />
          Every participant receives <b>15,000 GAD</b>.<br />
          Additionally, <b>100 random winners</b> will get a <b>30,000 GAD bonus</b>.
        </p>
        <p className="text-white/70 mt-2">
          Claim period starts on <b>25.09 at 12:00 UTC</b> and will remain open for 2 weeks.
        </p>
        <div className="mt-3 text-lg text-[#ffd166]">
          Countdown to claim start: <Countdown targetDate={new Date('2025-09-25T12:00:00Z')} />
        </div>
        <div className="mt-3 text-sm text-white/70">
          Airdrop Contract:{" "}
          <a
            href="https://bscscan.com/address/0x022cE9320Ea1AB7E03F14D8C0dBD14903A940F79"
            target="_blank"
            rel="noreferrer"
            className="text-[#ffd166] hover:underline"
          >
            0x022cE9...0F79
          </a> ✅
        </div>
      </section>

      {/* ==== FARMING INFO ==== */}
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
