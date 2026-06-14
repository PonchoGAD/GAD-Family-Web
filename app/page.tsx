'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight, BarChart3, CheckCircle2, Coins, ExternalLink,
  Layers, Lock, Network, RadioTower, Shield, Sparkles,
  Users, Wallet, Globe2, Zap, TrendingUp, Activity,
} from 'lucide-react';

// ─── Brand (GAD Corp v1.0) ────────────────────────────────────────────────
const GOLD   = '#facc15';
const VIOLET = '#a78bfa';
const BLACK  = '#020617';
const OBS    = '#0b1120';
const MID    = '#0f172a';
const SLATE  = '#475569';
const SLATEL = '#94a3b8';
const SYNE   = 'Syne, sans-serif';

const ADDR = {
  token:     '0x858bab88A5b8d7f29a40380c5F2D8d0b8812FE62',
  launchpad: '0x528e90A8304dCd05B351F1291eA34d7d74E4A08d',
  usdt:      '0x55d398326f99059fF775485246999027B3197955',
};

const LINKS = {
  pancake:   `https://pancakeswap.finance/swap?inputCurrency=${ADDR.usdt}&outputCurrency=${ADDR.token}`,
  bscscan:   `https://bscscan.com/token/${ADDR.token}`,
  launchpad: '/launchpad',
  nft:       '/nft',
  wallet:    '/wallet',
  dao:       '/dao',
  airdrop:   '/airdrop',
  proof:     '/proof',
  investors: '/investors',
  pitch:     '/pitch',
  x:         'https://x.com/FamilyGad',
  discord:   'https://discord.gg/p6r4YFa9Pn',
  whitepaper:'https://coinpaprika.com/storage/cdn/whitepapers/224970267.pdf',
};

// ─── Animated counter hook ────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, active = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(ease * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, active]);
  return value;
}

