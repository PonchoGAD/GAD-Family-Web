'use client';
type PoolCfg = { id:number; name:string; lpToken:string; allocPoint:number; pairUrl:string; };
type FarmingConfig = {
  masterChef:string; rewardToken:string; rewardDecimals:number;
  rewardPerBlock:string; startBlock:string; bonusEndBlock:string;
  bonusMultiplier:number; totalRewards:string; pools: PoolCfg[];
};

export default function HowToFarm({ cfg }: { cfg: FarmingConfig }) {
  const usdt = cfg.pools.find(p => p.name.toLowerCase().includes('usdt'));
  const bnb  = cfg.pools.find(p => p.name.toLowerCase().includes('bnb'));

  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h3 className="text-2xl font-extrabold">How to Farm</h3>
      <ol className="mt-4 space-y-3 list-decimal list-inside text-white/80">
        <li>
          Add Liquidity:
          <div className="mt-2 flex flex-col gap-2 text-sm">
            {usdt && <a className="underline hover:opacity-80" href={usdt.pairUrl} target="_blank">➜ Add GAD–USDT LP</a>}
            {bnb &&  <a className="underline hover:opacity-80" href={bnb.pairUrl} target="_blank">➜ Add GAD–BNB LP</a>}
          </div>
        </li>
        <li>Approve LP to the MasterChef on the first stake.</li>
        <li>Stake LP in the pool (USDT: 70% rewards, BNB: 30%).</li>
        <li>Harvest rewards anytime (deposit with amount = 0).</li>
        <li>Unstake LP whenever you want.</li>
      </ol>
      <p className="mt-6 text-xs text-white/50">
        Disclaimer: DeFi has risk. Double-check contract addresses and pairs. Rewards depend on total staked LP and blocks.
      </p>
    </section>
  );
}
