'use client';

import React from 'react';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { Smartphone, Shield, Users, HeartPulse, Wallet, MapPin, Clock, Rocket, Bug, CalendarDays, ExternalLink } from 'lucide-react';

const FORM_URL = 'https://docs.google.com/forms/d/e/FORM_ID/viewform?embedded=true'; // TODO: replace with your App Beta form (or reuse invest form)
const BUY_URL  = 'https://pancakeswap.finance/swap?inputCurrency=0x55d398326f99059fF775485246999027B3197955&outputCurrency=0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const BSCSCAN  = 'https://bscscan.com/address/0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';

export default function AppDetailsPage(): ReactElement {
  return (
    <div className="min-h-screen bg-[#0b0f17] text-white">
      <Topbar />
      <Hero />
      <Overview />
      <Features />
      <Status />
      <Timeline />
      <Beta />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}

function Topbar(): ReactElement {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-black/30 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm opacity-90 hover:opacity-100">← Back to Home</Link>
        <div className="flex items-center gap-2">
          <a href={BUY_URL} target="_blank" rel="noreferrer noopener" className="px-3 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold">
            Buy GAD
          </a>
          <a href={BSCSCAN} target="_blank" rel="noreferrer noopener" className="px-3 py-2 rounded-xl border border-white/20 hover:border-white/40 flex items-center gap-1 text-sm">
            BscScan <ExternalLink className="w-4 h-4" />
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
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Introducing the <span className="text-[#ffd166]">GAD Family</span> App</h1>
        <p className="mt-4 text-white/80 max-w-3xl">
          We proudly present our upcoming application for real families: private safety circles, healthy habits,
          shared wallet, and rewards powered by the GAD token.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#features" className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15">Explore features</a>
          <a href="#beta" className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40">Join beta</a>
        </div>
      </div>
    </section>
  );
}

function Overview(): ReactElement {
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-8 items-start">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-extrabold">What is the GAD Family App?</h2>
          <p className="mt-3 text-white/80">
            A simple, privacy-first app that helps families stay safe, build healthy routines, and manage money together.
            GAD provides incentives: move-to-earn, quests, and shared goals.
          </p>
          <ul className="mt-4 space-y-2 text-white/85 list-disc list-inside">
            <li>Private family circles and geofenced notifications</li>
            <li>Step tracking → rewards in-app</li>
            <li>Shared wallet (limits, approvals, safe allowances)</li>
            <li>Non-intrusive AI safety assistant for kids & parents</li>
          </ul>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="text-xl font-bold">Why now?</h3>
          <p className="mt-3 text-white/80">
            Families want tools that are both safe and motivating. Crypto incentives help keep good habits consistent
            and transparent. We combine easy UX with on-chain guarantees.
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
    <div className="bg-black/30 rounded-xl p-4 border border-white/10">
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-white/70 text-sm mt-1">{label}</div>
    </div>
  );
}

function Features(): ReactElement {
  const items = [
    { icon: <Shield className="w-6 h-6 text-[#ffd166]" />, title: 'Safety Circles', text: 'Invite-only family groups, location consent, geofences and safe arrival alerts.' },
    { icon: <Users className="w-6 h-6 text-[#ffd166]" />, title: 'Parental Controls', text: 'Healthy screen-time and content guardrails with transparent rules.' },
    { icon: <HeartPulse className="w-6 h-6 text-[#ffd166]" />, title: 'Move-to-Earn', text: 'Steps and active minutes become points convertible to GAD rewards.' },
    { icon: <Wallet className="w-6 h-6 text-[#ffd166]" />, title: 'Shared Wallet', text: 'Allowances, spend limits, approvals, and auto-savings goals for kids.' },
    { icon: <MapPin className="w-6 h-6 text-[#ffd166]" />, title: 'Smart Places', text: 'Home/School/Club geofences, optional notifications for trusted members.' },
    { icon: <Bug className="w-6 h-6 text-[#ffd166]" />, title: 'Privacy-First', text: 'Minimal data collection, local processing where possible, opt-in telemetry.' },
  ];
  return (
    <section id="features" className="py-10">
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

function Status(): ReactElement {
  return (
    <section className="py-10 bg-black/20 border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-6">
        <Card
          icon={<Rocket className="w-5 h-5 text-[#ffd166]" />}
          title="Current Stage"
          text="Q3 2025 — Token & website live; app development in progress."
        />
        <Card
          icon={<CalendarDays className="w-5 h-5 text-[#ffd166]" />}
          title="Next Milestone"
          text="Q4 2025 — Closed beta testing, fundraising for launch."
        />
        <Card
          icon={<Clock className="w-5 h-5 text-[#ffd166]" />}
          title="Release Target"
          text="Q1 2026 — Public app release with quests & staking."
        />
      </div>
    </section>
  );
}

function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }): ReactElement {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
      <div>{icon}</div>
      <h3 className="mt-3 font-bold text-lg">{title}</h3>
      <p className="mt-1 text-white/80">{text}</p>
    </div>
  );
}

