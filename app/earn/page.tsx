'use client';

import FarmingDashboard from '../components/FarmingDashboard';
import SwitchNetworkButton from '../components/SwitchNetworkButton';
import ZapBox from '../components/ZapBox';
import HowToFarm from '../components/HowToFarm';

export default function Page() {
  return (
    <>
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold">Liquidity Mining</h1>
          <SwitchNetworkButton />
        </div>
        <p className="text-white/70 mt-2">
          Stake LP and earn GAD rewards
        </p>
      </section>
      {/* ← ZAP-блок */}
      <ZapBox />

      {/* Дашборд сам тянет /api/farming-config на клиенте */}
      <FarmingDashboard />

      {/* HowToFarm тоже сам подтянет конфиг на клиенте (см. файл ниже) */}
      <HowToFarm />
    </>
  );
}



