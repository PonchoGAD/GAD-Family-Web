'use client';

import React, { useState } from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Coins,
  ExternalLink,
  Globe2,
  Layers,
  Link2,
  Lock,
  Network,
  RadioTower,
  Shield,
  Sparkles,
  Users,
  Wallet,
  Github,
} from 'lucide-react';

// ============================
// Core config & constants
// ============================

const ADDR = {
  // Основной контракт GAD (BSC mainnet)
  token: '0x858bab88A5b8d7f29a40380c5F2D8d0b8812FE62',
  // Текущий контракт лаунчпада (LaunchpadSaleV3)
  launchpadSaleV3: '0x528e90A8304dCd05B351F1291eA34d7d74E4A08d',
  // USDT BEP-20 на BSC
  usdt: '0x55d398326f99059fF775485246999027B3197955',
  // LP Token Locker
  lpTokenLocker: '0xF40B3dE6822837E0c4d937eF20D67B944aE39163',
  // Vesting Vault
  vestingVault: '0x9653Cb1fc5daD8A384c2dAD18A4223b77eCF4A15',
  // Safe multisig Treasury
  treasurySafe: '0xe08F53ac892E89b6Ba431b90A96C640A39386736',
};

const LINKS = {
  bsc: {
    token: `https://bscscan.com/token/${ADDR.token}`,
    launchpadSaleV3: `https://bscscan.com/address/${ADDR.launchpadSaleV3}`,
    lpTokenLocker: `https://bscscan.com/address/${ADDR.lpTokenLocker}`,
    vestingVault: `https://bscscan.com/address/${ADDR.vestingVault}`,
    treasurySafe: `https://bscscan.com/address/${ADDR.treasurySafe}`,
  },
  // Покупка GAD за USDT на PancakeSwap v2
  pancakeSwapBuy: `https://pancakeswap.finance/swap?inputCurrency=${ADDR.usdt}&outputCurrency=${ADDR.token}`,
  // LP-пара GAD/USDT на PancakeSwap v2
  pancakeLP: `https://pancakeswap.finance/v2/pair/${ADDR.usdt}/${ADDR.token}?chain=bsc&persistChain=1`,

  // dApps / internal routes
  launchpad: '/launchpad',
  nft: '/nft',
  wallet: '/wallet',
  app: '/app', // можно переключить позже, если будет другой маршрут
  proof: '/proof',
  dao: '/dao',
  airdrop: '/airdrop',

  // Внешние ресурсы
  github: '#', // TODO: заменить на публичный репозиторий, когда он будет
  x: 'https://x.com/FamilyGad',
  discord: 'https://discord.gg/p6r4YFa9Pn',
  docs: 'https://coinpaprika.com/storage/cdn/whitepapers/224970267.pdf', // Whitepaper v2
};

// Типы для структурированной конфигурации

type EcosystemStatus = 'live' | 'in-progress' | 'r_and_d';

type EcosystemItem = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: EcosystemStatus;
  href?: string;
  icon: ReactElement;
};

type TokenDistributionItem = {
  name: string;
  value: number;
  hint?: string;
};

type ProofContract = {
  label: string;
  addr: string;
  href: string;
  description: string;
};

type MilestoneGroup = {
  title: string;
  items: string[];
};

const BRAND = {
  name: 'GAD',
  fullName: 'GAD Family Ecosystem',
  tagline: 'The Family-Centric Web3 Universe',
  logo: '/logo.png',
};

const ECOSYSTEM: EcosystemItem[] = [
  {
    id: 'wallet',
    name: 'GAD Wallet',
    tagline: 'Family-first non-custodial wallet.',
    description:
      'Multi-account wallet for parents and kids with spending rules, NFT support, and direct links to the GAD ecosystem.',
    status: 'in-progress',
    href: LINKS.wallet,
    icon: <Wallet className="w-5 h-5" />,
  },
  {
    id: 'app',
    name: 'GAD Family App',
    tagline: 'Steps, safety, shared goals.',
    description:
      'Location, safe-zones, daily steps → GAD rewards, shared family goals and healthy habits gamified for all ages.',
    status: 'in-progress',
    href: LINKS.app,
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'launchpad',
    name: 'Launchpad',
    tagline: 'On-chain GAD sale & vesting.',
    description:
      'Fully on-chain launchpad with transparent vesting vaults, LP rules, and direct connection to the treasury Safe.',
    status: 'live',
    href: LINKS.launchpad,
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    id: 'nft',
    name: 'NFT Universe',
    tagline: 'AI-mint, badges, marketplace.',
    description:
      'NFT marketplace and AI generation tools for collections, family badges, and future toy-linked drops.',
    status: 'live',
    href: LINKS.nft,
    icon: <Layers className="w-5 h-5" />,
  },
  {
    id: 'dao',
    name: 'DAO & Governance',
    tagline: 'xGAD and on-chain voting.',
    description:
      'DAO layer with xGAD staking, proposals, and treasury governance. Built gradually around the real ecosystem flows.',
    status: 'in-progress',
    href: LINKS.dao,
    icon: <Network className="w-5 h-5" />,
  },
  {
    id: 'chain',
    name: 'GAD Chain (R&D)',
    tagline: 'Low-fee, family-optimized chain.',
    description:
      'Research & design of a dedicated low-fee network optimized for family payments, identity, and native GAD utility.',
    status: 'r_and_d',
    icon: <RadioTower className="w-5 h-5" />,
  },
];

