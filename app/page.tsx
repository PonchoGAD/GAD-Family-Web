'use client';

import React from 'react';
import type { ReactElement } from 'react';
import Image from 'next/image';
import { Rocket, Shield, Coins, Users, LineChart, ExternalLink, Lock, Wallet, Github } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const CONTRACT_ADDRESS = '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const BSCSCAN_URL = 'https://bscscan.com/address/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const PANCAKE_URL = 'https://pancakeswap.finance/swap?outputCurrency=0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';

const CONFIG = {
  brand: {
    name: 'GAD Family',
    token: 'GAD',
    tagline: 'Safer Families. Smarter Money.',
    logoUrl: '/assets/logo-64.png',
  },
  contract: {
    address: CONTRACT_ADDRESS,
    decimals: 18,
    chainName: 'BNB Smart Chain (BSC)',
    chainId: 56,
  },
  links: {
    buyUrl: PANCAKE_URL,
    liquidityUrl: 'https://pancakeswap.finance/liquidity?chain=bsc&persistChain=1',
    bscscanUrl: BSCSCAN_URL,
    githubUrl: '#',
    appUrl: '#',
  },
  tokenomics: [
    { name: 'Circulating @Launch', value: 50 },
    { name: 'Ecosystem & Treasury (vesting)', value: 20 },
    { name: 'Community Rewards (walk-to-earn)', value: 15 },
    { name: 'Liquidity (locked)', value: 10 },
    { name: 'Team (24m vest)', value: 5 },
  ],
  metrics: { holders: 0, tvlUSD: 0, liquidityLockedUntil: 'TBD' },
  roadmap: [
    { title: 'Q3 2025', items: ['Public website & waitlist', 'DEX listing: GAD/BNB, lock LP', 'Investor landing MVP'] },
    { title: 'Q4 2025', items: ['iOS/Android MVP: steps→rewards, family wallet', 'Metrics dashboard', 'GAD/USDT pool, basic staking'] },
    { title: 'Q1 2026', items: ['Buyback + LP from app revenue', 'Partnership pilots', 'Prep for CEX'] },
  ],
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Page(): ReactElement {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <Header />
      <Hero />
      <ValueProps />
      <TokenSection />
      <Tokenomics />
      <Roadmap />
      <Footer />
    </div>
  );
}

function Header(): ReactElement {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src={CONFIG.brand.logoUrl} alt="GAD coin logo" width={36} height={36} className="rounded-full shadow" />
          <span className="font-bold tracking-wide">{CONFIG.brand.name}</span>
        </div>
        <nav className="hidden md:flex items-center gap-5 text-sm opacity-90">
          <a href="#token" className="hover:opacity-100">Token</a>
          <a href="#tokenomics" className="hover:opacity-100">Tokenomics</a>
          <a href="#roadmap" className="hover:opacity-100">Roadmap</a>
          <a href={CONFIG.links.bscscanUrl} target="_blank" className="hover:opacity-100 flex items-center gap-1">BscScan <ExternalLink className="w-4 h-4" /></a>
        </nav>
        <div className="flex items-center gap-2">
          <a href={CONFIG.links.buyUrl} target="_blank" className="px-3 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:scale-[1.02] transition">
            Buy on PancakeSwap
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero(): ReactElement {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e2746,transparent_60%)] pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="mx-auto w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
          <Coins className="w-10 h-10 text-[#ffd166]" />
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">
          {CONFIG.brand.name} — {CONFIG.brand.tagline}
        </h1>
        <p className="mt-4 text-white/80 max-w-3xl mx-auto">
          {CONFIG.brand.token} is a real-utility token powering family safety, healthy habits, and a simple shared wallet.
          Contract: <span className="font-mono bg-white/10 px-2 py-1 rounded">{CONFIG.contract.address}</span>
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a href={CONFIG.links.buyUrl} target="_blank" className="px-5 py-3 rounded-2xl bg-[#ffd166] text-[#0b0f17] font-bold hover:scale-[1.02] transition flex items-center gap-2">
            <Wallet className="w-5 h-5" /> Buy GAD
          </a>
          <a href={CONFIG.links.liquidityUrl} target="_blank" className="px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 transition flex items-center gap-2">
            <Lock className="w-5 h-5" /> Add Liquidity
          </a>
        </div>
        <div className="relative max-w-5xl mx-auto mt-6 px-4">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-extrabold text-[56px] md:text-[80px] tracking-[0.3em] text-white/5 select-none">GAD FAMILY</span>
          </div>
          <Image
            src="/assets/hero-family.png"
            alt="Family using the GAD Family app"
            width={1600}
            height={900}
            className="relative rounded-2xl w-full h-auto shadow-xl"
            priority
          />
        </div>
        <p className="text-center mt-3 opacity-90"><strong>App for Family Safety</strong></p>
        <div className="mt-4 text-sm text-white/70">
          Network: {CONFIG.contract.chainName} • Decimals: {CONFIG.contract.decimals}
        </div>
      </div>
    </section>
  );
}

