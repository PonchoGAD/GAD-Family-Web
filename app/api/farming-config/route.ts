import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // на Vercel иногда кешит — отключаем
export const revalidate = 0;

export async function GET() {
  const cfg = {
    masterChef: "0x5C5c0b9eE66CC106f90D7b1a3727dc126C4eF188",
    rewardToken: "0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62",
    rewardDecimals: 18,
    rewardPerBlock: "16534391534391536",
    startBlock: "61230868",
    bonusEndBlock: "62094868",
    bonusMultiplier: 2,
    totalRewards: "100000000000000000000000000000",
    pools: [
      {
        id: 0,
        name: "GAD–USDT LP",
        lpToken: "0xFf74Ed4c41743a2ff1Cf2e3869E8617143cceBf1",
        allocPoint: 70,
        pairUrl:
          "https://pancakeswap.finance/add/0x55d398326f99059fF775485246999027B3197955/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62?chain=bsc"
      },
      {
        id: 1,
        name: "GAD–BNB LP",
        lpToken: "0x85c6BAFce7880484a417cb5d7067FDE843328997",
        allocPoint: 30,
        pairUrl:
          "https://pancakeswap.finance/add/0xBB4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62?chain=bsc"
      }
    ]
  };

  return NextResponse.json(cfg, {
    headers: { 'cache-control': 'no-store, max-age=0' },
  });
}