// распределение токена — синхронизировано с текущей публичной моделью
const TOKEN_DISTRIBUTION: TokenDistributionItem[] = [
  {
    name: 'Launchpad (public sale)',
    value: 30,
    hint: 'Transparent on-chain public sale allocations.',
  },
  {
    name: 'Long-term Lock (App & Ecosystem)',
    value: 50,
    hint: 'Locked for 36 months, unlock every 6 months; 10% of each tranche targeted for burns.',
  },
  {
    name: 'Early Investors (vesting)',
    value: 10,
    hint: 'Vested allocations with TGE and cliff logic.',
  },
  {
    name: 'Founder & Core Development',
    value: 10,
    hint: 'Gradual release for builders aligned with long-term delivery.',
  },
];

const PROOF_CONTRACTS: ProofContract[] = [
  {
    label: 'GAD Token',
    addr: ADDR.token,
    href: LINKS.bsc.token,
    description: 'Fixed-supply BEP-20 token powering the entire ecosystem.',
  },
  {
    label: 'Launchpad Sale V3',
    addr: ADDR.launchpadSaleV3,
    href: LINKS.bsc.launchpadSaleV3,
    description: 'On-chain public sale with vesting and clear rules.',
  },
  {
    label: 'Vesting Vault',
    addr: ADDR.vestingVault,
    href: LINKS.bsc.vestingVault,
    description: 'Manages unlock schedules for team and early investors.',
  },
  {
    label: 'LP Token Locker',
    addr: ADDR.lpTokenLocker,
    href: LINKS.bsc.lpTokenLocker,
    description: 'Locks LP tokens for long-term market stability.',
  },
  {
    label: 'Treasury Safe',
    addr: ADDR.treasurySafe,
    href: LINKS.bsc.treasurySafe,
    description: 'Multi-signature treasury for all critical funds.',
  },
];

const MILESTONES: MilestoneGroup[] = [
  {
    title: 'Live',
    items: [
      'GAD token deployed on BNB Smart Chain',
      'Initial liquidity on PancakeSwap',
      'Launchpad Sale V3 smart contract',
      'Vesting Vault & LP Locker contracts',
      'Proof / contracts transparency concept',
      'DAO core contracts (Governor, xGAD)',
      'NFT module & marketplace base',
    ],
  },
  {
    title: 'In Progress',
    items: [
      'GAD Family App (geo, steps, roles)',
      'GAD Wallet (family accounts & limits)',
      'Staking & farming flows for GAD/xGAD',
      'DAO governance UI and dashboards',
      'Extended NFT collections and badges',
      'Unified brand visuals across all modules',
    ],
  },
  {
    title: 'Next',
    items: [
      'Full public app launch',
      'Marketing and ecosystem partnerships',
      'Listings and integrations with aggregators',
      'Advanced analytics dashboards for holders',
      'GAD Chain research & prototypes',
      'Physical integrations: toys, wear, glamping',
    ],
  },
];

// Простые helpers статуса
function statusLabel(status: EcosystemStatus): string {
  if (status === 'live') return 'Live';
  if (status === 'in-progress') return 'In Progress';
  return 'R&D';
}

function statusColor(status: EcosystemStatus): string {
  if (status === 'live') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  if (status === 'in-progress') return 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40';
  return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
}

// ============================
// Page root
// ============================

