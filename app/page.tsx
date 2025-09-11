'use client';

import React from 'react';
import type { ReactElement } from 'react';
import Image from 'next/image';
import { Rocket, Shield, Coins, Users, LineChart, ExternalLink, Lock, Wallet, Github } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import InvestForm from "../app/components/InvestForm";
import { Analytics } from "@vercel/analytics/react"
import InvestButton from "../app/components/InvestButton";

const CONTRACT_ADDRESS = '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const BSCSCAN_URL = 'https://bscscan.com/address/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const PANCAKE_URL =
  'https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';

const CONFIG = {
  brand: {
    name: 'GAD Family',
    token: 'GAD',
    tagline: 'Safer Families. Smarter Money.',
    logoUrl: "/logo-32.png",
    heroUrl: "/images/hero-family.png",
  },
  contract: {
    address: CONTRACT_ADDRESS,
    decimals: 18,
    chainName: 'BNB Smart Chain (BSC)',
    chainId: 56,
  },
  links: {
    buyUrl: PANCAKE_URL,
    liquidityUrl:
      'https://pancakeswap.finance/v2/pair/0x55d398326f99059fF775485246999027B3197955/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62?chain=bsc&persistChain=1',
    bscscanUrl: BSCSCAN_URL,
    githubUrl: '#',
    appUrl: '#',
    // С‚РІРѕСЏ С„РѕСЂРјР° (РјРѕР¶РЅРѕ Р·Р°РјРµРЅРёС‚СЊ РЅР° ?usp=sf_link вЂ” С‚РѕР¶Рµ РѕРє)
    investForm: 'https://docs.google.com/forms/d/e/1FAIpQLScnYggks4ikZA3buSLazXkZiWhrQz6WT50aukkHQIFI3rUp9g/viewform?usp=sharing&ouid=111082380689727787961',
    investWallet: '0x4C0B07Ad19D47994639D18ac2Af2FF82A0F95F37',
  },

  tokenomics: [
    { name: 'Launchpad (public sale)', value: 30 },
    { name: 'Long-term Lock (36m, unlock each 6m; burn 10% of each unlocked tranche)', value: 50 },
    { name: 'Early Investors (vesting)', value: 10 },
    { name: 'Founder & Development', value: 10 },
  ],
  metrics: { holders: 0, tvlUSD: 0, liquidityLockedUntil: 'TBD' },
  roadmap: [
    { title: 'Q3 2025', items: ['Token & website live', 'PancakeSwap V2 LP + LP lock', 'App development in progress'] },
    { title: 'Q4 2025', items: ['App beta (closed tests, QA & telemetry)', 'Fundraising for launch (USDT on BSC, whitelist)', 'Public communications & partnerships'] },
    { title: 'Q1 2026', items: ['Full project launch (public app release)', 'Marketing scale-up & listings', 'Staking/quests post-launch'] },
  ],
};

const COLORS = ['#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Page(): ReactElement {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <Header />
      <Hero />
      <ValueProps />
      {/* РїРѕРєР°Р·С‹РІР°РµРј СЃРµРєС†РёСЋ СЃРѕ СЃСЂРѕРєР°РјРё Рё РєРЅРѕРїРєРѕР№ РїРµСЂРµС…РѕРґР° РЅР° Google Form */}
      <Invest />
      <TokenSection />
      <Tokenomics />
      <Roadmap />
      <Footer />
    </div>
  );
}

