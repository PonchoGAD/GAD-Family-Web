'use client';

import React from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Shield,
  Users,
  HeartPulse,
  Wallet as WalletIcon,
  MapPin,
  Clock,
  Rocket,
  Bug,
  CalendarDays,
  ExternalLink,
  Smartphone,
  Globe2,
  Sparkles,
} from 'lucide-react';

const FORM_URL =
  'https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true'; // TODO: replace with your real App Beta form
const BUY_URL =
  'https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const BSCSCAN =
  'https://bscscan.com/token/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const LAUNCHPAD_URL = '/launchpad';
const PROOF_URL = '/proof';

export default function AppDetailsPage(): ReactElement {
  return (
    <div className="min-h-screen bg-[#050711] text-white">
      {/* background glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 h-72 w-72 rounded-full bg-[#ffd166]/10 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <Topbar />
      <main>
        <Hero />
        <Overview />
        <EcosystemConnection />
        <FeatureGallery />
        <Status />
        <Timeline />
        <Beta />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function Topbar(): ReactElement {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-medium text-white/70 hover:text-white"
          >
            ← Back to Home
          </Link>
          <span className="hidden text-[11px] uppercase tracking-[0.16em] text-white/40 md:inline-block">
            GAD Family App • In development
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={LAUNCHPAD_URL}
            className="hidden items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:border-white/40 hover:bg-white/10 md:inline-flex"
          >
            <Rocket className="h-3.5 w-3.5" />
            Launchpad
          </Link>
          <a
            href={BSCSCAN}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden items-center gap-1 rounded-xl border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 hover:border-white/40 hover:bg-white/10 md:inline-flex"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Token on BscScan
          </a>
          <a
            href={BUY_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-2 rounded-xl bg-[#ffd166] px-3 py-2 text-xs font-semibold text-[#050711] shadow-md shadow-yellow-500/30 hover:scale-[1.02] hover:bg-[#f4c457]"
          >
            Buy GAD
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero(): ReactElement {
  return (
    <section className="relative border-b border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-center md:py-16">
        {/* Left: main story */}
        <div className="relative z-10 flex-1 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-emerald-200">
            <Globe2 className="h-3.5 w-3.5" />
            GAD Family App • Coming to iOS & Android
          </div>

          <div>
            <h1 className="text-balance text-3xl font-extrabold leading-tight md:text-5xl">
              The app that turns
              <span className="block bg-gradient-to-r from-[#ffd166] via-emerald-300 to-sky-400 bg-clip-text text-transparent">
                everyday family life into a shared game.
              </span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/75 md:text-base">
              GAD Family is a privacy-first app that brings together location
              safety, healthy routines, and a shared family wallet — with real
              incentives powered by the GAD token.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#ffd166] px-5 py-3 text-sm font-semibold text-[#050711] shadow-lg shadow-yellow-500/30 hover:scale-[1.02] hover:bg-[#f4c457]"
            >
              <Smartphone className="h-4 w-4" />
              Explore core features
            </a>
            <a
              href="#beta"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/25 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:border-white/45 hover:bg-white/10"
            >
              <Sparkles className="h-4 w-4" />
              Join beta waitlist
            </a>
          </div>

          <div className="mt-4 grid gap-3 text-xs text-white/60 md:grid-cols-3">
            <HeroStat label="Designed for" value="Real families" />
            <HeroStat label="Backed by" value="GAD token on BSC" />
            <HeroStat label="Availability" value="Planned Q1 2026" />
          </div>
        </div>

        {/* Right: visual placeholder */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-white/4 via-black/60 to-black/90 shadow-[0_0_120px_rgba(0,0,0,0.9)]" />
          <div className="relative z-10 overflow-hidden rounded-[2rem] border border-white/10 bg-black/80 p-5">
            <div className="flex items-center justify-between text-xs text-white/60">
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/40">
                App screens preview
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-white/60">
                Visual placeholder
              </span>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[1.2fr,1fr]">
              {/* Main screen placeholder */}
              <div className="relative">
                <div className="relative mx-auto h-64 w-40 rounded-[1.5rem] border border-white/15 bg-gradient-to-b from-[#111827] via-[#020617] to-black p-3">
                  <div className="flex items-center justify-between text-[10px] text-white/50">
                    <span>Family map</span>
                    <span>Today</span>
                  </div>
                  <div className="mt-2 h-[56%] rounded-xl bg-black/70">
                    {/* Map placeholder */}
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-[10px] text-white/45">
                      <MapPin className="h-4 w-4 text-[#ffd166]" />
                      <span>Safe zones • Live locations</span>
                    </div>
                  </div>
                  <div className="mt-2 h-[22%] rounded-xl bg-black/70">
                    {/* Steps / stats placeholder */}
                    <div className="flex h-full items-center justify-around text-[10px] text-white/60">
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase text-white/40">
                          Steps
                        </span>
                        <span className="text-xs font-semibold text-white">
                          8,420
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[9px] uppercase text-white/40">
                          GAD today
                        </span>
                        <span className="text-xs font-semibold text-[#ffd166]">
                          +24
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[9px] text-white/40">
                    <span>Wallet • Quests • Family</span>
                    <span>App concept only</span>
                  </div>
                </div>
              </div>

              {/* Secondary info */}
              <div className="flex flex-col justify-between gap-3 text-xs text-white/70">
                <div className="rounded-xl border border-white/15 bg-black/70 p-3">
                  <p>
                    Safe by design: family circles are invite-only, with clear
                    consent for location sharing and notifications.
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/70 p-3">
                  <p>
                    Rewarding by design: steps, routines, and quests connect to
                    an in-app scoring system and, over time, to GAD rewards.
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-black/70 p-3">
                  <p>
                    Transparent by design: the app is part of the same on-chain
                    ecosystem you can track via contracts and the Proof page.
                  </p>
                  <Link
                    href={PROOF_URL}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-300 hover:text-emerald-200"
                  >
                    <ExternalLink className="h-3 w-3" />
                    View ecosystem Proof
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

function HeroStat({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-3">
      <div className="text-[11px] text-white/50">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function Overview(): ReactElement {
  return (
    <section className="py-10 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-2 md:items-start">
        <div className="rounded-2xl border border-white/10 bg-black/70 p-6">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            What is the GAD Family App?
          </h2>
          <p className="mt-3 text-sm text-white/80">
            A single app that gives families a private map, a shared sense of
            direction, and a clear way to turn effort into tangible rewards.
            Safety, habits, and money, all in one place.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li>Private family circles with consent-based location sharing</li>
            <li>Move-to-earn engine built around steps and daily activity</li>
            <li>Shared wallet with limits, approvals, and savings goals</li>
            <li>Optional assistive layer for parents and kids, not a spy tool</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/70 p-6">
          <h3 className="text-xl font-bold">Why build this now?</h3>
          <p className="mt-3 text-sm text-white/80">
            Families already live inside phones and maps — but tools are
            fragmented, ad-driven, or not built for trust. GAD connects healthy
            behaviour with an on-chain economy that families can actually see
            and understand.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <Stat label="Focus" value="Families" />
            <Stat label="Chain" value="BSC" />
            <Stat label="Token" value="GAD" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }): ReactElement {
  return (
    <div className="rounded-xl border border-white/10 bg-black/80 p-4">
      <div className="text-lg font-extrabold">{value}</div>
      <div className="mt-1 text-sm text-white/70">{label}</div>
    </div>
  );
}

function EcosystemConnection(): ReactElement {
  return (
    <section className="border-y border-white/10 bg-black/40 py-10 md:py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center">
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            How the app connects to the GAD ecosystem
          </h2>
          <p className="mt-3 max-w-xl text-sm text-white/75">
            The app is not an isolated project. It is the user-facing gateway
            into the GAD token, DAO, NFT layers, and the broader family-focused
            economy we are building.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            <li>
              <span className="font-semibold">Token:</span> activity and
              behaviour aggregated off-chain, selectively bridged into GAD
              rewards.
            </li>
            <li>
              <span className="font-semibold">Wallet:</span> one place for
              parents and kids to manage balances, allowances, and goals.
            </li>
            <li>
              <span className="font-semibold">NFT:</span> badges, collections,
              and future toy-linked drops bound to family achievements.
            </li>
            <li>
              <span className="font-semibold">DAO:</span> over time, families
              can have a say in how rewards, grants, and features evolve.
            </li>
          </ul>
        </div>
        <div className="flex-1 space-y-3 text-xs text-white/70">
          <div className="rounded-2xl border border-white/15 bg-black/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/40">
              Designed around real flows
            </div>
            <p className="mt-2">
              Instead of promising pure yield, the app starts with real,
              measurable behaviour: walking, routines, family tasks. GAD is the
              layer that rewards and structures that behaviour.
            </p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/70 p-4">
            <div className="text-[11px] uppercase tracking-[0.16em] text-white/40">
              Built to be transparent
            </div>
            <p className="mt-2">
              Contracts, locks, and the treasury are visible on-chain. The app
              is where non-technical families feel the benefits without dealing
              with raw addresses and hashes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

type FeatureItem = {
  icon: ReactElement;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

const FEATURE_ITEMS: FeatureItem[] = [
  {
    icon: <Shield className="h-6 w-6 text-[#ffd166]" />,
    title: 'Safety Circles',
    description:
      'Invite-only family groups with clear location consent, safe arrival alerts, and optional check-in pings.',
    imageSrc: '/images/app-feature-safety.png', // placeholder path
    imageAlt: 'Illustration of family safety circles in the app',
  },
  {
    icon: <Users className="h-6 w-6 text-[#ffd166]" />,
    title: 'Roles & Permissions',
    description:
      'Parents, teens, kids, and trusted adults each see the right level of detail and control — no hidden tracking.',
    imageSrc: '/images/app-feature-roles.png',
    imageAlt: 'Illustration of family roles and permissions in the app',
  },
  {
    icon: <HeartPulse className="h-6 w-6 text-[#ffd166]" />,
    title: 'Move-to-Earn Engine',
    description:
      'Steps and active minutes power a scoring system that can unlock in-app bonuses and, later, GAD conversion paths.',
    imageSrc: '/images/app-feature-move.png',
    imageAlt: 'Illustration of move-to-earn mechanics',
  },
  {
    icon: <WalletIcon className="h-6 w-6 text-[#ffd166]" />,
    title: 'Shared Wallet',
    description:
      'Single view of balances, allowances, and family goals. Parents can approve, limit, and automate savings.',
    imageSrc: '/images/app-feature-wallet.png',
    imageAlt: 'Illustration of shared family wallet',
  },
  {
    icon: <MapPin className="h-6 w-6 text-[#ffd166]" />,
    title: 'Smart Places',
    description:
      'Home, school, and safe spots as geofences. Notifications only for what your family chooses to track.',
    imageSrc: '/images/app-feature-places.png',
    imageAlt: 'Illustration of smart places and geofences',
  },
  {
    icon: <Bug className="h-6 w-6 text-[#ffd166]" />,
    title: 'Privacy-First Telemetry',
    description:
      'Minimal data collection, local processing where possible, with clear opt-outs and no hidden ad tech.',
    imageSrc: '/images/app-feature-privacy.png',
    imageAlt: 'Illustration of privacy and telemetry controls',
  },
];

function FeatureGallery(): ReactElement {
  return (
    <section id="features" className="py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">
              Features at a glance
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/75">
              Each module in the app is built to feel simple on the surface —
              while connecting back to a verifiable, on-chain foundation when
              needed.
            </p>
          </div>
          <p className="text-xs text-white/50">
            Visuals below are placeholders. Final design will follow the unified
            GAD brand system.
          </p>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {FEATURE_ITEMS.map((feature) => (
            <article
              key={feature.title}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/70"
            >
              {/* Image placeholder */}
              <div className="relative aspect-[4/3] w-full border-b border-white/10 bg-gradient-to-br from-[#111827] via-[#020617] to-black">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs text-white/45">
                  <span>Feature visual placeholder</span>
                  <span className="text-[10px] text-white/35">
                    {feature.title}
                  </span>
                </div>
                {/* When ready, replace placeholder with real image */}
                <Image
                  src={feature.imageSrc}
                  alt={feature.imageAlt}
                  fill
                  className="object-cover opacity-0" // make it invisible until real assets are added
                />
              </div>

              {/* Text content */}
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/15 bg-black/70">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="mt-2 text-xs text-white/80">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Status(): ReactElement {
  return (
    <section className="border-y border-white/10 bg-black/40 py-10 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 md:grid-cols-3">
        <Card
          icon={<Rocket className="h-5 w-5 text-[#ffd166]" />}
          title="Current Stage"
          text="Core architecture and UX in progress. Tied directly to the GAD ecosystem contracts already live on BSC."
        />
        <Card
          icon={<CalendarDays className="h-5 w-5 text-[#ffd166]" />}
          title="Next Milestone"
          text="Closed beta with invited families to validate safety flows, rewards logic, and daily routines."
        />
        <Card
          icon={<Clock className="h-5 w-5 text-[#ffd166]" />}
          title="Release Target"
          text="Planned Q1 2026 public launch on iOS and Android, with quests and basic staking hooks."
        />
      </div>
    </section>
  );
}

function Card({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}): ReactElement {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/70 p-5">
      <div>{icon}</div>
      <h3 className="mt-3 text-lg font-bold">{title}</h3>
      <p className="mt-1 text-sm text-white/80">{text}</p>
    </div>
  );
}

function Timeline(): ReactElement {
  const phases = [
    {
      when: 'Q3 2025',
      items: [
        'Token and core website live',
        'Liquidity and locks established on BSC',
        'Initial app architecture and prototypes',
      ],
    },
    {
      when: 'Q4 2025',
      items: [
        'Closed beta with invited families',
        'Telemetry and QA focused on real usage',
        'Fundraising aligned with app launch',
      ],
    },
    {
      when: 'Q1 2026',
      items: [
        'Public app release (iOS / Android)',
        'Marketing and partnership rollout',
        'Post-launch quests, rewards, and staking hooks',
      ],
    },
  ];

  return (
    <section className="py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-extrabold md:text-3xl">Timeline</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {phases.map((phase) => (
            <div
              key={phase.when}
              className="rounded-2xl border border-white/10 bg-black/70 p-5"
            >
              <h3 className="text-sm font-bold text-[#ffd166]">
                {phase.when}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-white/85">
                {phase.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Beta(): ReactElement {
  return (
    <section id="beta" className="py-10 md:py-12">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-2 lg:items-start">
        <div className="rounded-2xl border border-white/10 bg-black/70 p-6">
          <h2 className="text-2xl font-extrabold md:text-3xl">
            How the beta program works
          </h2>
          <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-white/85">
            <li>Apply with basic family details and optional wallet address.</li>
            <li>
              We invite cohorts in waves, sending builds and clear
              instructions.
            </li>
            <li>
              Test real-life flows: school days, trips, walks, chores,
              allowances.
            </li>
            <li>
              Share feedback via in-app prompts and forms. Top testers may
              receive GAD rewards and early access perks.
            </li>
          </ol>
          <p className="mt-3 text-xs text-white/70">
            Privacy-first approach: only essential telemetry; no sale of
            personal data; opt-out is always available.
          </p>
          <div className="mt-4">
            <a
              href="#waitlist"
              className="inline-flex items-center gap-2 rounded-xl bg-[#ffd166] px-4 py-2 text-sm font-bold text-[#050711] hover:bg-[#f4c457]"
            >
              Join beta waitlist
            </a>
          </div>
        </div>
        <div
          id="waitlist"
          className="overflow-hidden rounded-2xl border border-white/10 bg-black/70"
        >
          <div className="px-6 pt-6">
            <h3 className="text-sm font-bold text-white">Beta waitlist form</h3>
            <p className="text-xs text-white/70">
              Fill in the form — we will contact you when your cohort opens.
            </p>
          </div>
          <div className="aspect-[3/4] w-full">
            <iframe
              src={FORM_URL}
              className="h-full w-full border-0"
              loading="lazy"
              title="GAD Family App Beta Waitlist"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ(): ReactElement {
  const items = [
    {
      q: 'Will the app be free?',
      a: 'Core features will be free. Over time, optional premium perks and multipliers may be available, always clearly labeled.',
    },
    {
      q: 'iOS and Android?',
      a: 'Yes. We plan availability on both iOS (TestFlight and App Store) and Android (internal tracks and Play Store).',
    },
    {
      q: 'Will rewards be on-chain?',
      a: 'The app starts with in-app points and score logic. Paths to GAD conversion are added with anti-abuse rules and clear limits.',
    },
  ];

  return (
    <section className="py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-extrabold md:text-3xl">FAQ</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.q}
              className="rounded-2xl border border-white/10 bg-black/70 p-5"
            >
              <h3 className="text-sm font-bold text-white">{item.q}</h3>
              <p className="mt-2 text-sm text-white/80">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA(): ReactElement {
  return (
    <section className="border-y border-white/10 bg-black/40 py-12">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-extrabold">
          Help us build the app families actually need.
        </h2>
        <p className="mt-3 text-sm text-white/80">
          Join the beta and become part of the group that shapes how safety,
          money, and habits work together in the GAD universe.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <a
            href="#beta"
            className="rounded-2xl bg-[#ffd166] px-5 py-3 text-sm font-bold text-[#050711] hover:bg-[#f4c457]"
          >
            Join beta →
          </a>
          <Link
            href={PROOF_URL}
            className="rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-xs font-semibold text-white/85 hover:border-white/40 hover:bg-white/10"
          >
            See how the ecosystem is structured
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer(): ReactElement {
  return (
    <footer className="py-8 text-xs text-white/70">
      <div className="mx-auto max-w-6xl px-4">
        © {new Date().getFullYear()} GAD Family • App overview
      </div>
    </footer>
  );
}