export default function Page(): ReactElement {
  const [activeNode, setActiveNode] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#050711] text-white">
      {/* фоновые свечения */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-[#ffd166]/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <Header />
      <main>
        <Hero activeNode={activeNode} />
        <SectionDivider />

        <EcosystemSection setActiveNode={setActiveNode} />
        <SectionDivider />

        <TokenUtilitySection />
        <SectionDivider />

        <TokenDistributionSection />
        <SectionDivider />

        <ProofSection />
        <SectionDivider />

        <LaunchpadSection />
        <SectionDivider />

        <RiskDisclosureSection />
        <SectionDivider />

        <RoadmapSection />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  );
}

function SectionDivider(): ReactElement {
  return <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />;
}


// ============================
// Header
// ============================

function Header(): ReactElement {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Logo + brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/10 bg-black/60">
            <Image
              src={BRAND.logo}
              alt={`${BRAND.name} logo`}
              width={36}
              height={36}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-white/80">{BRAND.name}</span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
              Family Web3
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-xs font-medium text-white/70 md:flex">
          <a href="#ecosystem" className="hover:text-white">Ecosystem</a>
          <a href="#token" className="hover:text-white">Token</a>
          <a href="#launchpad" className="hover:text-white">Launchpad</a>
          <a href="#nft" className="hover:text-white">NFT</a>
          <a href="#wallet" className="hover:text-white">Wallet</a>
          <a href="#proof" className="hover:text-white">Proof</a>
          <a href="#dao" className="hover:text-white">DAO</a>

          {/* subtle divider */}
          <span className="mx-1 h-3 w-px bg-white/15" />

          {/* Investor micro-links */}
          <Link href="/investors" className="text-white/60 hover:text-white">
            Investors
          </Link>
          <Link href="/pitch" className="text-white/60 hover:text-white">
            Pitch
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300 md:inline">
            Preparing for IDO
          </span>

          <Link
            href={LINKS.airdrop}
            className="hidden rounded-xl bg-[#ffd166] px-3 py-2 text-xs font-semibold text-[#050711] shadow-md shadow-yellow-500/30 hover:bg-[#f4c457] md:inline-flex"
          >
            <Sparkles className="mr-1 h-4 w-4" />
            Airdrop
          </Link>

          <Link
            href={LINKS.launchpad}
            className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:border-white/40 hover:bg-white/10"
          >
            Launch dApps
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </header>
  );
}

// ============================
// Hero
// ============================

