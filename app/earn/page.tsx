// app/earn/page.tsx
'use client';

import dynamic from 'next/dynamic';
import SwitchNetworkButton from '../components/SwitchNetworkButton';

// Клиентские компоненты отключаем от SSR
const FarmingDashboard = dynamic(() => import('../components/FarmingDashboard'), { ssr: false });
const ZapBox           = dynamic(() => import('../components/ZapBox'),           { ssr: false });
const HowToFarm        = dynamic(() => import('../components/HowToFarm'),        { ssr: false });

export default function EarnPage() {
  return (
    <>
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold">Liquidity Mining</h1>
          <SwitchNetworkButton />
        </div>
        <p className="text-white/70 mt-2">
          Total program: 100B GAD • Emissions split by pools (allocPoints)
        </p>
      </section>

      {/* Zap-кнопки */}
      <div className="mt-8">
        <ZapBox />
      </div>

      {/* Дашборд фарминга */}
      <div className="mt-10">
        <FarmingDashboard />
      </div>

      {/* HowToFarm секция */}
      <div className="mt-10">
        <HowToFarm />
      </div>
    </>
  );
}