function ValueProps(): ReactElement {
  const items = [
    { icon: <Shield className="w-6 h-6 text-[#ffd166]" />, title: 'Transparency', text: 'Verified contract, public addresses, locked LP.' },
    { icon: <Users className="w-6 h-6 text-[#ffd166]" />, title: 'Family-first', text: 'Private circles, steps→rewards, shared wallet, AI safety assistant.' },
    { icon: <LineChart className="w-6 h-6 text-[#ffd166]" />, title: 'Real revenue', text: 'Part of app revenue goes to buyback & LP.' },
  ];
  return (
    <section className="py-10 md:py-14">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-4">
        {items.map((i, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div>{i.icon}</div>
            <h3 className="mt-3 font-bold text-lg">{i.title}</h3>
            <p className="mt-1 text-white/80">{i.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function TokenSection(): ReactElement {
  return (
    <section id="token" className="py-12 md:py-16 bg-black/20 border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold">GAD Token on BSC</h2>
          <ul className="mt-4 space-y-3 text-white/85">
            <li className="flex gap-2"><Rocket className="w-5 h-5 text-[#ffd166] mt-1" /> Fixed supply: 10,000,000,000,000 GAD</li>
            <li className="flex gap-2"><Shield className="w-5 h-5 text-[#ffd166] mt-1" /> Burn available to all holders</li>
            <li className="flex gap-2"><Lock className="w-5 h-5 text-[#ffd166] mt-1" /> LP will be locked (link soon)</li>
            <li className="flex gap-2"><Coins className="w-5 h-5 text-[#ffd166] mt-1" /> Pairs: GAD/BNB → GAD/USDT</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={CONFIG.links.bscscanUrl} target="_blank" className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 flex items-center gap-2"><ExternalLink className="w-4 h-4" /> BscScan</a>
            <a href={CONFIG.links.githubUrl} target="_blank" className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 flex items-center gap-2"><Github className="w-4 h-4" /> GitHub</a>
            <a href={CONFIG.links.appUrl} className="px-4 py-2 rounded-xl bg:white/10 hover:bg-white/15">Open App</a>
          </div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold">Live Metrics</h3>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <Metric label="Holders" value={CONFIG.metrics.holders} />
            <Metric label="TVL ($)" value={CONFIG.metrics.tvlUSD} />
            <Metric label="LP Locked" value={CONFIG.metrics.liquidityLockedUntil} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }): ReactElement {
  return (
    <div className="bg-black/30 rounded-xl p-4 border border-white/10">
      <div className="text-2xl font-extrabold">{String(value)}</div>
      <div className="text-white/70 text-sm mt-1">{label}</div>
    </div>
  );
}

function Tokenomics(): ReactElement {
  const total = CONFIG.tokenomics.reduce((s, i) => s + i.value, 0);
  return (
    <section id="tokenomics" className="py-14">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Tokenomics</h2>
          <p className="mt-3 text-white/80">Initial distribution. Adjust as the model evolves.</p>
          <ul className="mt-4 space-y-2">
            {CONFIG.tokenomics.map((t, idx) => (
              <li key={idx} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-3 h-3 rounded-sm" style={{ background: COLORS[idx % COLORS.length] }} />
                  <span>{t.name}</span>
                </div>
                <span className="font-bold">{t.value}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-white/60">Sum: {total}% • Total Supply: 10,000,000,000,000 GAD</p>
        </div>
        <div className="h-72 bg-white/5 border border-white/10 rounded-2xl p-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={CONFIG.tokenomics} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={2}>
                {CONFIG.tokenomics.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, color: 'white' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

function Roadmap(): ReactElement {
  return (
    <section id="roadmap" className="py-14 bg-black/20 border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-extrabold">Roadmap</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {CONFIG.roadmap.map((col, i) => (
            <div key={i} className="bg:white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold text-lg">{col.title}</h3>
              <ul className="mt-3 space-y-2 list-disc list-inside text-white/85">
                {col.items.map((it, idx) => <li key={idx}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer(): ReactElement {
  return (
    <footer className="py-8 text-white/70">
      <div className="max-w-6xl mx-auto px-4">
        © {new Date().getFullYear()} GAD Family • Built for real families
      </div>
    </footer>
  );
}
