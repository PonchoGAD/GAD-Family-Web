'use client';

import React from 'react';
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
        <Hero />
        <EcosystemSection />
        <TokenUtilitySection />
        <TokenDistributionSection />
        <ProofSection />
        <LaunchpadSection />
        <RoadmapSection />
        <CommunitySection />
      </main>
      <Footer />
    </div>
  );
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
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">Family Web3</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 text-xs font-medium text-white/70 md:flex">
          <a href="#ecosystem" className="hover:text-white">
            Ecosystem
          </a>
          <a href="#token" className="hover:text-white">
            Token
          </a>
          <a href="#launchpad" className="hover:text-white">
            Launchpad
          </a>
          <a href="#nft" className="hover:text-white">
            NFT
          </a>
          <a href="#wallet" className="hover:text-white">
            Wallet
          </a>
          <a href="#proof" className="hover:text-white">
            Proof
          </a>
          <a href="#dao" className="hover:text-white">
            DAO
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={LINKS.airdrop}
            className="hidden rounded-xl bg-[#ffd166] px-3 py-2 text-xs font-semibold text-[#050711] shadow-md shadow-yellow-500/30 hover:scale-[1.02] hover:bg-[#f4c457] md:inline-flex"
          >
            <Sparkles className="mr-1 h-4 w-4" />
            Claim Airdrop
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