function Header(): ReactElement {
  const hasLogo = Boolean((CONFIG as any)?.brand?.logoUrl);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasLogo ? (
            <Image
              src={CONFIG.brand.logoUrl}
              alt={`${CONFIG.brand.name} logo`}
              width={36}
              height={36}
              className="rounded-full shadow"
              priority
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#ffd166] text-[#0b0f17] font-extrabold grid place-items-center shadow">G</div>
          )}
          <span className="font-bold tracking-wide">{CONFIG.brand.name}</span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-sm opacity-90">
          <a href="#token" className="hover:opacity-100">Token</a>
          <a href="#tokenomics" className="hover:opacity-100">Tokenomics</a>
          <a href="#roadmap" className="hover:opacity-100">Roadmap</a>
          <a href="#invest" className="hover:opacity-100">Invest</a>
          <a
            href={CONFIG.links.bscscanUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="hover:opacity-100 flex items-center gap-1"
          >
            BscScan <ExternalLink className="w-4 h-4" />
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={CONFIG.links.buyUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="px-3 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:scale-[1.02] transition"
          >
            Buy on PancakeSwap
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero(): ReactElement {
  const hasHero = Boolean((CONFIG as any)?.brand?.heroUrl);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e2746,transparent_60%)] pointer-events-none" />
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="mx-auto w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-lg">
          <Coins className="w-10 h-10 text-[#ffd166]" />
        </div>
        <h1 className="mt-6 text-4xl md:text-5xl font-extrabold leading-tight">
          {CONFIG.brand.name} вЂ” {CONFIG.brand.tagline}
        </h1>
        <p className="mt-4 text-white/80 max-w-3xl mx-auto">
          {CONFIG.brand.token} is a real-utility token powering family safety, healthy habits, and a simple shared wallet.
          Contract: <span className="font-mono bg-white/10 px-2 py-1 rounded">{CONFIG.contract.address}</span>
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={CONFIG.links.buyUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="px-5 py-3 rounded-2xl bg-[#ffd166] text-[#0b0f17] font-bold hover:scale-[1.02] transition flex items-center gap-2"
          >
            <Wallet className="w-5 h-5" /> Buy GAD
          </a>
          <a
            href={CONFIG.links.liquidityUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 transition flex items-center gap-2"
          >
            <Lock className="w-5 h-5" /> Add Liquidity
          </a>
        </div>

        <div className="relative max-w-5xl mx-auto mt-6 px-4">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-extrabold text-[56px] md:text-[80px] tracking-[0.3em] text-white/5 select-none">GAD FAMILY</span>
          </div>

          {hasHero ? (
            <Image
              src={CONFIG.brand.heroUrl}
              alt="Family using the GAD Family app"
              width={1600}
              height={900}
              className="relative rounded-2xl w-full h-auto shadow-xl"
              priority
            />
          ) : (
            <div className="relative rounded-2xl w-full aspect-[16/9] shadow-xl bg-gradient-to-br from-[#1e2746] via-[#0b0f17] to-[#1e2746] border border-white/10" />
          )}
        </div>

        <p className="text-center mt-3 opacity-90"><strong>App for Family Safety</strong></p>
        <div className="mt-4 text-sm text-white/70">
          Network: {CONFIG.contract.chainName} вЂў Decimals: {CONFIG.contract.decimals}
        </div>
      </div>
    </section>
  );
}

function ValueProps(): ReactElement {
  const items = [
    { icon: <Shield className="w-6 h-6 text-[#ffd166]" />, title: 'Transparency', text: 'Verified contract, public addresses, locked LP.' },
    { icon: <Users className="w-6 h-6 text-[#ffd166]" />, title: 'Family-first', text: 'Private circles, stepsв†’rewards, shared wallet, AI safety assistant.' },
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

function Invest(): React.ReactElement {
  const [copied, setCopied] = React.useState(false);
  const addr = CONFIG.links.investWallet;

  return (
    <section id="invest" className="py-14">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-start">
        {/* Terms / Address */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl md:text-3xl font-extrabold">Raise & Terms</h2>
          <ul className="mt-4 space-y-2 text-white/85">
            <li>Target raise: <b>$250,000</b> in <b>USDT (BEP-20)</b>.</li>
            <li>Presale rate: <b>10,000 GAD / 1 USDT</b>. Listing rate: <b>9,500 GAD / 1 USDT</b>.</li>
            <li>60% of raise to LP on PancakeSwap V2; LP locked 12 months. 40% to treasury (multisig).</li>
            <li>Vesting (early investors): TGE 20%, 1-month cliff, linear 6вЂ“12 months.</li>
            <li>Unsold from launchpad: burn or long-term lock (publicly verifiable).</li>
            <li>Token locks: <b>50% total supply locked for 36 months</b>, unlock every 6 months; <b>burn 10% of each unlocked tranche</b>, 90% в†’ treasury/operations.</li>
            <li>Distribution: 30% Launchpad, 50% Long-term lock, 10% Early Investors, 10% Founder & Development.</li>
            <li>Funds custody: BSC multisig (Safe). Address below.</li>
          </ul>

          <div className="mt-5 p-4 bg-black/30 rounded-xl border border-white/10">
            <div className="text-sm text-white/70">Investment wallet (USDT, BEP-20):</div>
            <div className="mt-1 font-mono break-all select-all">{addr}</div>
            <button
              onClick={() => { navigator.clipboard.writeText(addr); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
              className="mt-3 px-3 py-2 rounded-xl bg:white/10 hover:bg-white/15 text-sm"
            >
              {copied ? 'Copied' : 'Copy address'}
            </button>
          </div>

          <div className="mt-5 text-xs text-white/60">
            Disclaimer: This is not investment advice and not an offer of securities. Tokens provide utility in the GAD Family app. Crypto assets are high risk; only commit what you can afford to lose.
          </div>

          <div className="mt-4 flex gap-3">
            <a
              href={CONFIG.links.liquidityUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> Pancake LP
            </a>
            <a
              href={CONFIG.links.buyUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-bold"
            >
              Buy on Pancake
            </a>
          </div>
        </div>

        {/* Google Form: РєРЅРѕРїРєР° -> РѕС‚РєСЂС‹РІР°РµС‚ С„РѕСЂРјСѓ РІ РЅРѕРІРѕР№ РІРєР»Р°РґРєРµ */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 pt-6 text-center">
            <h3 className="font-bold">Apply / Register interest</h3>
            <p className="text-white/70 text-sm mb-4">Fill the form вЂ” we will contact you.</p>
            <a
              href={CONFIG.links.investForm}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 rounded-xl bg-black text-white hover:opacity-90"
            >
              Open Investment Form
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function TokenSection(): ReactElement {
  return (
    <section id="token" className="py-12 md:py-16 bg-black/20 border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:3xl font-extrabold">GAD Token on BSC</h2>
          <ul className="mt-4 space-y-3 text:white/85">
            <li className="flex gap-2"><Rocket className="w-5 h-5 text-[#ffd166] mt-1" /> Fixed supply: 10,000,000,000,000 GAD</li>
            <li className="flex gap-2"><Shield className="w-5 h-5 text-[#ffd166] mt-1" /> Burn available to all holders</li>
            <li className="flex gap-2"><Lock className="w-5 h-5 text-[#ffd166] mt-1" /> LP will be locked (link soon)</li>
            <li className="flex gap-2"><Coins className="w-5 h-5 text-[#ffd166] mt-1" /> Pairs: GAD/BNB в†’ GAD/USDT</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={CONFIG.links.bscscanUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" /> BscScan
            </a>
            <a
              href={CONFIG.links.githubUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 flex items-center gap-2"
            >
              <Github className="w-4 h-4" /> GitHub
            </a>
            <a href={CONFIG.links.appUrl} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">Open App</a>
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

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div
      style={{
        background: "#0b0f17",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: "8px 10px",
        color: "#fff",
        boxShadow: "0 8px 24px rgba(0,0,0,.45)",
        maxWidth: 260,
      }}
    >
      <div style={{ opacity: 0.85, fontSize: 12, lineHeight: "16px" }}>{name}</div>
      <div style={{ fontWeight: 800 }}>{value}%</div>
    </div>
  );
}

function CustomLegend({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
      {data.map((t, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm leading-snug break-words">
          <span
            className="mt-1 inline-block w-3 h-3 rounded-sm flex-shrink-0"
            style={{ background: COLORS[idx % COLORS.length] }}
          />
          <span className="flex-1 min-w-0">{t.name}</span>
          <span className="font-bold ml-2 flex-shrink-0">{t.value}%</span>
        </li>
      ))}
    </ul>
  );
}

function Tokenomics(): ReactElement {
  const data = CONFIG.tokenomics;
  const total = data.reduce((s, i) => s + i.value, 0);

  return (
    <section id="tokenomics" className="py-14">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold">Tokenomics</h2>
          <p className="mt-3 text-white/80">
            Base allocation. Values may be updated as we refine the model.
          </p>
          <ul className="mt-4 space-y-2">
            {data.map((t, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded-sm"
                    style={{ background: COLORS[idx % COLORS.length] }}
                  />
                  <span>{t.name}</span>
                </div>
                <span className="font-bold">{t.value}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-white/60">
            Total: {total}% вЂў Total Supply: 10,000,000,000,000 GAD
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="h-96 md:h-[28rem]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={2}
                  labelLine={false}
                  label={({ percent }) => `${Math.round(percent * 100)}%`}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} position={{ x: undefined, y: 12 }} wrapperStyle={{ pointerEvents: "none" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <CustomLegend data={data} />
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
            <div key={i} className="bg-white/5 border border:white/10 rounded-2xl p-5">
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
        В© {new Date().getFullYear()} GAD Family вЂў Built for real families
      </div>
    </footer>
  );
}

