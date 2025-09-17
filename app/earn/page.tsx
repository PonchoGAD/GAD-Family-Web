import FarmingDashboard from "../components/FarmingDashboard";
import SwitchNetworkButton from "../components/SwitchNetworkButton";
import HowToFarm from "../components/HowToFarm";

export const metadata = {
  title: "GAD — Farming",
  description: "Stake GAD LP and earn GAD rewards",
};

async function fetchCfg() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/api/farming-config`, { cache: 'no-store' });
  // На сервере нет window — поэтому пробуем без абсолютного URL:
  if (!res.ok) {
    const res2 = await fetch('http://localhost:3000/api/farming-config', { cache: 'no-store' }).catch(()=>null as any);
    if (res2?.ok) return res2.json();
  }
  return res.json();
}

export default async function Page() {
  const cfg = await fetchCfg();

  return (
    <>
      <section className="max-w-5xl mx-auto px-4 pt-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-extrabold">Liquidity Mining</h1>
          <SwitchNetworkButton />
        </div>
        <p className="text-white/70 mt-2">
          Rewards pool: 100B GAD • Bonus x{cfg.bonusMultiplier} until block {cfg.bonusEndBlock}
        </p>
      </section>

      <FarmingDashboard />

      <HowToFarm cfg={cfg} />
    </>
  );
}