function Hero(): ReactElement {
  return (
    <section id="hero" className="relative border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-center md:py-16">
        {/* Left / text */}
        <div className="relative z-10 flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
            <Globe2 className="h-3.5 w-3.5" />
            Family-centric Web3 ecosystem
          </div>

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

          {/* Token info */}
          <div className="mt-4 grid gap-3 text-xs text-white/60 md:grid-cols-[minmax(0,2fr),minmax(0,1.4fr)]">
            <div className="rounded-xl border border-white/10 bg-black/40 p-3">
              <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">Token Contract (BSC)</div>
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
                <span className="font-medium text-white/80">BNB Smart Chain (BSC)</span>
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

        {/* Right / visual */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/4 via-black/60 to-black/90 shadow-[0_0_120px_rgba(0,0,0,0.9)]" />
          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/70 p-5">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-white/40">
                <Sparkles className="h-3.5 w-3.5" />
                GAD Universe Map
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                Conceptual visual
              </span>
            </div>

            <div className="mt-4 grid grid-cols-[1.3fr,1fr] gap-4 md:grid-cols-[1.3fr,1fr]">
              {/* "Карта" */}
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
                  <div className="grid grid-cols-3 gap-3 text-[11px] text-white/70">
                    <HeroNode label="Wallet" />
                    <HeroNode label="App" />
                    <HeroNode label="Launchpad" />
                    <HeroNode label="NFT" />
                    <HeroNode label="DAO" />
                    <HeroNode label="Locks" />
                  </div>
                </div>
              </div>

              {/* Мини-инфо по экосистеме */}
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
                  <span>Everything connects back to GAD and real families.</span>
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

function HeroNode({ label }: { label: string }): ReactElement {
  return (
    <div className="relative rounded-xl border border-white/10 bg-black/70 px-2 py-1.5 text-center">
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-40" />
      <span className="relative z-10 text-[11px] text-white/75">{label}</span>
    </div>
  );
}

// ============================
// Ecosystem Overview
// ============================

function EcosystemSection(): ReactElement {
  return (
    <section id="ecosystem" className="border-b border-white/10 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Ecosystem Overview</h2>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              GAD is not just a token. It is a coordinated set of modules designed for families: wallet, app, launchpad,
              NFT, DAO, and future chain research.
            </p>
          </div>
          <p className="text-xs text-white/50">
            Each tile below is a building block. Some are live, others in active development or research.
          </p>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {ECOSYSTEM.map((item) => (
            <article
              key={item.id}
              id={
                item.id === 'wallet'
                  ? 'wallet'
                  : item.id === 'launchpad'
                  ? 'launchpad'
                  : item.id === 'nft'
                  ? 'nft'
                  : undefined
              }
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-4 transition hover:border-[#ffd166]/60 hover:bg-black/80"
            >
              <div className="pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-[#ffd166]/15" />
              <div className="relative z-10 flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-black/60">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">{item.name}</h3>
                    <p className="text-[11px] text-white/60">{item.tagline}</p>
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
              <div className="relative z-10 mt-4 flex items-center justify-between text-[11px] text-white/50">
                <span>
                  {item.status === 'live'
                    ? 'Available via web dApps.'
                    : item.status === 'in-progress'
                    ? 'Actively being built.'
                    : 'Concept and research stage.'}
                </span>
                {item.href && (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/70 hover:border-white/40"
                  >
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </article>
          ))}
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
    <section id="token" className="border-b border-white/10 bg-black/40 py-12 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.4fr,1fr] md:items-center">
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl">GAD Token Utility</h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            GAD is the core asset of the ecosystem. It is used across the family app, wallet, DAO, NFT marketplace, and
            long-term value flows connected to real behaviour.
          </p>

          <div className="mt-5 space-y-3 text-sm text-white/75">
            <UtilityItem
              title="In-app rewards & family goals"
              text="Daily steps, quests, and shared family challenges convert into GAD rewards, with multipliers for premium plans."
            />
            <UtilityItem
              title="Governance & xGAD"
              text="Staking GAD into xGAD unlocks governance rights over treasury, parameters, rewards, and future expansions."
            />
            <UtilityItem
              title="Staking, farming & LP"
              text="GAD underpins liquidity pools, farming programs, and long-term holder incentives around real utility."
            />
            <UtilityItem
              title="NFT economy & digital items"
              text="NFT badges, collections, and future toy-linked drops use GAD as a core currency and value gateway."
            />
            <UtilityItem
              title="Subscriptions & premium features"
              text="Future premium features in the app and wallet tie back to GAD, including step multipliers and family-level perks."
            />
          </div>
        </div>

        {/* Simple flow card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#020617] via-black to-[#0f172a] p-4">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#ffd166]/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 left-0 h-40 w-40 rounded-full bg-emerald-500/15 blur-3xl" />

          <div className="relative z-10 space-y-3 text-xs text-white/70">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-white/40">
              <Sparkles className="h-3.5 w-3.5" />
              Value flow snapshot
            </div>

            <FlowRow label="Families" value="Steps, locations, goals, real-world behaviour" />
            <FlowRow label="App & Wallet" value="Track, score, and route activity into rewards" />
            <FlowRow label="GAD Token" value="Minted & used according to rules, not promises" />
            <FlowRow label="DAO & Treasury" value="Decide how to route value, grants, and buybacks" />
            <FlowRow label="Back to Families" value="Upgrades, perks, and new features for real users" />
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
        <div className="text-[13px] font-semibold text-white">{title}</div>
        <p className="text-[13px] text-white/70">{text}</p>
      </div>
    </div>
  );
}

function FlowRow({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-white/70">{label}</span>
        <span className="text-[10px] text-white/40">→</span>
      </div>
      <p className="mt-1 text-[11px] text-white/65">{value}</p>
    </div>
  );
}

// ============================
// Token Distribution
// ============================

function TokenDistributionSection(): ReactElement {
  const total = TOKEN_DISTRIBUTION.reduce((acc, item) => acc + item.value, 0);

  return (
    <section className="border-b border-white/10 py-12 md:py-14">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-[1.3fr,1fr] md:items-start">
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl">Token Distribution</h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            High-level allocation of the 10T fixed supply. Exact percentages and mechanics are reflected on-chain via
            locks, vesting contracts, and the treasury Safe.
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
                    <span className="text-[13px] font-medium text-white">{item.name}</span>
                    {item.hint && <span className="text-[11px] text-white/55">{item.hint}</span>}
                  </div>
                </div>
                <span className="text-sm font-semibold text-[#ffd166]">{item.value}%</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-white/50">
            Total: {total}% • Total supply: <span className="font-mono text-white/70">10,000,000,000,000 GAD</span> •
            Burn: open for everyone via standard functions.
          </p>
        </div>

        {/* Simple "locks" card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/70 p-4 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-300" />
              <span className="text-[11px] uppercase tracking-[0.16em] text-white/50">Locks & vesting</span>
            </div>
            <ul className="mt-3 space-y-2">
              <li>
                Long-term allocations are locked for 36 months with unlocks every 6 months. 10% of each unlocked tranche
                is targeted for burns; the remaining share supports app incentives and operations.
              </li>
              <li>
                Early investor and team allocations are managed by the Vesting Vault contract, with transparent TGE and
                cliff logic enforced on-chain.
              </li>
              <li>Liquidity positions are locked via the LP locker, keeping core LP secure for the community.</li>
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
    <section id="proof" className="border-b border-white/10 bg-black/40 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Proof & Transparency</h2>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              Critical contracts are deployed, verified, and tied into a Safe multisig treasury. The goal is simple: no
              hidden logic, no surprise mints, no invisible owner actions.
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
      </div>
    </section>
  );
}

function ContractCard({ contract }: { contract: ProofContract }): ReactElement {
  return (
    <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/70 p-4 text-xs text-white/70">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-white/15 bg-black/70">
            <Link2 className="h-4 w-4 text-[#ffd166]" />
          </div>
          <h3 className="text-sm font-semibold text-white">{contract.label}</h3>
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
      <p className="mt-3 text-[11px]">{contract.description}</p>
      <div className="mt-3 rounded-xl border border-white/10 bg-black/70 p-2 font-mono text-[10px] text-white/60 break-all">
        {contract.addr}
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

// ============================
// Roadmap / Milestones
// ============================

function RoadmapSection(): ReactElement {
  return (
    <section id="dao" className="border-b border-white/10 bg-black/40 py-12 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Progress & Roadmap</h2>
            <p className="mt-1 max-w-xl text-sm text-white/70">
              Instead of promises-only roadmaps, GAD is built around concrete deployed pieces, active work, and clearly
              separated future plans.
            </p>
          </div>
          <div className="text-xs text-white/50">
            DAO logic evolves gradually: first contracts and treasury, then UI and community votes.
          </div>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {MILESTONES.map((group) => (
            <article
              key={group.title}
              className="flex h-full flex-col rounded-2xl border border-white/10 bg-black/70 p-4 text-xs text-white/70"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#ffd166]" />
                <h3 className="text-sm font-semibold text-white">{group.title}</h3>
              </div>
              <ul className="mt-3 space-y-2">
                {group.items.map((it) => (
                  <li key={it} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
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
    <section id="community" className="py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-[1.3fr,1fr] md:items-center">
          <div>
            <h2 className="text-xl font-extrabold md:text-2xl">Community & Communication</h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              GAD is being built in the open: from contract addresses to long-term plans. Community channels will
              gradually reflect the true state of the ecosystem, not hype cycles.
            </p>
          </div>
          <div className="grid gap-3 text-xs text-white/75 md:grid-cols-2">
            <CommunityLink label="X (Twitter)" href={LINKS.x} />
            <CommunityLink label="Discord" href={LINKS.discord} />
            <CommunityLink label="Docs & Litepaper" href={LINKS.docs} />
            <CommunityLink label="Proof / Contracts" href={LINKS.proof} internal />
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
    <footer className="border-t border-white/10 bg-black/70 py-6 text-xs text-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 md:flex-row md:items-center">
        <div>
          © {new Date().getFullYear()} {BRAND.fullName}. Built for real families, not just charts.
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={LINKS.github}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 text-white/60 hover:text-white"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
          </a>
          <span className="h-3 w-px bg-white/20" />
          <Link href="/terms" className="hover:text-white">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-white">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