// ─── Intersection observer hook ───────────────────────────────────────────
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Scroll fade component ────────────────────────────────────────────────
function FadeUp({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useVisible();
  return (
    <div ref={ref} className={`fade-up ${visible ? 'visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

// ─── Stat counter ─────────────────────────────────────────────────────────
function StatCounter({ value, suffix = '', prefix = '', label, color = GOLD }: { value: number; suffix?: string; prefix?: string; label: string; color?: string }) {
  const { ref, visible } = useVisible();
  const count = useCounter(value, 1600, visible);
  return (
    <div ref={ref} className="text-center">
      <div style={{ fontFamily: SYNE, fontWeight: 800, fontSize: 'clamp(24px,4vw,36px)', color, lineHeight: 1 }}>
        {prefix}{count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: SLATEL, fontSize: 12, marginTop: 6, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  );
}

// ─── Orbital ecosystem ────────────────────────────────────────────────────
const ORBIT_NODES = [
  { icon: '👟', label: 'Move-to-Earn', angle: 0,   ring: 1 },
  { icon: '🎨', label: 'NFT',          angle: 72,  ring: 1 },
  { icon: '🌾', label: 'Farming',      angle: 144, ring: 1 },
  { icon: '🏛️', label: 'DAO',          angle: 216, ring: 1 },
  { icon: '💼', label: 'Wallet',       angle: 288, ring: 1 },
  { icon: '🤖', label: 'AI Coach',     angle: 36,  ring: 2 },
  { icon: '🚀', label: 'Launchpad',    angle: 156, ring: 2 },
  { icon: '🔗', label: 'BSC Chain',    angle: 276, ring: 2 },
];

function OrbitalMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <div className="relative flex items-center justify-center" style={{ width: 340, height: 340, margin: '0 auto' }}>
      {/* Ring 2 — outer */}
      <div className="orbit-ring-3 absolute rounded-full" style={{ width: 320, height: 320, border: '1px solid rgba(167,139,250,0.15)', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(0deg)' }}>
        {ORBIT_NODES.filter(n => n.ring === 2).map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const r = 160;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          return (
            <div key={node.label} className="orbit-node-3 absolute" style={{ left: `calc(50% + ${x}px - 20px)`, top: `calc(50% + ${y}px - 20px)`, width: 40, height: 40 }}>
              <button onMouseEnter={() => setHovered(node.label)} onMouseLeave={() => setHovered(null)}
                style={{ width: 40, height: 40, borderRadius: '50%', background: hovered === node.label ? 'rgba(167,139,250,0.2)' : OBS, border: `1px solid ${hovered === node.label ? VIOLET : 'rgba(148,163,184,0.2)'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'default', transition: 'all 0.2s', fontSize: 14 }}
                title={node.label}>
                {node.icon}
              </button>
            </div>
          );
        })}
      </div>

      {/* Ring 1 — inner */}
      <div className="orbit-ring-1 absolute rounded-full" style={{ width: 220, height: 220, border: '1px solid rgba(250,204,21,0.2)', top: '50%', left: '50%', transform: 'translate(-50%,-50%) rotate(0deg)' }}>
        {ORBIT_NODES.filter(n => n.ring === 1).map((node) => {
          const rad = (node.angle * Math.PI) / 180;
          const r = 110;
          const x = Math.cos(rad) * r;
          const y = Math.sin(rad) * r;
          return (
            <div key={node.label} className="orbit-node-1 absolute" style={{ left: `calc(50% + ${x}px - 22px)`, top: `calc(50% + ${y}px - 22px)`, width: 44, height: 44 }}>
              <button onMouseEnter={() => setHovered(node.label)} onMouseLeave={() => setHovered(null)}
                style={{ width: 44, height: 44, borderRadius: '50%', background: hovered === node.label ? 'rgba(250,204,21,0.2)' : OBS, border: `1px solid ${hovered === node.label ? GOLD : 'rgba(250,204,21,0.3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'default', transition: 'all 0.2s', fontSize: 16, boxShadow: hovered === node.label ? `0 0 20px rgba(250,204,21,0.3)` : 'none' }}
                title={node.label}>
                {node.icon}
              </button>
            </div>
          );
        })}
      </div>

      {/* Core */}
      <div className="absolute pulse-gold" style={{ width: 80, height: 80, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,204,21,0.25), rgba(250,204,21,0.05))', border: `2px solid ${GOLD}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ fontFamily: SYNE, fontWeight: 800, color: GOLD, fontSize: 18, lineHeight: 1 }}>GAD</div>
        <div style={{ color: SLATEL, fontSize: 9, letterSpacing: '0.1em' }}>TOKEN</div>
      </div>

      {/* Hovered label */}
      {hovered && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2" style={{ background: OBS, border: `1px solid ${GOLD}`, borderRadius: 100, padding: '4px 12px', fontSize: 11, color: GOLD, fontFamily: SYNE, fontWeight: 600, whiteSpace: 'nowrap', zIndex: 20 }}>
          {hovered}
        </div>
      )}
    </div>
  );
}

// ─── Steps Calculator ─────────────────────────────────────────────────────
function StepsCalculator() {
  const [steps, setSteps] = useState(8000);
  const [plan, setPlan] = useState<'free' | 'plus' | 'pro'>('free');

  const PLANS = { free: { cap: 10000, mult: 1.0 }, plus: { cap: 15000, mult: 1.5 }, pro: { cap: 20000, mult: 2.0 } };
  const RATE = 0.0001;
  const { cap, mult } = PLANS[plan];
  const effectiveSteps = Math.min(steps, cap);
  const dailyPoints = effectiveSteps * RATE * mult;
  const monthlyPoints = dailyPoints * 30;
  const monthlyGAD = monthlyPoints;

  return (
    <div style={{ background: OBS, border: `1px solid rgba(250,204,21,0.25)`, borderRadius: 20, padding: 28 }}>
      <div style={{ fontFamily: SYNE, fontWeight: 700, color: '#f9fafb', marginBottom: 20 }} className="text-base">
        Калькулятор наград
        <span style={{ marginLeft: 8, background: 'rgba(250,204,21,0.12)', border: `1px solid rgba(250,204,21,0.28)`, color: GOLD, borderRadius: 100, padding: '2px 10px', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Move-to-Earn</span>
      </div>

      {/* Steps slider */}
      <div className="mb-5">
        <div className="flex justify-between mb-2">
          <span style={{ color: SLATEL, fontSize: 12 }}>Шагов в день</span>
          <span style={{ fontFamily: SYNE, fontWeight: 700, color: GOLD, fontSize: 14 }}>{steps.toLocaleString()}</span>
        </div>
        <input type="range" min={1000} max={25000} step={500} value={steps} onChange={e => setSteps(+e.target.value)}
          style={{ width: '100%', accentColor: GOLD, cursor: 'pointer' }} />
        <div className="flex justify-between mt-1">
          <span style={{ color: SLATE, fontSize: 10 }}>1,000</span>
          <span style={{ color: SLATE, fontSize: 10 }}>25,000</span>
        </div>
      </div>

      {/* Plan selector */}
      <div className="mb-6">
        <div style={{ color: SLATEL, fontSize: 12, marginBottom: 8 }}>Тарифный план</div>
        <div className="flex gap-2">
          {(['free', 'plus', 'pro'] as const).map(p => (
            <button key={p} onClick={() => setPlan(p)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `1px solid ${plan === p ? GOLD : 'rgba(148,163,184,0.2)'}`, background: plan === p ? 'rgba(250,204,21,0.12)' : MID, color: plan === p ? GOLD : SLATEL, fontFamily: SYNE, fontWeight: 600, fontSize: 12, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s' }}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ color: SLATE, fontSize: 11, marginTop: 6 }}>
          Лимит: {PLANS[plan].cap.toLocaleString()} шагов · Множитель: ×{PLANS[plan].mult}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'GAD Points/день', value: dailyPoints.toFixed(1), color: SLATEL },
          { label: 'GAD Points/месяц', value: monthlyPoints.toFixed(0), color: GOLD },
          { label: 'Активных дней', value: '30', color: VIOLET },
        ].map(r => (
          <div key={r.label} style={{ background: MID, borderRadius: 12, padding: '12px 8px', textAlign: 'center' }}>
            <div style={{ fontFamily: SYNE, fontWeight: 800, color: r.color, fontSize: 18, lineHeight: 1 }}>{r.value}</div>
            <div style={{ color: SLATE, fontSize: 9, marginTop: 4, lineHeight: 1.4 }}>{r.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, fontSize: 10, color: SLATE, lineHeight: 1.5 }}>
        * GAD Points конвертируются в GAD еженедельно. Реальная ставка зависит от пула наград.
        {steps > cap && <span style={{ color: '#fb923c', display: 'block', marginTop: 4 }}>⚠️ {steps.toLocaleString()} шагов превышает лимит плана {plan} ({cap.toLocaleString()})</span>}
      </div>
    </div>
  );
}

// ─── Live Stats Ticker ────────────────────────────────────────────────────
const TICKER_ITEMS = [
  '👟 Семей активно: 1,247',
  '🪙 GAD Supply: 10,000,000,000,000',
  '🔒 Ecosystem Locked: 50% · 36 мес',
  '🌾 LP Locked: PancakeSwap v2',
  '🏛️ DAO: xGAD Governor активен',
  '🔥 Burn: 10% от каждого транша',
  '📱 Mobile App: in development',
  '🚀 IDO: Preparing · Q3 2026',
  '🔐 Audit: CertiK / Q2 2026',
  '💎 Total Supply: Фиксированный',
];

function StatsTicker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div style={{ background: OBS, borderTop: '1px solid rgba(250,204,21,0.12)', borderBottom: '1px solid rgba(250,204,21,0.12)', overflow: 'hidden', padding: '10px 0' }}>
      <div className="ticker-track" style={{ display: 'flex', gap: 48, whiteSpace: 'nowrap', width: 'max-content' }}>
        {doubled.map((item, i) => (
          <span key={i} style={{ color: SLATEL, fontSize: 12, fontFamily: SYNE, fontWeight: 500 }}>
            <span style={{ color: 'rgba(250,204,21,0.4)', marginRight: 24 }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function Page() {
  // scroll fade observer
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.fade-up');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: BLACK, color: '#f9fafb' }}>

      {/* ── Fixed background glows ── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute rounded-full" style={{ width: 700, height: 700, top: '-20%', left: '-10%', background: 'radial-gradient(circle, rgba(250,204,21,0.04), transparent 70%)' }} />
        <div className="absolute rounded-full" style={{ width: 600, height: 600, top: '30%', right: '-15%', background: 'radial-gradient(circle, rgba(167,139,250,0.06), transparent 70%)' }} />
        <div className="absolute rounded-full" style={{ width: 500, height: 500, bottom: '-10%', left: '20%', background: 'radial-gradient(circle, rgba(250,204,21,0.03), transparent 70%)' }} />
      </div>

      {/* ════════════════════════════════════════════
           HERO
      ════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingTop: 40, paddingBottom: 60 }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">

            {/* LEFT */}
            <div>
              {/* Badge */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(250,204,21,0.08)', border: `1px solid rgba(250,204,21,0.25)`, borderRadius: 100, padding: '6px 14px', marginBottom: 24 }}>
                <span className="live-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ color: GOLD, fontSize: 11, fontFamily: SYNE, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Live Ecosystem · BSC Mainnet</span>
              </div>

              {/* H1 */}
              <h1 style={{ fontFamily: SYNE, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 20 }} className="text-4xl sm:text-5xl md:text-6xl">
                Ходи.
                <br />
                Зарабатывай.
                <br />
                <span className="grad-text">Вместе.</span>
              </h1>

              <p style={{ color: SLATEL, fontSize: 16, lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>
                GAD — семейная экосистема Move-to-Earn на BNB Smart Chain.
                Шаги превращаются в токены. Семья — в команду.
                Всё прозрачно, всё on-chain.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                <Link href={LINKS.launchpad}
                  style={{ background: GOLD, color: BLACK, fontFamily: SYNE, fontWeight: 700, borderRadius: 14, padding: '13px 24px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, textDecoration: 'none', boxShadow: '0 0 32px rgba(250,204,21,0.25)' }}
                  className="hover:opacity-90 transition-opacity">
                  <BarChart3 size={16} /> Открыть Launchpad <ArrowRight size={16} />
                </Link>
                <a href={LINKS.pancake} target="_blank" rel="noreferrer noopener"
                  style={{ border: `1px solid rgba(250,204,21,0.3)`, color: GOLD, background: 'rgba(250,204,21,0.07)', borderRadius: 14, padding: '13px 20px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, textDecoration: 'none' }}
                  className="hover:opacity-80 transition-opacity">
                  <Coins size={16} /> Купить на PancakeSwap
                </a>
              </div>

              {/* Trust line */}
              <div className="flex flex-wrap gap-4 mb-6">
                {[
                  { icon: <Shield size={13} />, text: 'Treasury: Safe Multisig' },
                  { icon: <Lock size={13} />, text: 'LP Locked 36 мес' },
                  { icon: <CheckCircle2 size={13} />, text: 'Audit Q2 2026' },
                ].map(t => (
                  <span key={t.text} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: SLATEL, fontSize: 11 }}>
                    <span style={{ color: '#22c55e' }}>{t.icon}</span> {t.text}
                  </span>
                ))}
              </div>

              {/* Token address */}
              <div style={{ background: OBS, border: '1px solid rgba(148,163,184,0.12)', borderRadius: 12, padding: '10px 14px', display: 'inline-flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: SLATEL, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>GAD · BSC</span>
                <span style={{ fontFamily: 'Courier New, monospace', color: VIOLET, fontSize: 11 }}>{ADDR.token.slice(0, 18)}…</span>
                <a href={LINKS.bscscan} target="_blank" rel="noreferrer noopener"
                  style={{ color: GOLD, fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 3, textDecoration: 'none' }}>
                  <ExternalLink size={11} /> BscScan
                </a>
              </div>
            </div>

            {/* RIGHT — Orbital map */}
            <div className="flex justify-center">
              <div className="float-y">
                <OrbitalMap />
                {/* Investor chips below orbit */}
                <div className="flex justify-center gap-2 mt-4 flex-wrap">
                  <Link href={LINKS.investors}
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 100, padding: '5px 14px', fontSize: 11, fontFamily: SYNE, fontWeight: 600, textDecoration: 'none' }}>
                    Investor Hub
                  </Link>
                  <Link href={LINKS.pitch}
                    style={{ background: OBS, border: '1px solid rgba(148,163,184,0.2)', color: SLATEL, borderRadius: 100, padding: '5px 14px', fontSize: 11, textDecoration: 'none' }}>
                    Pitch Deck ↗
                  </Link>
                  <span style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', color: GOLD, borderRadius: 100, padding: '5px 14px', fontSize: 11, fontFamily: SYNE, fontWeight: 600 }}>
                    Preparing for IDO
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <StatsTicker />

      {/* ── Live Stat counters ── */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '40px 0', background: OBS }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <StatCounter value={10000000000000} suffix="" prefix="" label="Total Supply GAD"   color={GOLD}   />
            <StatCounter value={1247}            suffix="+"    label="Семей в экосистеме"      color={VIOLET} />
            <StatCounter value={36}              suffix=" мес" label="Ecosystem Lock"           color={GOLD}   />
            <StatCounter value={5}               suffix=""     label="Модулей экосистемы"       color={VIOLET} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           MOVE-TO-EARN
      ════════════════════════════════════════════ */}
      <section id="m2e" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 0' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
              <Activity size={13} color={VIOLET} />
              <span style={{ color: VIOLET, fontSize: 11, fontFamily: SYNE, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Move-to-Earn</span>
            </div>
            <h2 style={{ fontFamily: SYNE, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 12 }} className="text-3xl sm:text-4xl">
              Ходи. Зарабатывай GAD.
              <br />
              <span className="grad-text-gold">Каждый день.</span>
            </h2>
            <p style={{ color: SLATEL, fontSize: 15, maxWidth: 500, lineHeight: 1.7, marginBottom: 48 }}>
              Подключи GAD Family App, сделай 10 000 шагов — и получи GAD токены напрямую на BSC кошелёк. Anti-fraud движок защищает от накруток.
            </p>
          </FadeUp>

          <div className="grid gap-6 md:grid-cols-2 items-start">
            {/* Flow */}
            <FadeUp delay={100}>
              <div className="space-y-3">
                {[
                  { step: '01', icon: '📱', title: 'Установи GAD Family App', desc: 'iOS + Android. Создай профиль семьи, пригласи членов.' },
                  { step: '02', icon: '👟', title: 'Ходи каждый день', desc: 'HealthKit (iOS) / Health Connect (Android). 10 000 шагов = стандартный тариф.' },
                  { step: '03', icon: '⚙️', title: 'Step Engine V2 считает', desc: 'Антифрод проверка на сервере. GAD Points начисляются автоматически.' },
                  { step: '04', icon: '💰', title: 'Выводи GAD на кошелёк', desc: 'Еженедельный payout через BSC smart contract. Реальные токены.' },
                ].map((item, i) => (
                  <div key={item.step} className="card-hover" style={{ display: 'flex', gap: 16, background: OBS, border: '1px solid rgba(148,163,184,0.1)', borderRadius: 16, padding: '16px 20px', alignItems: 'flex-start' }}>
                    <div style={{ fontFamily: SYNE, fontWeight: 800, color: 'rgba(250,204,21,0.3)', fontSize: 24, lineHeight: 1, minWidth: 32 }}>{item.step}</div>
                    <div style={{ fontSize: 24, lineHeight: 1, marginTop: 2 }}>{item.icon}</div>
                    <div>
                      <div style={{ fontFamily: SYNE, fontWeight: 700, color: '#f9fafb', fontSize: 14, marginBottom: 4 }}>{item.title}</div>
                      <div style={{ color: SLATEL, fontSize: 13, lineHeight: 1.6 }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Calculator */}
            <FadeUp delay={200}>
              <StepsCalculator />
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           ECOSYSTEM
      ════════════════════════════════════════════ */}
      <section id="ecosystem" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 0', background: OBS }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(148,163,184,0.07)', border: '1px solid rgba(148,163,184,0.15)', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
              <Layers size={13} color={GOLD} />
              <span style={{ color: SLATEL, fontSize: 11, fontFamily: SYNE, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ecosystem</span>
            </div>
            <h2 style={{ fontFamily: SYNE, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }} className="text-3xl sm:text-4xl">
              Все модули — один токен
            </h2>
            <p style={{ color: SLATEL, fontSize: 15, maxWidth: 500, lineHeight: 1.7, marginBottom: 48 }}>
              GAD объединяет 6 модулей в единую экосистему. Каждый модуль создаёт спрос на токен.
            </p>
          </FadeUp>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { id: 'app',      icon: <Users size={20} />,      name: 'GAD Family App',   tag: 'In Dev',    tagColor: '#fb923c', href: '/app',       desc: 'Move-to-Earn, геолокация, семейные цели, SOS, AI-советник. Основной источник спроса на GAD.' },
              { id: 'wallet',   icon: <Wallet size={20} />,     name: 'GAD Wallet',       tag: 'In Dev',    tagColor: '#fb923c', href: LINKS.wallet,  desc: 'Некастодиальный кошелёк с семейными ролями. Прямая интеграция с экосистемой.' },
              { id: 'launchpad',icon: <BarChart3 size={20} />,  name: 'Launchpad',        tag: 'Live',      tagColor: '#22c55e', href: LINKS.launchpad,desc: 'On-chain продажа GAD с прозрачным вестингом. Уже задеплоен и работает.' },
              { id: 'nft',      icon: <Sparkles size={20} />,   name: 'NFT Universe',     tag: 'Live',      tagColor: '#22c55e', href: LINKS.nft,     desc: 'AI-минт NFT, маркетплейс, achievement badges. OpenAI DALL-E + IPFS.' },
              { id: 'dao',      icon: <Network size={20} />,    name: 'DAO & Governance', tag: 'In Dev',    tagColor: '#fb923c', href: LINKS.dao,     desc: 'xGAD стейкинг → voting power. On-chain предложения, treasury governance.' },
              { id: 'chain',    icon: <RadioTower size={20} />, name: 'GAD Chain',        tag: 'R&D',       tagColor: '#38bdf8', href: undefined,     desc: 'Низкокомиссионная сеть оптимизированная для семейных платежей. В исследовании.' },
            ].map((item, i) => (
              <FadeUp key={item.id} delay={i * 60}>
                <div className="card-hover h-full" style={{ background: BLACK, border: '1px solid rgba(148,163,184,0.1)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: OBS, border: '1px solid rgba(148,163,184,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD }}>
                      {item.icon}
                    </div>
                    <span style={{ background: `${item.tagColor}18`, border: `1px solid ${item.tagColor}40`, color: item.tagColor, borderRadius: 100, padding: '3px 10px', fontSize: 10, fontFamily: SYNE, fontWeight: 700, letterSpacing: '0.06em' }}>
                      {item.tag}
                    </span>
                  </div>
                  <div style={{ fontFamily: SYNE, fontWeight: 700, color: '#f9fafb', fontSize: 15, marginBottom: 8 }}>{item.name}</div>
                  <p style={{ color: SLATEL, fontSize: 13, lineHeight: 1.6, flex: 1 }}>{item.desc}</p>
                  {item.href && (
                    <Link href={item.href} style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 4, color: GOLD, fontSize: 12, fontFamily: SYNE, fontWeight: 600, textDecoration: 'none' }}
                      className="hover:opacity-80 transition-opacity">
                      Открыть <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           TOKEN UTILITY
      ════════════════════════════════════════════ */}
      <section id="token" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 0' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">
            <FadeUp>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
                <Coins size={13} color={GOLD} />
                <span style={{ color: GOLD, fontSize: 11, fontFamily: SYNE, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Token Utility</span>
              </div>
              <h2 style={{ fontFamily: SYNE, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }} className="text-3xl sm:text-4xl">
                GAD — не просто токен.
                <br />
                <span className="grad-text-gold">Роутинговый актив.</span>
              </h2>
              <p style={{ color: SLATEL, fontSize: 15, lineHeight: 1.7, marginBottom: 32 }}>
                Соединяет реальное поведение людей с on-chain механиками. Каждый шаг, каждая NFT покупка, каждый голос в DAO — всё проходит через GAD.
              </p>
              <div className="space-y-4">
                {[
                  { title: 'Семейные награды M2E', text: 'Шаги, челленджи, цели → GAD Points → токены. Реальная польза каждый день.' },
                  { title: 'Governance через xGAD', text: 'Залочи GAD → получи xGAD → голосуй за параметры treasury, burns, incentives.' },
                  { title: 'DeFi: стейкинг и фарминг', text: 'GAD/USDT LP farming. Staking. Yield за долгосрочное удержание.' },
                  { title: 'NFT экономика', text: 'Marketplace fees, AI-mint, achievement badges — GAD как расчётный токен.' },
                  { title: 'Подписки и premium', text: 'Расширенные функции приложения оплачиваются в GAD → постоянный спрос.' },
                ].map((u, i) => (
                  <div key={u.title} className="flex items-start gap-3">
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      <CheckCircle2 size={12} color={GOLD} />
                    </div>
                    <div>
                      <div style={{ fontFamily: SYNE, fontWeight: 700, color: '#f9fafb', fontSize: 14 }}>{u.title}</div>
                      <p style={{ color: SLATEL, fontSize: 13, lineHeight: 1.6 }}>{u.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>

            {/* Token distribution visual */}
            <FadeUp delay={150}>
              <div style={{ background: OBS, border: '1px solid rgba(148,163,184,0.1)', borderRadius: 20, padding: 28 }}>
                <div style={{ fontFamily: SYNE, fontWeight: 700, color: '#f9fafb', marginBottom: 20 }}>Распределение токена</div>
                <div style={{ fontFamily: SYNE, fontWeight: 800, color: GOLD, fontSize: 28, marginBottom: 4 }}>10 000 000 000 000</div>
                <div style={{ color: SLATEL, fontSize: 12, marginBottom: 24 }}>GAD — фиксированный supply, не инфляционный</div>

                <div className="space-y-4">
                  {[
                    { name: 'Launchpad (public sale)', pct: 30, color: GOLD },
                    { name: 'Ecosystem Lock (36 мес)', pct: 50, color: VIOLET },
                    { name: 'Early Investors (vesting)', pct: 10, color: '#22c55e' },
                    { name: 'Founder & Core Dev', pct: 10, color: '#38bdf8' },
                  ].map((item) => (
                    <div key={item.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ color: SLATEL, fontSize: 13 }}>{item.name}</span>
                        <span style={{ fontFamily: SYNE, fontWeight: 700, color: item.color, fontSize: 14 }}>{item.pct}%</span>
                      </div>
                      <div style={{ height: 6, background: MID, borderRadius: 100, overflow: 'hidden' }}>
                        <div className="bar-animate" style={{ '--bar-w': `${item.pct}%`, height: '100%', borderRadius: 100, background: item.color } as React.CSSProperties} />
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 20, padding: '14px 16px', background: MID, borderRadius: 12, borderLeft: `3px solid ${GOLD}` }}>
                  <div style={{ color: GOLD, fontSize: 11, fontFamily: SYNE, fontWeight: 600, marginBottom: 6 }}>Burn механика</div>
                  <p style={{ color: SLATEL, fontSize: 12, lineHeight: 1.5 }}>10% от каждого tranша unlock сжигается. LP залочена через LP Locker контракт.</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           PROOF
      ════════════════════════════════════════════ */}
      <section id="proof" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 0', background: OBS }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
                  <Shield size={13} color="#22c55e" />
                  <span style={{ color: '#22c55e', fontSize: 11, fontFamily: SYNE, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>On-chain Proof</span>
                </div>
                <h2 style={{ fontFamily: SYNE, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }} className="text-3xl sm:text-4xl">Прозрачность — по умолчанию</h2>
                <p style={{ color: SLATEL, fontSize: 14, maxWidth: 460, lineHeight: 1.7 }}>Все критические компоненты задеплоены on-chain. Верифицируй сам.</p>
              </div>
              <Link href={LINKS.proof}
                style={{ border: '1px solid rgba(148,163,184,0.2)', color: SLATEL, background: BLACK, borderRadius: 12, padding: '10px 20px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, textDecoration: 'none', whiteSpace: 'nowrap', fontFamily: SYNE, fontWeight: 600 }}
                className="hover:border-white/40 transition-colors">
                Все контракты <ArrowRight size={14} />
              </Link>
            </div>
          </FadeUp>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'GAD Token',       addr: '0x858bab…FE62', href: `https://bscscan.com/token/${ADDR.token}`,          desc: 'BEP-20, фиксированный supply, основа экосистемы' },
              { label: 'Launchpad V3',    addr: '0x528e90…08d',  href: `https://bscscan.com/address/${ADDR.launchpad}`,     desc: 'On-chain продажа с прозрачным вестингом' },
              { label: 'Vesting Vault',   addr: '0x9653Cb…A15',  href: 'https://bscscan.com/address/0x9653Cb1fc5daD8A384c2dAD18A4223b77eCF4A15', desc: 'Управляет unlock-расписаниями команды и инвесторов' },
              { label: 'LP Token Locker', addr: '0xF40B3d…163',  href: 'https://bscscan.com/address/0xF40B3dE6822837E0c4d937eF20D67B944aE39163', desc: 'Блокирует LP токены для долгосрочной стабильности' },
              { label: 'Treasury Safe',   addr: '0xe08F53…736',  href: 'https://app.safe.global/home?safe=bnb:0xe08F53ac892E89b6Ba431b90A96C640A39386736', desc: 'Multisig кошелёк для всех критических средств' },
              { label: 'xGAD Locker',    addr: '0x247915…ea1',  href: 'https://bscscan.com/address/0x2479158bFA2a0F164E7a1B9b7CaF8d3Ea2307ea1', desc: 'Voting power для DAO governance' },
            ].map((c, i) => (
              <FadeUp key={c.label} delay={i * 50}>
                <div className="card-hover h-full" style={{ background: BLACK, border: '1px solid rgba(148,163,184,0.1)', borderRadius: 18, padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontFamily: SYNE, fontWeight: 700, color: '#f9fafb', fontSize: 14 }}>{c.label}</span>
                    <a href={c.href} target="_blank" rel="noreferrer noopener"
                      style={{ color: GOLD, border: `1px solid rgba(250,204,21,0.25)`, borderRadius: 100, padding: '3px 10px', fontSize: 10, textDecoration: 'none', fontFamily: SYNE, fontWeight: 600 }}
                      className="hover:opacity-80 transition-opacity">
                      BscScan ↗
                    </a>
                  </div>
                  <p style={{ color: SLATEL, fontSize: 12, lineHeight: 1.6, flex: 1, marginBottom: 12 }}>{c.desc}</p>
                  <div style={{ fontFamily: 'Courier New, monospace', color: VIOLET, fontSize: 11, background: MID, borderRadius: 8, padding: '6px 10px' }}>{c.addr}</div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           LAUNCHPAD / IDO
      ════════════════════════════════════════════ */}
      <section id="launchpad" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 0' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[1.4fr,1fr] md:items-center">
            <FadeUp>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
                <Zap size={13} color={GOLD} />
                <span style={{ color: GOLD, fontSize: 11, fontFamily: SYNE, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Launchpad · IDO</span>
              </div>
              <h2 style={{ fontFamily: SYNE, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }} className="text-3xl sm:text-4xl">
                On-chain продажа GAD.
                <br />
                <span className="grad-text-gold">Всё прозрачно.</span>
              </h2>
              <p style={{ color: SLATEL, fontSize: 15, lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>
                LaunchpadSaleV3 задеплоен на BSC. Вестинг, ликвидность и treasury — всё управляется смарт-контрактами, не командой вручную.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { label: 'On-chain caps', desc: 'Прозрачные лимиты' },
                  { label: 'LP Protection', desc: '% в ликвидность сразу' },
                  { label: 'Treasury Safe', desc: 'Multisig кастодия' },
                  { label: 'Vesting Vault', desc: 'Автоматический unlock' },
                ].map(f => (
                  <div key={f.label} style={{ background: OBS, border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontFamily: SYNE, fontWeight: 700, color: '#f9fafb', fontSize: 13, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ color: SLATEL, fontSize: 11 }}>{f.desc}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={LINKS.launchpad}
                  style={{ background: GOLD, color: BLACK, fontFamily: SYNE, fontWeight: 700, borderRadius: 12, padding: '12px 22px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, textDecoration: 'none' }}
                  className="hover:opacity-90 transition-opacity">
                  <BarChart3 size={16} /> Открыть Launchpad
                </Link>
                <a href={`https://bscscan.com/address/${ADDR.launchpad}`} target="_blank" rel="noreferrer noopener"
                  style={{ border: '1px solid rgba(148,163,184,0.2)', color: SLATEL, borderRadius: 12, padding: '12px 18px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, textDecoration: 'none' }}
                  className="hover:border-white/40 transition-colors">
                  <ExternalLink size={14} /> Sale Contract
                </a>
              </div>
            </FadeUp>

            {/* Airdrop card + investor card */}
            <FadeUp delay={150}>
              <div className="space-y-4">
                <div style={{ background: OBS, border: `1px solid ${GOLD}40`, borderRadius: 18, padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Sparkles size={18} color={GOLD} />
                    <span style={{ color: GOLD, fontFamily: SYNE, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Airdrop · Ранние участники</span>
                  </div>
                  <p style={{ color: SLATEL, fontSize: 13, lineHeight: 1.6, marginBottom: 16 }}>
                    Первые члены комьюнити, тестеры и ранние инвесторы получают on-chain аирдропы.
                  </p>
                  <Link href={LINKS.airdrop}
                    style={{ background: GOLD, color: BLACK, fontFamily: SYNE, fontWeight: 700, borderRadius: 100, padding: '8px 18px', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, textDecoration: 'none' }}
                    className="hover:opacity-90 transition-opacity">
                    Клеймить Airdrop <ArrowRight size={13} />
                  </Link>
                </div>

                <div style={{ background: OBS, border: '1px solid rgba(34,197,94,0.25)', borderRadius: 18, padding: 24 }}>
                  <div style={{ color: '#22c55e', fontFamily: SYNE, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Investor Hub</div>
                  <p style={{ color: SLATEL, fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>Фонды, launchpad площадки и стратегические партнёры — все материалы открыты.</p>
                  <div className="flex gap-2">
                    <Link href={LINKS.investors}
                      style={{ border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', background: 'rgba(34,197,94,0.08)', borderRadius: 10, padding: '8px 14px', fontSize: 12, textDecoration: 'none', fontFamily: SYNE, fontWeight: 600 }}>
                      Investor Hub →
                    </Link>
                    <Link href={LINKS.pitch}
                      style={{ border: '1px solid rgba(148,163,184,0.2)', color: SLATEL, borderRadius: 10, padding: '8px 14px', fontSize: 12, textDecoration: 'none' }}>
                      Pitch Deck
                    </Link>
                  </div>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           ROADMAP
      ════════════════════════════════════════════ */}
      <section id="roadmap" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 0', background: OBS }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <FadeUp>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 100, padding: '5px 14px', marginBottom: 16 }}>
              <TrendingUp size={13} color={VIOLET} />
              <span style={{ color: VIOLET, fontSize: 11, fontFamily: SYNE, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Roadmap</span>
            </div>
            <h2 style={{ fontFamily: SYNE, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }} className="text-3xl sm:text-4xl">
              Что уже сделано.
              <br />
              <span style={{ color: VIOLET }}>Что идёт дальше.</span>
            </h2>
            <p style={{ color: SLATEL, fontSize: 15, maxWidth: 500, lineHeight: 1.7, marginBottom: 48 }}>
              Execution-first роадмап. Всё что написано "Live" — уже задеплоено и верифицируемо.
            </p>
          </FadeUp>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'Live', color: '#22c55e',
                items: ['GAD token на BSC Mainnet', 'LaunchpadSaleV3 контракт', 'Vesting Vault & LP Locker', 'Treasury Safe Multisig', 'DAO Governor + xGAD', 'NFT Marketplace', 'AI-mint (DALL-E + IPFS)'],
              },
              {
                title: 'In Progress', color: GOLD,
                items: ['GAD Family App (Expo/Firebase)', 'HealthKit + Health Connect', 'Smart contract audit', 'Seed liquidity + farming', 'CoinGecko + CMC листинг', 'Market Making партнёр', 'Staking & farming UI'],
              },
              {
                title: 'Next', color: VIOLET,
                items: ['Публичный релиз App (iOS/Android)', 'IDO на PinkSale / Unicrypt', 'CEX листинг (Gate.io, MEXC)', 'AI Family Coach (Claude API)', 'Learn-to-Earn модуль', 'Family Digital Twin', 'GAD Chain Research'],
              },
            ].map((phase, i) => (
              <FadeUp key={phase.title} delay={i * 80}>
                <div style={{ background: BLACK, border: '1px solid rgba(148,163,184,0.1)', borderRadius: 20, padding: 24, height: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <div className="live-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: phase.color }} />
                    <span style={{ fontFamily: SYNE, fontWeight: 800, color: phase.color, fontSize: 16 }}>{phase.title}</span>
                  </div>
                  <ul className="space-y-2">
                    {phase.items.map(item => (
                      <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, color: SLATEL, fontSize: 13, lineHeight: 1.5 }}>
                        <span style={{ color: phase.color, marginTop: 2, flexShrink: 0 }}>
                          {phase.title === 'Live' ? '✓' : phase.title === 'In Progress' ? '→' : '○'}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           COMMUNITY + INVESTORS
      ════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '80px 0' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FadeUp>
              <div style={{ background: OBS, border: '1px solid rgba(148,163,184,0.1)', borderRadius: 20, padding: 28 }}>
                <h3 style={{ fontFamily: SYNE, fontWeight: 800, color: '#f9fafb', fontSize: 20, marginBottom: 10 }}>Комьюнити</h3>
                <p style={{ color: SLATEL, fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>GAD строится открыто. Каналы — реальность, не хайп.</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Twitter / X', href: LINKS.x },
                    { label: 'Discord', href: LINKS.discord },
                    { label: 'Whitepaper', href: LINKS.whitepaper },
                    { label: 'Proof / Contracts', href: LINKS.proof, internal: true },
                  ].map(link => (
                    link.internal
                      ? <Link key={link.label} href={link.href}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: BLACK, border: '1px solid rgba(148,163,184,0.12)', borderRadius: 12, padding: '10px 14px', color: SLATEL, fontSize: 13, textDecoration: 'none' }}
                          className="hover:border-white/30 transition-colors">
                          {link.label} <ExternalLink size={13} />
                        </Link>
                      : <a key={link.label} href={link.href} target="_blank" rel="noreferrer noopener"
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: BLACK, border: '1px solid rgba(148,163,184,0.12)', borderRadius: 12, padding: '10px 14px', color: SLATEL, fontSize: 13, textDecoration: 'none' }}
                          className="hover:border-white/30 transition-colors">
                          {link.label} <ExternalLink size={13} />
                        </a>
                  ))}
                </div>
              </div>
            </FadeUp>

            <FadeUp delay={100}>
              <div style={{ background: `linear-gradient(135deg, rgba(250,204,21,0.06), rgba(167,139,250,0.06))`, border: `1px solid ${GOLD}40`, borderRadius: 20, padding: 28, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontFamily: SYNE, fontWeight: 800, color: '#f9fafb', fontSize: 20, marginBottom: 10 }}>Инвесторам</h3>
                <p style={{ color: SLATEL, fontSize: 14, lineHeight: 1.7, flex: 1, marginBottom: 20 }}>
                  Фонды, launchpad площадки, стратегические партнёры — материалы открыты, структура прозрачна.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href={LINKS.investors}
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 12, padding: '10px 18px', fontSize: 13, textDecoration: 'none', fontFamily: SYNE, fontWeight: 600 }}
                    className="hover:opacity-80 transition-opacity">
                    Investor Hub →
                  </Link>
                  <Link href={LINKS.pitch}
                    style={{ border: '1px solid rgba(148,163,184,0.2)', color: SLATEL, borderRadius: 12, padding: '10px 18px', fontSize: 13, textDecoration: 'none' }}
                    className="hover:border-white/40 transition-colors">
                    Pitch Deck ↗
                  </Link>
                </div>
                <p style={{ color: SLATE, fontSize: 11, marginTop: 14 }}>Без приватных деков по запросу — прозрачность по умолчанию.</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
           FOOTER
      ════════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '40px 0', background: OBS }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="#facc15" strokeWidth="1.2" strokeOpacity=".4" />
                <circle cx="32" cy="32" r="22" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity=".5" />
                <circle cx="32" cy="32" r="14" stroke="#facc15" strokeWidth="1.5" strokeOpacity=".7" />
                <circle cx="32" cy="32" r="6" fill="#facc15" />
                <circle cx="32" cy="10" r="2" fill="#facc15" fillOpacity=".7" />
                <circle cx="54" cy="32" r="1.5" fill="#a78bfa" fillOpacity=".8" />
              </svg>
              <div>
                <div style={{ fontFamily: SYNE, fontWeight: 800, color: GOLD, fontSize: 15, lineHeight: 1 }}>GAD</div>
                <div style={{ fontFamily: SYNE, fontWeight: 400, color: SLATEL, fontSize: 9, letterSpacing: '0.12em' }}>CORP</div>
              </div>
              <span style={{ color: SLATEL, fontSize: 12, marginLeft: 8 }}>© {new Date().getFullYear()} GAD Corp. Built for families.</span>
            </div>

            {/* Nav */}
            <div className="flex flex-wrap items-center gap-4">
              {[
                { label: 'Investor Hub', href: LINKS.investors, internal: true },
                { label: 'Pitch', href: LINKS.pitch, internal: true },
                { label: 'Proof', href: LINKS.proof, internal: true },
                { label: 'Discord', href: LINKS.discord },
                { label: 'Twitter', href: LINKS.x },
              ].map(link => (
                link.internal
                  ? <Link key={link.label} href={link.href} style={{ color: SLATEL, fontSize: 12, textDecoration: 'none' }} className="hover:text-white transition-colors">{link.label}</Link>
                  : <a key={link.label} href={link.href} target="_blank" rel="noreferrer noopener" style={{ color: SLATEL, fontSize: 12, textDecoration: 'none' }} className="hover:text-white transition-colors">{link.label}</a>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, borderTop: '1px solid rgba(148,163,184,0.07)', paddingTop: 16 }}>
            <p style={{ color: SLATE, fontSize: 11, lineHeight: 1.6, maxWidth: 700 }}>
              Contracts deployed · Treasury via Safe multisig · LP locked · Audit in progress · On-chain first.
              Участие в экосистеме GAD предполагает понимание рисков крипторынка. Не финансовый совет.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