function Timeline(): ReactElement {
  const phases = [
    { when: 'Q3 2025', items: ['Website live', 'Token launched', 'V2 LP + LP lock', 'App core in development'] },
    { when: 'Q4 2025', items: ['Closed beta (invites)', 'Telemetry & QA', 'Fundraising for launch'] },
    { when: 'Q1 2026', items: ['Public release (iOS/Android)', 'Marketing & partnerships', 'Post-launch quests & staking'] },
  ];
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-extrabold">Timeline</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-6">
          {phases.map((p) => (
            <div key={p.when} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold">{p.when}</h3>
              <ul className="mt-3 space-y-2 list-disc list-inside text-white/85">
                {p.items.map((x, i) => <li key={i}>{x}</li>)}
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
    <section id="beta" className="py-10">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-extrabold">How the Beta Works</h2>
          <ol className="mt-4 space-y-2 list-decimal list-inside text-white/85">
            <li>Apply with your details (wallet optional for rewards).</li>
            <li>We invite cohorts in waves; you’ll receive test builds and instructions.</li>
            <li>Complete quests & report feedback via in-app and form.</li>
            <li>Top testers may get allowlist spots and GAD rewards.</li>
          </ol>
          <p className="mt-3 text-white/70 text-sm">
            Privacy-first: only essential telemetry; opt-out anytime.
          </p>
          <div className="mt-4">
            <a href="#waitlist" className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-bold">Join beta waitlist</a>
          </div>
        </div>
        <div id="waitlist" className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 pt-6">
            <h3 className="font-bold">Beta Waitlist Form</h3>
            <p className="text-white/70 text-sm">Fill the form — we’ll contact you when your cohort opens.</p>
          </div>
          <div className="aspect-[3/4] w-full">
            <iframe src={FORM_URL} className="w-full h-full border-0" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQ(): ReactElement {
  const items = [
    { q: 'Will the app be free?', a: 'Yes. Core features will be free. Optional premium perks may appear later.' },
    { q: 'iOS and Android?', a: 'Both. We plan simultaneous availability via TestFlight and internal tracks.' },
    { q: 'Will rewards be on-chain?', a: 'In-app points first; periodic conversion paths to GAD with anti-abuse checks.' },
  ];
  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-extrabold">FAQ</h2>
        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {items.map((x, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="font-bold">{x.q}</h3>
              <p className="mt-2 text-white/80">{x.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA(): ReactElement {
  return (
    <section className="py-12 bg-black/20 border-y border-white/10">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-extrabold">We’re building for real families.</h2>
        <p className="mt-3 text-white/80">Join the beta and help us shape a safer, healthier routine for everyone.</p>
        <div className="mt-5">
          <a href="#beta" className="px-5 py-3 rounded-2xl bg-[#ffd166] text-[#0b0f17] font-bold">Join Beta →</a>
        </div>
      </div>
    </section>
  );
}

function Footer(): ReactElement {
  return (
    <footer className="py-8 text-white/70">
      <div className="max-w-6xl mx-auto px-4">
        © {new Date().getFullYear()} GAD Family • App details
      </div>
    </footer>
  );
}