function Hero({ activeNode }: { activeNode: string | null }): ReactElement {
  return (
    <section id="hero" className="relative border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-center md:py-16">
        
        {/* ================= LEFT / TEXT ================= */}
        <div className="relative z-10 flex-1 space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
            <Globe2 className="h-3.5 w-3.5" />
            Family-centric Web3 ecosystem
          </div>

          {/* Headline */}
          <div>
            <h1 className="text-balance text-3xl font-extrabold leading-tight md:text-5xl">
              Money. Safety. Ownership.
              <span className="block bg-gradient-to-r from-[#ffd166] via-emerald-300 to-sky-400 bg-clip-text text-transparent">
                One token for the whole family.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/70 md:text-base">
              GAD connects a family app, wallet, launchpad, NFT marketplace, and DAO into a single, transparent digital
              universe. Built around real-world families, not speculation.
            </p>
            <p className="max-w-xl text-[12px] text-white/50">
  Designed for long-term adoption, on-chain transparency, and real utility — not short-term hype.
</p>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={LINKS.launchpad}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd166] px-5 py-3 text-sm font-semibold text-[#050711] shadow-lg shadow-yellow-500/30 hover:scale-[1.02] hover:bg-[#f4c457]"
            >
              <BarChart3 className="h-4 w-4" />
              Open Launchpad
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={LINKS.proof}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:border-white/45 hover:bg-white/10"
            >
              <Shield className="h-4 w-4" />
              Proof of Contracts
            </Link>

            <a
              href={LINKS.pancakeSwapBuy}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-xs font-medium text-white/80 hover:border-white/40"
            >
              <Coins className="h-4 w-4" />
              Buy GAD on PancakeSwap
            </a>
          </div>

          {/* INVESTOR AWARENESS LAYER */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/55">
            <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-emerald-300">
              Preparing for IDO
            </span>
            <Link href="/investors" className="underline underline-offset-2 hover:text-white">
              Investors Hub
            </Link>
            <Link href="/pitch" className="underline underline-offset-2 hover:text-white">
              Pitch Deck
            </Link>
          </div>

          {/* TRUST SIGNALS */}
          <div className="text-[11px] text-white/45">
            Contracts deployed • Treasury via Safe multisig • Audit in progress
          </div>

          {/* TOKEN INFO (оставляем как было) */}
          <div className="mt-4 grid gap-3 text-xs text-white/60 md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                Token Contract (BSC)
              </div>
              <div className="mt-1 font-mono text-[11px] text-white/80 break-all">
                {ADDR.token}
              </div>
              <a
                href={LINKS.bsc.token}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200"
              >
                <ExternalLink className="h-3 w-3" />
                View on BscScan
              </a>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-1">
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>Chain</span>
                <span className="font-medium text-white/80">BNB Smart Chain</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>Total supply</span>
                <span className="font-medium text-white/80">10,000,000,000,000 GAD</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-white/50">
                <span>Decimals</span>
                <span className="font-medium text-white/80">18</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT / LIVING MAP ================= */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/4 via-black/60 to-black/90 shadow-[0_0_120px_rgba(0,0,0,0.9)]" />

          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 p-5">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
                <Sparkles className="h-3.5 w-3.5" />
                GAD Universe Map
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                Live ecosystem
              </span>
            </div>

            <div className="mt-4 grid grid-cols-[1.3fr,1fr] gap-4">
              {/* CORE MAP */}
              <div className="relative h-56 rounded-2xl border border-white/10 bg-gradient-to-br from-[#111827] via-[#020617] to-black p-4">
                <div className="absolute inset-0 opacity-60">
                  <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffd166]/10 blur-2xl" />
                  <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#ffd166]/40" />
                </div>

                <div className="relative flex h-full flex-col items-center justify-center gap-4">
                  <div className="rounded-full border border-[#ffd166]/70 bg-black/80 px-4 py-2 text-center">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-[#ffd166]/80">Core</div>
                    <div className="text-sm font-semibold text-white">GAD Token</div>
                  </div>

                  {/* LIVING NODES */}
                  <div className="grid grid-cols-3 gap-3 text-[11px] text-white/70">
                    {['Wallet', 'App', 'Launchpad', 'NFT', 'DAO', 'Locks'].map((n) => (
                      <HeroNode key={n} label={n} active={activeNode === n} />
                    ))}
                  </div>
                </div>
              </div>

              {/* MINI INFO */}
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/60 p-4">
                <div className="space-y-2 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>On-chain sale, locks, and treasury via Safe multisig.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Family app and wallet designed for real-world use.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>DAO and NFT layers built gradually on top of utility.</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-white/50">
                  <span>Everything connects back to GAD.</span>
                  <Link
                    href="#ecosystem"
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-1 text-[10px] text-white/70 hover:border-white/40"
                  >
                    View ecosystem
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}


function HeroNode({
  label,
  active,
}: {
  label: string;
  active?: boolean;
}): ReactElement {
  return (
    <div
      className={[
        'relative rounded-xl px-2 py-1.5 text-center transition-all duration-300',
        active
          ? 'border border-[#ffd166] bg-[#ffd166]/10 shadow-[0_0_18px_#ffd16666]'
          : 'border border-white/10 bg-black/70',
      ].join(' ')}
    >
      {active && (
        <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-[#ffd166]/20 via-transparent to-transparent" />
      )}
      <span className="relative z-10 text-[11px] text-white/80">{label}</span>
    </div>
  );
}



// ============================
// Ecosystem Overview
// ============================

function EcosystemSection({
  setActiveNode,
}: {
  setActiveNode: React.Dispatch<React.SetStateAction<string | null>>;
}): ReactElement {
  // связываем экосистемные id с узлами на карте Hero (подсветка)
  const nodeById: Record<string, string> = {
    wallet: 'Wallet',
    app: 'App',
    launchpad: 'Launchpad',
    nft: 'NFT',
    dao: 'DAO',
    chain: 'Locks', // Chain (R&D) логично подсвечивать как “Locks/Infra” на карте
  };

  return (
    <section id="ecosystem" className="border-b border-white/10 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/60">
              <Layers className="h-3.5 w-3.5 text-[#ffd166]" />
              Living Ecosystem Map
            </div>

            <h2 className="mt-3 text-2xl font-extrabold md:text-3xl">Ecosystem Overview</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              A family-first product suite where each module reinforces the others. Hover a tile to highlight it in the
              Universe Map above — no gimmicks, just structure.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-white/70 md:max-w-sm">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/45">
              <Shield className="h-4 w-4 text-emerald-300" />
              Investor lens
            </div>
            <p className="mt-2">
              We separate <span className="text-white/90">Live</span>, <span className="text-white/90">In Progress</span>
              , and <span className="text-white/90">R&amp;D</span> to make risk and delivery transparent.
            </p>
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ECOSYSTEM.map((item) => {
            const nodeLabel = nodeById[item.id] ?? null;

            return (
              <article
                key={item.id}
                id={item.id === 'wallet' ? 'wallet' : item.id === 'launchpad' ? 'launchpad' : item.id === 'nft' ? 'nft' : undefined}
                onMouseEnter={() => nodeLabel && setActiveNode(nodeLabel)}
                onMouseLeave={() => setActiveNode(null)}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-5 transition hover:border-[#ffd166]/60 hover:bg-black/80"
              >
                {/* subtle glow */}
                <div className="pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl transition group-hover:bg-[#ffd166]/15" />

                <div className="relative z-10 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15 bg-black/60">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                      <p className="mt-0.5 text-[11px] text-white/60">{item.tagline}</p>
                    </div>
                  </div>

                  <div
                    className={[
                      'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium',
                      statusColor(item.status),
                    ].join(' ')}
                  >
                    {statusLabel(item.status)}
                  </div>
                </div>

                <p className="relative z-10 mt-3 text-xs text-white/70">{item.description}</p>

                {/* micro “investor-friendly” line */}
                <div className="relative z-10 mt-4 rounded-xl border border-white/10 bg-black/40 p-3 text-[11px] text-white/60">
                  {item.status === 'live' ? (
                    <span>
                      Ready to explore now — connected to the on-chain core.
                    </span>
                  ) : item.status === 'in-progress' ? (
                    <span>
                      In active build — milestones are tracked and integrated with the core.
                    </span>
                  ) : (
                    <span>
                      R&amp;D track — design and prototypes, no false promises.
                    </span>
                  )}
                </div>

                <div className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-white/50">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    Hover = highlights the map
                  </span>

                  {item.href && (
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70 hover:border-white/40"
                    >
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}


// ============================
// Token Utility
// ============================

function TokenUtilitySection(): ReactElement {
  return (
    <section id="token" className="border-b border-white/10 bg-black/40 py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.4fr,1fr] md:items-center">

        {/* LEFT — utility narrative */}
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl">
            GAD Token Utility
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            GAD is not a single-purpose reward token. It is a routing asset that connects
            real user behaviour, on-chain governance, and long-term ecosystem value.
          </p>

          <div className="mt-5 space-y-4 text-sm text-white/75">
            <UtilityItem
              title="In-app rewards & family behaviour"
              text="Daily steps, family challenges, location-based activity, and real habits are translated into GAD through transparent scoring logic."
            />
            <UtilityItem
              title="Governance & xGAD"
              text="Staking GAD into xGAD grants voting power over treasury usage, incentives, burns, and ecosystem parameters."
            />
            <UtilityItem
              title="Liquidity, staking & long-term holding"
              text="GAD supports LP positions, farming programs, and staking mechanics designed to reward long-term alignment."
            />
            <UtilityItem
              title="NFT economy & digital ownership"
              text="NFT badges, collections, and future physical-linked assets use GAD as a settlement and access layer."
            />
            <UtilityItem
              title="Premium features & subscriptions"
              text="Advanced app features, multipliers, and family-level upgrades are designed to create recurring GAD demand."
            />
          </div>
        </div>

        {/* RIGHT — value flow */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#020617] via-black to-[#0f172a] p-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ffd166]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-0 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="relative z-10 space-y-3 text-xs text-white/70">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/40">
              <Sparkles className="h-3.5 w-3.5" />
              Value flow snapshot
            </div>

            <FlowRow
              label="Families & real users"
              value="Steps, movement, goals, real-world engagement"
            />
            <FlowRow
              label="App & Wallet layer"
              value="Tracking, scoring, permissions, and reward routing"
            />
            <FlowRow
              label="GAD Token"
              value="Minted, distributed, staked, and governed by on-chain rules"
            />
            <FlowRow
              label="DAO & Treasury"
              value="Decisions on incentives, grants, buybacks, and ecosystem growth"
            />
            <FlowRow
              label="Back to users"
              value="New features, upgrades, rewards, and long-term value alignment"
            />
          </div>
        </div>

      </div>
    </section>
  );
}


function UtilityItem({ title, text }: { title: string; text: string }): ReactElement {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1 flex h-4 w-4 items-center justify-center rounded-full border border-[#ffd166]/60 bg-[#ffd166]/10">
        <CheckCircle2 className="h-3 w-3 text-[#ffd166]" />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-white">
          {title}
        </div>
        <p className="text-[13px] text-white/70">
          {text}
        </p>
      </div>
    </div>
  );
}


function FlowRow({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-white/75">
          {label}
        </span>
        <span className="text-[10px] text-white/40">→</span>
      </div>
      <p className="mt-1 text-[11px] text-white/65">
        {value}
      </p>
    </div>
  );
}


// ============================
// Token Distribution
// ============================

function TokenDistributionSection(): ReactElement {
  const total = TOKEN_DISTRIBUTION.reduce((acc, item) => acc + item.value, 0);

  return (
    <section className="border-b border-white/10 py-12 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.3fr,1fr] md:items-start">

        {/* LEFT */}
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Token Distribution
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            GAD has a fixed supply of 10 trillion tokens. Distribution is designed
            to balance early participation, long-term ecosystem growth, and controlled emissions.
          </p>

          <div className="mt-4 space-y-2 text-sm">
            {TOKEN_DISTRIBUTION.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/12 bg-black/60 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-2 w-6 rounded-full bg-gradient-to-r from-[#ffd166] to-emerald-400 opacity-80" />
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-white">
                      {item.name}
                    </span>
                    {item.hint && (
                      <span className="text-[11px] text-white/55">
                        {item.hint}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#ffd166]">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>

          <p className="mt-3 text-[11px] text-white/50">
            Total: {total}% • Fixed supply:{" "}
            <span className="font-mono text-white/70">
              10,000,000,000,000 GAD
            </span>
            <br />
            Burn mechanics are open and verifiable via standard on-chain functions.
          </p>
        </div>

        {/* RIGHT — locks */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/70 p-4 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-300" />
              <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">
                Locks & vesting
              </span>
            </div>

            <ul className="mt-3 space-y-2">
              <li>
                Ecosystem allocations are locked for 36 months with scheduled
                unlocks every 6 months. A portion of each unlock is reserved for burns.
              </li>
              <li>
                Team and early investor allocations are governed by the Vesting Vault
                contract with enforced cliffs and release schedules.
              </li>
              <li>
                Liquidity positions are protected via the LP Token Locker to
                reduce market risk and ensure long-term stability.
              </li>
            </ul>

            <Link
              href="#proof"
              className="mt-3 inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70 hover:border-white/40"
            >
              View contracts in Proof section
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}


// ============================
// Proof / Transparency
// ============================

function ProofSection(): ReactElement {
  return (
    <section id="proof" className="border-b border-white/10 bg-black/40 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">

        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Proof & Transparency
            </h2>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              All critical components of the GAD ecosystem are deployed on-chain,
              publicly verifiable, and connected to a Safe multisig treasury.
              No hidden owner privileges. No off-chain control.
            </p>
          </div>

          <Link
            href={LINKS.proof}
            className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:border-white/40 hover:bg-white/10"
          >
            Open full Proof page
            <ArrowRight className="h-3 w-3" />
          </Link>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PROOF_CONTRACTS.map((c) => (
            <ContractCard key={c.label} contract={c} />
          ))}
        </div>

        {/* trust footer */}
        <div className="mt-6 text-center text-[11px] text-white/45">
          Transparency is a default state — not a marketing feature.
        </div>

      </div>
    </section>
  );
}


function ContractCard({ contract }: { contract: ProofContract }): ReactElement {
  return (
    <article className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-black/70 p-4 text-xs text-white/70">

      {/* glow */}
      <div className="pointer-events-none absolute -top-6 right-0 h-20 w-20 rounded-full bg-emerald-500/10 blur-2xl" />

      <div className="relative z-10 flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/15 bg-black/70">
            <Link2 className="h-4 w-4 text-[#ffd166]" />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {contract.label}
          </h3>
        </div>

        <a
          href={contract.href}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/70 hover:border-white/40"
        >
          <ExternalLink className="h-3 w-3" />
          BscScan
        </a>
      </div>

      <p className="relative z-10 mt-3 text-[11px]">
        {contract.description}
      </p>

      <div className="relative z-10 mt-3 rounded-xl border border-white/10 bg-black/70 p-2 font-mono text-[10px] text-white/60 break-all">
        {contract.addr}
      </div>

      <div className="relative z-10 mt-auto pt-3 text-[10px] text-white/40">
        Publicly verifiable • Immutable • On-chain enforced
      </div>
    </article>
  );
}


// ============================
// Launchpad / Investors
// ============================

function LaunchpadSection(): ReactElement {
  return (
    <section id="launchpad" className="border-b border-white/10 py-12 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.4fr,1fr] md:items-start">
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl">On-chain Launchpad</h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            The GAD sale is structured around on-chain rules: vesting, treasury routing, and liquidity protection. No
            manual spreadsheets, no hidden wallets as a primary mechanism.
          </p>

          <div className="mt-4 grid gap-3 text-xs text-white/75 md:grid-cols-2">
            <LaunchpadFact title="Raise & pricing" value="On-chain caps, clear pricing, vesting tracked by contracts." />
            <LaunchpadFact
              title="Liquidity"
              value="Portion of funds routed to PancakeSwap LP and locked via LP locker."
            />
            <LaunchpadFact
              title="Treasury Safe"
              value="Funds custody via multi-sig Safe to align responsibility and trust."
            />
            <LaunchpadFact
              title="Vesting"
              value="Investor and team allocations streamed by Vesting Vault with cliffs and schedules."
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={LINKS.launchpad}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd166] px-5 py-3 text-sm font-semibold text-[#050711] shadow-md shadow-yellow-500/30 hover:scale-[1.02] hover:bg-[#f4c457]"
            >
              <BarChart3 className="h-4 w-4" />
              Go to Launchpad
            </Link>
            <a
              href={LINKS.bsc.launchpadSaleV3}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white/85 hover:border-white/40 hover:bg-white/10"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Sale contract on BscScan
            </a>
          </div>
        </div>

        {/* Airdrop / early adopters card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#ffd166]/40 bg-[#05030a] p-4 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#ffd166]" />
              <span className="text-[11px] uppercase tracking-[0.16em] text-[#ffd166]/80">
                Early families & contributors
              </span>
            </div>
            <p className="mt-2">
              The earliest community members, testers, and small investors participate through on-chain mechanics,
              airdrops, and structured allocations — all linked back to the same GAD token.
            </p>
            <Link
              href={LINKS.airdrop}
              className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#ffd166] px-3 py-1.5 text-[11px] font-semibold text-[#050711] hover:bg-[#f4c457]"
            >
              Claim Airdrop
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function LaunchpadFact({ title, value }: { title: string; value: string }): ReactElement {
  return (
    <div className="rounded-xl border border-white/12 bg-black/60 p-3">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-white/75">
        <BarChart3 className="h-3.5 w-3.5 text-[#ffd166]" />
        {title}
      </div>
      <p className="mt-1 text-[11px] text-white/65">{value}</p>
    </div>
  );
}


function RiskDisclosureSection(): ReactElement {
  return (
    <section id="risk" className="border-b border-white/10 bg-black/30 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4">

        <header className="max-w-3xl">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            Risk Disclosure
          </h2>
          <p className="mt-2 text-sm text-white/70">
            GAD is a long-term ecosystem project. We believe transparency includes
            openly communicating both opportunities and risks.
          </p>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          {/* Product risk */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-xs text-white/70">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Product & execution
            </div>
            <p className="mt-2">
              Some ecosystem components are still under active development.
              Timelines may evolve as the product is tested with real families
              and adjusted based on feedback.
            </p>
          </div>

          {/* Market risk */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-xs text-white/70">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Market & adoption
            </div>
            <p className="mt-2">
              Token value and adoption depend on real user growth, market
              conditions, and broader Web3 dynamics that are outside the team’s
              full control.
            </p>
          </div>

          {/* Regulatory / governance */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-4 text-xs text-white/70">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Governance & regulation
            </div>
            <p className="mt-2">
              The regulatory environment for crypto and family-oriented digital
              products continues to evolve. Governance mechanisms are designed
              to adapt over time via DAO processes.
            </p>
          </div>

        </div>

        <p className="mt-4 max-w-3xl text-[11px] text-white/45">
          Participation in the GAD ecosystem assumes an understanding of these risks.
          The team’s focus is on mitigation through transparency, on-chain controls,
          and long-term alignment with real users.
        </p>

      </div>
    </section>
  );
}




// ============================
// Roadmap / Milestones
// ============================

function RoadmapSection(): ReactElement {
  return (
    <section id="dao" className="border-b border-white/10 bg-black/40 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">

        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Progress & Roadmap
            </h2>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              GAD follows an execution-first roadmap. What is listed as “Live” is already deployed.
              “In Progress” reflects active work. “Next” represents clearly scoped future phases.
            </p>
          </div>

          <div className="text-xs text-white/45 max-w-xs md:text-right">
            DAO evolution is incremental: first contracts and treasury,
            then interfaces and community voting.
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {MILESTONES.map((group) => (
            <article
              key={group.title}
              className="relative flex h-full flex-col rounded-2xl border border-white/10 bg-black/70 p-4 text-xs text-white/70"
            >
              {/* subtle glow */}
              <div className="pointer-events-none absolute -top-8 right-0 h-24 w-24 rounded-full bg-[#ffd166]/10 blur-2xl" />

              <div className="relative z-10 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#ffd166]" />
                <h3 className="text-sm font-semibold text-white">
                  {group.title}
                </h3>
              </div>

              <ul className="relative z-10 mt-3 space-y-2">
                {group.items.map((it) => (
                  <li key={it} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>

              {/* investor signal */}
              <div className="relative z-10 mt-auto pt-4 text-[11px] text-white/40">
                {group.title === 'Live' && 'Already deployed and verifiable on-chain.'}
                {group.title === 'In Progress' && 'Actively being built and tested.'}
                {group.title === 'Next' && 'Planned phases after current delivery.'}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
}

// ============================
// Community / Footer
// ============================

function CommunitySection(): ReactElement {
  return (
    <section id="community" className="py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-[1.2fr,1fr] md:items-start">

          {/* Community */}
          <div>
            <h2 className="text-xl font-extrabold md:text-2xl">
              Community & Communication
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              GAD is built in the open — contracts, structure, and long-term direction.
              Community channels reflect reality, not hype cycles.
            </p>

            <div className="mt-4 grid gap-3 text-xs text-white/75 md:grid-cols-2">
              <CommunityLink label="X (Twitter)" href={LINKS.x} />
              <CommunityLink label="Discord" href={LINKS.discord} />
              <CommunityLink label="Docs & Litepaper" href={LINKS.docs} />
              <CommunityLink label="Proof / Contracts" href={LINKS.proof} internal />
            </div>
          </div>

          {/* Investors */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5 text-sm text-white/70">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/50">
              <Shield className="h-4 w-4 text-emerald-300" />
              Investors & Partners
            </div>

            <p className="mt-3">
              If you represent a fund, launchpad, or strategic partnership —
              all investor-facing materials are publicly available.
            </p>

            <div className="mt-4 flex flex-wrap gap-3 text-xs">
              <Link
                href="/investors"
                className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2 hover:border-white/40"
              >
                Investor Hub
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>

              <Link
                href="/pitch"
                className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2 hover:border-white/40"
              >
                Pitch Deck
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>

            <p className="mt-3 text-[11px] text-white/45">
              No private decks on request — transparency by default.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}


function CommunityLink({
  label,
  href,
  internal,
}: {
  label: string;
  href: string;
  internal?: boolean;
}): ReactElement {
  const className =
    'inline-flex items-center justify-between gap-2 rounded-xl border border-white/12 bg-black/60 px-3 py-2 hover:border-white/40';

  if (internal) {
    // Внутренняя ссылка через Next Link
    return (
      <Link href={href} className={className}>
        <span>{label}</span>
        <ExternalLink className="h-3.5 w-3.5 text-white/60" />
      </Link>
    );
  }

  // Внешняя ссылка обычным <a>
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={className}
    >
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-white/60" />
    </a>
  );
}


function Footer(): ReactElement {
  return (
    <footer className="border-t border-white/10 bg-black/70 py-8 text-xs text-white/60">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-[1.2fr,1fr] md:items-center">

        {/* Left */}
        <div>
          <div>
            © {new Date().getFullYear()} {BRAND.fullName}. Built for real families.
          </div>
          <div className="mt-2 text-[11px] text-white/45">
            Contracts deployed • Treasury via Safe multisig • On-chain first
          </div>
        </div>

        {/* Right */}
        <div className="flex flex-wrap items-center justify-start gap-4 md:justify-end">

          <Link
            href="/investors"
            className="inline-flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs text-emerald-300 hover:border-emerald-400"
          >
            Investor Hub
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <Link
            href="/pitch"
            className="inline-flex items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-4 py-2 hover:border-white/40"
          >
            Pitch Deck
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>

          <a
            href={LINKS.github}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>

          <span className="h-3 w-px bg-white/20" />

          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
        </div>

      </div>
    </footer>
  );
}


/* ============================
   DIVIDER
============================ */
