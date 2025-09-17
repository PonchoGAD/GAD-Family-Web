'use client';
import React from 'react';

type Pool = { name:string; pairUrl:string; };

export default function GetLpHelp({ pools }: { pools: Pool[] }) {
  const usdt = pools.find(p => p.name.toLowerCase().includes('usdt'));
  const bnb  = pools.find(p => p.name.toLowerCase().includes('bnb'));

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
      <h3 className="text-lg font-bold">How to get LP tokens</h3>
      <ol className="list-decimal list-inside mt-2 text-sm text-white/80 space-y-1">
        <li>Open the pair page on PancakeSwap.</li>
        <li>Add equal value of both assets (GAD + USDT / GAD + BNB).</li>
        <li>Confirm the transaction → you’ll receive LP tokens in your wallet.</li>
        <li>Come back here → Approve → Stake.</li>
      </ol>
      <div className="mt-3 flex flex-wrap gap-2">
        {usdt && (
          <a href={usdt.pairUrl} target="_blank" className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">
            ➜ Get GAD–USDT LP
          </a>
        )}
        {bnb && (
          <a href={bnb.pairUrl} target="_blank" className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-sm">
            ➜ Get GAD–BNB LP
          </a>
        )}
      </div>
    </div>
  );
}
