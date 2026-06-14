'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ─── Brand tokens (GAD Corp brandbook v1.0) ───────────────────────────────
const B = {
  black:    '#020617',
  obsidian: '#0b1120',
  midnight: '#0f172a',
  slate:    '#334155',
  slateMid: '#475569',
  slateLight:'#94a3b8',
  white:    '#f9fafb',
  gold:     '#facc15',
  goldGlow: 'rgba(250,204,21,0.15)',
  goldBorder:'rgba(250,204,21,0.28)',
  violet:   '#a78bfa',
  violetGlow:'rgba(167,139,250,0.13)',
  violetBorder:'rgba(167,139,250,0.25)',
  success:  '#22c55e',
  danger:   '#f87171',
  info:     '#38bdf8',
};

const CONTACT_EMAIL = 'invest@gad-family.com';

// ─── Contracts (BSC Mainnet) ──────────────────────────────────────────────
const CONTRACTS = {
  token:     '0x858bab88A5b8d7f29a40380c5F2D8d0b8812FE62',
  launchpad: '0x528e90A8304dCd05B351F1291eA34d7d74E4A08d',
  vesting:   '0x9653Cb1fc5daD8A384c2dAD18A4223b77eCF4A15',
  lpLocker:  '0xF40B3dE6822837E0c4d937eF20D67B944aE39163',
  treasury:  '0xe08F53ac892E89b6Ba431b90A96C640A39386736',
};

// ─── Types ────────────────────────────────────────────────────────────────
type Phase = { id: string; label: string; items: string[]; status: 'done' | 'now' | 'next' };

// ─── Data ─────────────────────────────────────────────────────────────────
const ROADMAP: Phase[] = [
  {
    id: 'q2-2026', label: 'Q2 2026 — Security Sprint', status: 'now',
    items: [
      'Smart contract audit (CertiK / Hacken)',
      'Seed liquidity $10k+ в GAD/USDT пул',
      'LP tokens залочены через LP Locker',
      'CoinGecko + CoinMarketCap листинг заявки',
      'Public GitHub repo + Whitepaper update',
    ],
  },
  {
    id: 'q3-2026', label: 'Q3 2026 — Move-to-Earn Launch', status: 'next',
    items: [
      'GAD Family App — публичный релиз (iOS + Android)',
      'HealthKit + Health Connect интеграция',
      'Farming программа GAD/USDT с реальными наградами',
      'Market Making партнёрство',
      'IDO на PinkSale / Unicrypt',
    ],
  },
  {
    id: 'q4-2026', label: 'Q4 2026 — Growth & Listings', status: 'next',
    items: [
      'CEX листинг (Gate.io / MEXC / BitMart)',
      '10k+ активных пользователей в приложении',
      'DAO governance активен (xGAD voting)',
      'NFT Achievement Badges on-chain',
      'AI Family Coach (Anthropic Claude API)',
    ],
  },
  {
    id: 'q1-2027', label: 'Q1 2027 — Ecosystem Scale', status: 'next',
    items: [
      'Learn-to-Earn модуль',
      'Family Digital Twin (AI предиктивная модель)',
      'Geo Social — семьи рядом',
      'Real World Assets (RWA) трекер',
      'Первый Tier-2 CEX листинг',
    ],
  },
];

const LIQUIDITY_PLAN = [
  {
    step: '01',
    title: 'Seed Liquidity Pool',
    priority: 'Критично',
    color: B.gold,
    timeline: 'Неделя 1–2',
    budget: '$10 000 – $15 000',
    actions: [
      'Добавить $10k+ в GAD/USDT пул на PancakeSwap v2',
      'Одновременно добавить GAD/BNB пул для диверсификации',
      'Немедленно залочить LP токены через LP Locker контракт',
      'Опубликовать proof: screenshot + BscScan + LP locker tx',
    ],
    why: 'Без ликвидности нет цены → нет трекеров → нет инвесторов. $10k создаёт торгуемый рынок с разумным slippage.',
  },
  {
    step: '02',
    title: 'Smart Contract Audit',
    priority: 'Критично',
    color: B.gold,
    timeline: 'Неделя 2–6',
    budget: '$5 000 – $15 000',
    actions: [
      'Запустить аудит в CertiK, Hacken или PeckShield',
      'Параллельно: бесплатный аудит от Slither + MythX',
      'Опубликовать аудит PDF на сайте и в Telegram',
      'Добавить аудит badge от CertiK на главную страницу',
    ],
    why: 'Ни один серьёзный CEX и ни один институциональный инвестор не войдёт без аудита. Это главный trust signal.',
  },
  {
    step: '03',
    title: 'Трекеры: CoinGecko + CMC',
    priority: 'Важно',
    color: B.violet,
    timeline: 'Неделя 3–8',
    budget: 'Бесплатно',
    actions: [
      'Подать заявку на CoinGecko (нужно: контракт, сайт, соцсети)',
      'Подать заявку на CoinMarketCap (нужны 30+ дней торгов)',
      'Настроить DexScreener страницу (автоматически при торгах)',
      'Настроить GeckoTerminal профиль',
    ],
    why: 'После попадания в CoinGecko трафик на сайт вырастает в 3–10 раз органически. Бесплатный маркетинг.',
  },
  {
    step: '04',
    title: 'Farming Rewards Program',
    priority: 'Важно',
    color: B.violet,
    timeline: 'Месяц 1–2',
    budget: 'Из экосистемного пула GAD',
    actions: [
      'Активировать FarmingDashboard (уже есть в коде)',
      'Выставить APR 50–100% для GAD/USDT LP провайдеров',
      'Анонсировать программу в Twitter + Discord + Telegram',
      'Каждые 2 недели корректировать APR на основе TVL',
    ],
    why: 'Farming привлекает DeFi-нативных инвесторов которые добавляют ликвидность ради yield. Это самый быстрый способ нарастить TVL.',
  },
  {
    step: '05',
    title: 'Community & Social Proof',
    priority: 'Параллельно',
    color: B.slateLight,
    timeline: 'Постоянно',
    budget: '$2 000 – $5 000/мес',
    actions: [
      'Twitter/X: 3–5 постов в неделю (обновления, proof, milestones)',
      'Discord: активное комьюнити с ролями и каналами',
      'Telegram: канал обновлений + чат',
      'Medium: технические статьи о токеномике и архитектуре',
      'KOL partnerships: 2–3 крипто-блогера с BSC аудиторией',
    ],
    why: 'Инвесторы смотрят на активность комьюнити. Мёртвый Twitter при живом контракте — красный флаг.',
  },
  {
    step: '06',
    title: 'Market Making',
    priority: 'Месяц 2–3',
    color: B.violet,
    timeline: 'После аудита',
    budget: 'По договорённости (%)',
    actions: [
      'Переговоры с Gotbit, Skynet Trading, AlphaQuark',
      'Минимальный MM: $20k ликвидности под управлением',
      'Условие: tight spreads, стабилизация цены',
      'Прозрачно объявить о MM партнёрстве комьюнити',
    ],
    why: 'Market Maker устраняет манипуляции ценой и делает торги стабильными — ключевое требование CEX для листинга.',
  },
  {
    step: '07',
    title: 'IDO / Launchpad',
    priority: 'Месяц 2–4',
    color: B.gold,
    timeline: 'После аудита + сообщество',
    budget: '$5 000 – $20 000',
    actions: [
      'PinkSale / Unicrypt (BSC-нативные, Trust Score важен)',
      'DxSale как альтернатива',
      'Целевой raise: $100k–$300k в IDO раунде',
      '10% raise → немедленно в ликвидность при листинге',
      'Публичный vesting schedule для IDO участников',
    ],
    why: 'IDO создаёт сообщество держателей, которые мотивированы на рост цены и распространение проекта.',
  },
  {
    step: '08',
    title: 'CEX Листинг',
    priority: 'Месяц 4–8',
    color: B.gold,
    timeline: 'После IDO + трекеры',
    budget: '$20 000 – $80 000',
    actions: [
      'Gate.io — наиболее доступный Tier-2 CEX ($20-30k)',
      'MEXC — активный с BSC проектами ($15-25k)',
      'BitMart — хорош для M2E + lifestyle проектов',
      'Bybit (Tier-1) — после роста, ~$50-80k',
      'Binance — долгосрочная цель после 50k+ holders',
    ],
    why: 'CEX листинг = 10–100x прирост аудитории. Без предыдущих шагов не одобрят.',
  },
];

const INVESTMENT_TIERS = [
  {
    tier: 'Seed',
    range: '$1 000 – $10 000',
    description: 'Ранние believers. Специальные условия в Launchpad.',
    benefits: ['Приоритетный доступ к IDO аллокации', 'Bonus GAD tokens (+20%)', 'Whitelist в следующих раундах', 'Early access к beta app'],
    color: B.slateLight,
    border: 'rgba(148,163,184,0.2)',
  },
  {
    tier: 'Strategic',
    range: '$10 000 – $50 000',
    description: 'Стратегические партнёры с правом голоса.',
    benefits: ['Прямой звонок с командой', 'DAO governance роль (xGAD)', 'Участие в roadmap обсуждениях', 'Co-marketing возможности', 'Ежемесячный отчёт с метриками'],
    color: B.gold,
    border: B.goldBorder,
  },
  {
    tier: 'Lead',
    range: '$50 000 – $300 000',
    description: 'Lead инвестор с board seat и правами.',
    benefits: ['Место в Advisory Board', 'Кастомный vesting (переговорный)', 'Brand partnership', 'Token allocation с cliff 6 мес', 'Revenue sharing из NFT marketplace', 'Quarterly board calls'],
    color: B.violet,
    border: B.violetBorder,
  },
];

// ─── Sub-components ────────────────────────────────────────────────────────

function Pill({ children, gold, violet }: { children: React.ReactNode; gold?: boolean; violet?: boolean }) {
  const bg = gold ? B.goldGlow : violet ? B.violetGlow : 'rgba(255,255,255,0.06)';
  const border = gold ? B.goldBorder : violet ? B.violetBorder : 'rgba(255,255,255,0.1)';
  const color = gold ? B.gold : violet ? B.violet : B.slateLight;
  return (
    <span style={{ background: bg, border: `1px solid ${border}`, color }} className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium tracking-[0.04em]">
      {children}
    </span>
  );
}

function SectionLabel({ num, text }: { num: string; text: string }) {
  return (
    <div className="mb-8 flex items-center gap-3">
      <div className="h-px w-6" style={{ background: B.slateMid }} />
      <span style={{ fontFamily: 'Syne, sans-serif', color: B.slateMid }} className="text-[11px] font-semibold tracking-[0.14em] uppercase">
        <span style={{ color: B.gold }}>{num}</span> {text}
      </span>
    </div>
  );
}

function Card({ children, gold, violet, className = '' }: { children: React.ReactNode; gold?: boolean; violet?: boolean; className?: string }) {
  const border = gold ? B.goldBorder : violet ? B.violetBorder : 'rgba(148,163,184,0.1)';
  return (
    <div style={{ background: B.obsidian, border: `1px solid ${border}` }} className={`rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function ContractRow({ label, addr, href }: { label: string; addr: string; href: string }) {
  return (
    <div style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }} className="flex items-center justify-between gap-4 py-3 last:border-0">
      <span style={{ color: B.slateLight }} className="text-sm font-medium min-w-[140px]">{label}</span>
      <span style={{ fontFamily: 'Courier New, monospace', color: B.violet }} className="text-[11px] break-all flex-1 hidden md:block">{addr}</span>
      <a href={href} target="_blank" rel="noreferrer noopener"
        style={{ color: B.gold, borderColor: B.goldBorder }}
        className="text-[11px] border rounded-full px-3 py-1 whitespace-nowrap hover:opacity-80 transition-opacity">
        BscScan ↗
      </a>
    </div>
  );
}

export default function InvestorsPage() {
  const [activePhase, setActivePhase] = useState<string>('q2-2026');

  return (
    <main style={{ background: B.black, fontFamily: 'Inter, sans-serif', color: B.white }} className="min-h-screen">

      {/* ─── Background orbits ─────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
        <div className="absolute -top-40 right-[-10%] rounded-full" style={{ width: 800, height: 800, border: `1px solid rgba(250,204,21,0.05)`, borderRadius: '50%', transform: 'translateY(0)' }} />
        <div className="absolute -top-40 right-[-10%] rounded-full" style={{ width: 560, height: 560, border: `1px solid rgba(167,139,250,0.04)`, borderRadius: '50%', margin: '120px 80px' }} />
        <div style={{ position: 'absolute', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', top: '50%', right: '5%', transform: 'translateY(-50%)' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,204,21,0.06) 0%, transparent 70%)', top: '-10%', left: '-5%' }} />
      </div>

      {/* ═══════════════════════════════════════════════════════════════
           HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-6 pt-14 pb-10">
        <div style={{ background: B.obsidian, border: `1px solid rgba(148,163,184,0.1)` }} className="relative overflow-hidden rounded-3xl p-8 sm:p-12">

          {/* Glow */}
          <div className="pointer-events-none absolute -top-32 right-[-80px] rounded-full blur-3xl" style={{ width: 320, height: 320, background: `radial-gradient(circle, ${B.goldGlow}, transparent 70%)` }} />
          <div className="pointer-events-none absolute -bottom-32 -left-20 rounded-full blur-3xl" style={{ width: 320, height: 320, background: B.violetGlow }} />

          {/* GAD Corp logo row */}
          <div className="mb-8 flex items-center gap-3">
            {/* Orbit icon */}
            <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#facc15" strokeWidth="1.2" strokeOpacity=".4" />
              <circle cx="32" cy="32" r="22" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity=".5" />
              <circle cx="32" cy="32" r="14" stroke="#facc15" strokeWidth="1.5" strokeOpacity=".7" />
              <circle cx="32" cy="32" r="9" fill="rgba(250,204,21,0.15)" />
              <circle cx="32" cy="32" r="6" fill="#facc15" />
              <circle cx="32" cy="10" r="2" fill="#facc15" fillOpacity=".7" />
              <circle cx="54" cy="32" r="1.5" fill="#a78bfa" fillOpacity=".8" />
            </svg>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 800, color: B.gold, lineHeight: 1, letterSpacing: '-0.02em' }}>GAD</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 10, fontWeight: 400, color: B.slateMid, letterSpacing: '0.12em' }}>CORP</div>
            </div>
          </div>

          {/* Pills */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Pill gold>Move-to-Earn</Pill>
            <Pill violet>AI Family OS</Pill>
            <Pill>BNB Chain</Pill>
            <Pill>SocialFi</Pill>
            <Pill>DAO Governed</Pill>
            <Pill>NFT + DeFi</Pill>
          </div>

          {/* H1 */}
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.05 }} className="text-3xl sm:text-5xl mb-5">
            Investor Hub
            <span className="block" style={{ background: `linear-gradient(135deg, ${B.gold} 0%, ${B.violet} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              GAD Corp
            </span>
          </h1>

          <p style={{ color: B.slateLight, maxWidth: 560, lineHeight: 1.7 }} className="text-sm sm:text-base mb-8">
            Первая семейная AI-экосистема с Move-to-Earn механикой на BSC. Реальная утилита,
            прозрачная токеномика, работающие контракты. Страница для Due Diligence.
          </p>

          {/* CTA row */}
          <div className="flex flex-wrap gap-3 mb-10">
            <a href={`mailto:${CONTACT_EMAIL}?subject=GAD%20Corp%20Investor%20Inquiry`}
              style={{ background: B.gold, color: B.black, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm hover:opacity-90 transition-opacity">
              Написать инвестору →
            </a>
            <Link href="/pitch"
              style={{ border: `1px solid ${B.goldBorder}`, color: B.gold, background: B.goldGlow }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm hover:opacity-80 transition-opacity">
              Pitch Deck ↗
            </Link>
            <a href="#liquidity"
              style={{ border: '1px solid rgba(148,163,184,0.2)', color: B.slateLight }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm hover:opacity-80 transition-opacity">
              Liquidity Plan
            </a>
            <a href="#transparency"
              style={{ border: '1px solid rgba(148,163,184,0.2)', color: B.slateLight }}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm hover:opacity-80 transition-opacity">
              Proof & Contracts
            </a>
          </div>

          {/* Status grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Стадия проекта', value: 'Active Dev', hint: 'App + Web3 infra', color: B.success },
              { label: 'Governance', value: 'DAO Live', hint: 'On-chain xGAD voting', color: B.violet },
              { label: 'Security', value: 'Audit Q2', hint: 'CertiK / Hacken', color: B.gold },
              { label: 'Fundraising', value: 'Preparing IDO', hint: 'Target: $300k–$500k', color: B.info },
            ].map((s) => (
              <div key={s.label} style={{ background: B.midnight, border: '1px solid rgba(148,163,184,0.08)' }} className="rounded-2xl p-4">
                <div style={{ color: B.slateMid }} className="text-[10px] uppercase tracking-[0.07em] mb-2">{s.label}</div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: s.color }} className="text-base">{s.value}</div>
                <div style={{ color: B.slateMid }} className="text-[11px] mt-1">{s.hint}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           OVERVIEW
      ═══════════════════════════════════════════════════════════════ */}
      <section id="overview" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <SectionLabel num="01" text="Проект" />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.01em' }} className="text-2xl sm:text-3xl mb-3">
          Что такое GAD Corp?
        </h2>
        <p style={{ color: B.slateLight, maxWidth: 520 }} className="text-sm sm:text-base mb-8 leading-relaxed">
          AI Family Operating System — операционная система семьи. Не просто приложение-шагомер, а целая экосистема.
        </p>

        <div className="grid gap-5 md:grid-cols-3 mb-8">
          {[
            { icon: '👟', title: 'Move-to-Earn', desc: 'Шаги → GAD Points → реальные токены GAD на BSC. Anti-fraud engine, Step Engine V2, семейные цели.' },
            { icon: '🤖', title: 'AI Family Coach', desc: 'Claude API (Anthropic) анализирует активность, цели и финансы семьи. Даёт персональные рекомендации 24/7.' },
            { icon: '🏛️', title: 'DeFi Ecosystem', desc: 'Launchpad, стейкинг, farming, NFT marketplace, DAO governance — всё на BSC, всё on-chain и верифицируемо.' },
          ].map((item) => (
            <Card key={item.title}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: B.white }} className="text-base mb-2">{item.title}</div>
              <p style={{ color: B.slateLight }} className="text-sm leading-relaxed">{item.desc}</p>
            </Card>
          ))}
        </div>

        {/* Problem / Solution */}
        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <div style={{ color: B.slateLight, fontFamily: 'Syne, sans-serif', fontWeight: 600 }} className="text-sm uppercase tracking-[0.08em] mb-4">Проблема</div>
            <ul style={{ color: B.slateLight }} className="space-y-2 text-sm leading-relaxed">
              <li>— Большинство Web3 проектов: спекуляция, а не утилита</li>
              <li>— M2E проекты (Stepn и др.) рухнули из-за неустойчивой эмиссии</li>
              <li>— Семьи хотят безопасность + здоровье в одном месте</li>
              <li>— Web3 onboarding слишком сложен для массового пользователя</li>
            </ul>
          </Card>
          <Card gold>
            <div style={{ color: B.gold, fontFamily: 'Syne, sans-serif', fontWeight: 600 }} className="text-sm uppercase tracking-[0.08em] mb-4">Наше решение</div>
            <ul style={{ color: '#f9fafb' }} className="space-y-2 text-sm leading-relaxed">
              <li>✓ Семейно-ориентированный продукт с ежедневным использованием</li>
              <li>✓ Устойчивая токеномика: 50% supply залочено на 36 мес, 10% сжигается</li>
              <li>✓ Anti-fraud engine: нельзя накрутить шаги</li>
              <li>✓ Multi-platform: мобильное приложение + Web dApp + DAO</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           TOKEN UTILITY
      ═══════════════════════════════════════════════════════════════ */}
      <section id="token" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <SectionLabel num="02" text="Токен GAD" />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.01em' }} className="text-2xl sm:text-3xl mb-3">
          Как работает токен
        </h2>
        <p style={{ color: B.slateLight, maxWidth: 520 }} className="text-sm sm:text-base mb-8 leading-relaxed">
          Не спекулятивный актив. Роутинговый токен связывающий реальное поведение, DeFi и governance.
        </p>

        {/* Token stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Supply', value: '10T GAD', hint: 'Фиксированный, не инфляционный' },
            { label: 'Public Sale', value: '30%', hint: 'Launchpad + IDO' },
            { label: 'Ecosystem Lock', value: '50%', hint: '36 мес, unlock каждые 6 мес' },
            { label: 'Burn механика', value: '10%', hint: 'От каждого транша unlock' },
          ].map((s) => (
            <div key={s.label} style={{ background: B.obsidian, border: `1px solid ${B.goldBorder}` }} className="rounded-2xl p-4">
              <div style={{ color: B.slateMid }} className="text-[10px] uppercase tracking-[0.07em] mb-2">{s.label}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: B.gold }} className="text-lg">{s.value}</div>
              <div style={{ color: B.slateMid }} className="text-[11px] mt-1">{s.hint}</div>
            </div>
          ))}
        </div>

        {/* Utility grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: '👟', title: 'M2E Rewards', desc: 'Шаги → GAD Points → GAD на кошелёк. Еженедельный payout через BSC.' },
            { icon: '🔒', title: 'Staking / xGAD', desc: 'Залочи GAD → получи xGAD → голосуй в DAO. Voting power = доля в протоколе.' },
            { icon: '🌾', title: 'Farming LP', desc: 'GAD/USDT LP токены приносят yield. Farming dashboard уже в коде.' },
            { icon: '🖼️', title: 'NFT Economy', desc: 'Achievement badges, marketplace fees, AI-mint. GAD как settlement токен.' },
            { icon: '💳', title: 'App Subscriptions', desc: 'Premium тариф в GAD: больше шагов, AI-советник, семейные функции.' },
            { icon: '🏛️', title: 'DAO Governance', desc: 'Решения по treasury, burns, incentives, partnerships — через on-chain голосование.' },
          ].map((u) => (
            <Card key={u.title}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{u.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: B.white }} className="text-sm mb-1">{u.title}</div>
              <p style={{ color: B.slateLight }} className="text-xs leading-relaxed">{u.desc}</p>
            </Card>
          ))}
        </div>

        {/* Contract address */}
        <div style={{ background: B.midnight, border: `1px solid rgba(148,163,184,0.1)` }} className="mt-6 rounded-2xl p-5">
          <div style={{ color: B.slateMid }} className="text-[10px] uppercase tracking-[0.08em] mb-3">GAD Token Contract (BSC Mainnet)</div>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <span style={{ fontFamily: 'Courier New, monospace', color: B.violet, fontSize: 12 }}>{CONTRACTS.token}</span>
            <a href={`https://bscscan.com/token/${CONTRACTS.token}`} target="_blank" rel="noreferrer noopener"
              style={{ color: B.gold, border: `1px solid ${B.goldBorder}`, background: B.goldGlow }}
              className="text-[11px] rounded-full px-3 py-1 whitespace-nowrap hover:opacity-80 transition-opacity">
              View on BscScan ↗
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           LIQUIDITY PLAN  ← ключевая секция
      ═══════════════════════════════════════════════════════════════ */}
      <section id="liquidity" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <SectionLabel num="03" text="Ликвидность" />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.01em' }} className="text-2xl sm:text-3xl mb-3">
          Стратегия ликвидности
          <span style={{ color: B.gold }}> & привлечения инвестиций</span>
        </h2>
        <p style={{ color: B.slateLight, maxWidth: 560 }} className="text-sm sm:text-base mb-3 leading-relaxed">
          Без ликвидности нет цены → нет трекеров → нет инвесторов. Пошаговый план от первого пула до CEX листинга.
        </p>

        {/* Critical formula */}
        <div style={{ background: B.obsidian, border: `1px solid ${B.goldBorder}` }} className="rounded-2xl p-5 mb-8">
          <div style={{ color: B.gold, fontFamily: 'Syne, sans-serif', fontWeight: 700 }} className="text-xs uppercase tracking-[0.1em] mb-3">Главная формула успеха</div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {['Seed Liquidity $10k+', '→', 'Аудит', '→', 'CoinGecko/CMC', '→', 'Farming 50%+ APR', '→', 'IDO $300k', '→', 'CEX листинг'].map((item, i) => (
              <span key={i} style={{ color: item === '→' ? B.slateMid : B.white, fontFamily: item !== '→' ? 'Syne, sans-serif' : undefined, fontWeight: item !== '→' ? 600 : 400, background: item !== '→' ? 'rgba(250,204,21,0.08)' : 'transparent', border: item !== '→' ? `1px solid ${B.goldBorder}` : 'none', padding: item !== '→' ? '4px 10px' : '0', borderRadius: 100 }}>{item}</span>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {LIQUIDITY_PLAN.map((plan) => (
            <div key={plan.step} style={{ background: B.obsidian, border: `1px solid rgba(148,163,184,0.1)` }} className="rounded-2xl overflow-hidden">
              <div className="flex items-start gap-5 p-6">
                {/* Step number */}
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: plan.color, fontSize: 28, lineHeight: 1, minWidth: 36 }}>
                  {plan.step}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: B.white }} className="text-base">{plan.title}</span>
                    <span style={{ background: plan.color === B.gold ? B.goldGlow : plan.color === B.violet ? B.violetGlow : 'rgba(148,163,184,0.1)', border: `1px solid ${plan.color === B.gold ? B.goldBorder : plan.color === B.violet ? B.violetBorder : 'rgba(148,163,184,0.2)'}`, color: plan.color }} className="text-[10px] font-semibold tracking-[0.06em] uppercase rounded-full px-2 py-0.5">{plan.priority}</span>
                    <span style={{ color: B.slateMid }} className="text-xs">{plan.timeline}</span>
                    <span style={{ color: B.gold, background: B.goldGlow, border: `1px solid ${B.goldBorder}` }} className="text-[11px] rounded-full px-2 py-0.5">{plan.budget}</span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-[1fr,auto]">
                    <ul className="space-y-1">
                      {plan.actions.map((action, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: B.slateLight }}>
                          <span style={{ color: plan.color, marginTop: 2 }}>✓</span>
                          {action}
                        </li>
                      ))}
                    </ul>
                    <div style={{ background: B.midnight, border: '1px solid rgba(148,163,184,0.08)', borderLeft: `2px solid ${plan.color}` }} className="rounded-xl p-4 max-w-xs self-start">
                      <div style={{ color: plan.color }} className="text-[10px] uppercase tracking-[0.08em] font-semibold mb-2">Почему важно</div>
                      <p style={{ color: B.slateLight }} className="text-xs leading-relaxed">{plan.why}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           FUNDRAISING
      ═══════════════════════════════════════════════════════════════ */}
      <section id="fundraising" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <SectionLabel num="04" text="Fundraising" />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.01em' }} className="text-2xl sm:text-3xl mb-3">
          Использование средств
        </h2>
        <p style={{ color: B.slateLight, maxWidth: 520 }} className="text-sm sm:text-base mb-8 leading-relaxed">
          Цель raise: <strong style={{ color: B.white }}>$300 000 – $500 000</strong> (IDO + стратегические раунды).
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: B.white }} className="text-sm mb-5">Аллокация средств</div>
            <div className="space-y-3">
              {[
                { label: 'App Development (M2E + AI)', pct: 35, color: B.gold },
                { label: 'Marketing & Community', pct: 25, color: B.violet },
                { label: 'Security & Audits', pct: 15, color: B.success },
                { label: 'DEX Liquidity', pct: 10, color: B.info },
                { label: 'Ecosystem Growth', pct: 10, color: B.gold },
                { label: 'Ops & Legal', pct: 5, color: B.slateLight },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: B.slateLight }}>{item.label}</span>
                    <span style={{ color: item.color, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{item.pct}%</span>
                  </div>
                  <div style={{ height: 4, background: B.midnight, borderRadius: 100 }}>
                    <div style={{ width: `${item.pct}%`, height: '100%', borderRadius: 100, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card gold>
            <div style={{ color: B.gold, fontFamily: 'Syne, sans-serif', fontWeight: 700 }} className="text-sm uppercase tracking-[0.08em] mb-5">Почему эта структура работает</div>
            <ul className="space-y-3 text-sm" style={{ color: '#f9fafb' }}>
              <li className="flex gap-2"><span style={{ color: B.gold }}>→</span> 35% на разработку = реальный продукт до расходования маркетинга</li>
              <li className="flex gap-2"><span style={{ color: B.gold }}>→</span> 15% на аудит = доверие CEX и институциональных инвесторов</li>
              <li className="flex gap-2"><span style={{ color: B.gold }}>→</span> 10% в ликвидность при листинге = стабильная цена сразу</li>
              <li className="flex gap-2"><span style={{ color: B.gold }}>→</span> Прозрачность через Safe multisig treasury</li>
              <li className="flex gap-2"><span style={{ color: B.gold }}>→</span> Vesting на все аллокации команды</li>
            </ul>

            <div style={{ marginTop: 20, borderTop: '1px solid rgba(250,204,21,0.2)', paddingTop: 16 }}>
              <div style={{ color: B.slateMid }} className="text-xs mb-1">Treasury Safe (multisig)</div>
              <div style={{ fontFamily: 'Courier New, monospace', color: B.violet, fontSize: 11 }}>{CONTRACTS.treasury}</div>
            </div>
          </Card>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           INVESTMENT TIERS
      ═══════════════════════════════════════════════════════════════ */}
      <section id="tiers" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <SectionLabel num="05" text="Инвестиции" />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.01em' }} className="text-2xl sm:text-3xl mb-3">
          Тиры участия
        </h2>
        <p style={{ color: B.slateLight, maxWidth: 520 }} className="text-sm sm:text-base mb-8 leading-relaxed">
          Условия переговорные. Напишите нам — обсудим структуру под ваш профиль.
        </p>

        <div className="grid gap-5 md:grid-cols-3">
          {INVESTMENT_TIERS.map((t) => (
            <div key={t.tier} style={{ background: B.obsidian, border: `1px solid ${t.border}`, borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column' }}>
              <div className="mb-4">
                <span style={{ background: t.color === B.gold ? B.goldGlow : t.color === B.violet ? B.violetGlow : 'rgba(148,163,184,0.1)', color: t.color, border: `1px solid ${t.border}` }} className="text-[10px] font-bold uppercase tracking-[0.1em] rounded-full px-3 py-1">
                  {t.tier}
                </span>
              </div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: t.color, fontSize: 20, lineHeight: 1, marginBottom: 6 }}>{t.range}</div>
              <p style={{ color: B.slateLight }} className="text-xs mb-5 leading-relaxed">{t.description}</p>
              <ul className="space-y-2 flex-1">
                {t.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs" style={{ color: B.slateLight }}>
                    <span style={{ color: t.color, marginTop: 1, flexShrink: 0 }}>✓</span>
                    {b}
                  </li>
                ))}
              </ul>
              <a href={`mailto:${CONTACT_EMAIL}?subject=GAD%20Corp%20${t.tier}%20Investor%20Inquiry`}
                style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: t.color === B.gold ? B.gold : t.color === B.violet ? B.violet : 'rgba(148,163,184,0.15)', color: t.color === B.gold || t.color === B.violet ? B.black : B.white, fontFamily: 'Syne, sans-serif', fontWeight: 700, borderRadius: 10, padding: '10px 16px', fontSize: 13, textDecoration: 'none' }}
                className="hover:opacity-90 transition-opacity">
                Связаться →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           ROADMAP
      ═══════════════════════════════════════════════════════════════ */}
      <section id="roadmap" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <SectionLabel num="06" text="Роадмап" />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.01em' }} className="text-2xl sm:text-3xl mb-8">
          Milestones 2026–2027
        </h2>

        {/* Phase tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {ROADMAP.map((phase) => (
            <button key={phase.id} onClick={() => setActivePhase(phase.id)}
              style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, background: activePhase === phase.id ? B.gold : B.obsidian, color: activePhase === phase.id ? B.black : B.slateLight, border: `1px solid ${activePhase === phase.id ? B.gold : 'rgba(148,163,184,0.15)'}`, borderRadius: 100, padding: '6px 16px', fontSize: 12, cursor: 'pointer', transition: 'all 0.15s' }}>
              {phase.label.split('—')[0].trim()}
              {phase.status === 'now' && (
                <span style={{ marginLeft: 6, background: B.success, color: B.black, borderRadius: 100, padding: '1px 6px', fontSize: 9, fontWeight: 700 }}>NOW</span>
              )}
            </button>
          ))}
        </div>

        {ROADMAP.filter(p => p.id === activePhase).map((phase) => (
          <div key={phase.id} style={{ background: B.obsidian, border: `1px solid rgba(148,163,184,0.1)` }} className="rounded-2xl p-6">
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, color: B.white }} className="text-lg mb-1">{phase.label}</div>
            <div style={{ color: B.slateMid }} className="text-xs mb-5">Статус: <span style={{ color: phase.status === 'now' ? B.success : B.slateLight, fontWeight: 600 }}>{phase.status === 'done' ? 'Завершено ✓' : phase.status === 'now' ? 'Текущий спринт' : 'Запланировано'}</span></div>
            <ul className="grid sm:grid-cols-2 gap-3">
              {phase.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm" style={{ color: B.slateLight }}>
                  <span style={{ color: phase.status === 'done' ? B.success : phase.status === 'now' ? B.gold : B.slateMid, flexShrink: 0, marginTop: 1 }}>
                    {phase.status === 'done' ? '✓' : phase.status === 'now' ? '→' : '○'}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           TRANSPARENCY / PROOF
      ═══════════════════════════════════════════════════════════════ */}
      <section id="transparency" className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <SectionLabel num="07" text="Прозрачность" />
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.01em' }} className="text-2xl sm:text-3xl mb-3">
          Proof & Contracts
        </h2>
        <p style={{ color: B.slateLight, maxWidth: 520 }} className="text-sm sm:text-base mb-8 leading-relaxed">
          Все критические компоненты задеплоены на-чейн. Никаких скрытых привилегий владельца. Treasury через multisig.
        </p>

        <div className="grid gap-5 md:grid-cols-2">
          <Card>
            <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: B.white }} className="text-sm mb-1">Контракты на BSC Mainnet</div>
            <p style={{ color: B.slateMid }} className="text-xs mb-5">Публично верифицируемы. Неизменяемы. On-chain enforced.</p>
            <ContractRow label="GAD Token" addr={CONTRACTS.token} href={`https://bscscan.com/token/${CONTRACTS.token}`} />
            <ContractRow label="Launchpad V3" addr={CONTRACTS.launchpad} href={`https://bscscan.com/address/${CONTRACTS.launchpad}`} />
            <ContractRow label="Vesting Vault" addr={CONTRACTS.vesting} href={`https://bscscan.com/address/${CONTRACTS.vesting}`} />
            <ContractRow label="LP Locker" addr={CONTRACTS.lpLocker} href={`https://bscscan.com/address/${CONTRACTS.lpLocker}`} />
            <ContractRow label="Treasury Safe" addr={CONTRACTS.treasury} href={`https://app.safe.global/home?safe=bnb:${CONTRACTS.treasury}`} />
          </Card>

          <div className="space-y-4">
            <Card>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, color: B.white }} className="text-sm mb-4">Trust signals</div>
              <ul className="space-y-3">
                {[
                  { icon: '🔒', label: 'LP Locked', desc: 'Ликвидность залочена через LP Locker контракт' },
                  { icon: '🏛️', label: 'Treasury Multisig', desc: 'Safe — требует мульти-подпись для любых транзакций' },
                  { icon: '⏰', label: 'Vesting', desc: 'Команда и инвесторы: cliff + schedule, контракт enforced' },
                  { icon: '🔥', label: 'Burn Mechanism', desc: '10% от каждого ecosystem unlock идёт на сжигание' },
                ].map((t) => (
                  <li key={t.label} className="flex items-start gap-3">
                    <span style={{ fontSize: 16 }}>{t.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: B.white }} className="text-sm">{t.label}</div>
                      <div style={{ color: B.slateMid }} className="text-xs">{t.desc}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>

            <Card violet>
              <div style={{ color: B.violet, fontFamily: 'Syne, sans-serif', fontWeight: 700 }} className="text-sm uppercase tracking-[0.08em] mb-3">Аудит — в процессе</div>
              <p style={{ color: B.slateLight }} className="text-xs leading-relaxed mb-4">
                Переговоры с CertiK и Hacken. Аудит запланирован на Q2 2026. PDF будет опубликован на сайте немедленно после завершения.
              </p>
              <div style={{ color: B.slateMid }} className="text-xs">
                До аудита: исходный код смарт-контрактов доступен для ревью команде инвесторов по запросу.
              </div>
            </Card>
          </div>
        </div>

        {/* External links */}
        <div style={{ background: B.midnight, border: '1px solid rgba(148,163,184,0.08)' }} className="mt-5 rounded-2xl p-5">
          <div style={{ color: B.slateMid }} className="text-[10px] uppercase tracking-[0.08em] mb-4">Внешние ссылки</div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Website', href: 'https://gad-family.com/' },
              { label: 'Twitter/X', href: 'https://x.com/FamilyGad' },
              { label: 'Discord', href: 'https://discord.gg/p6r4YFa9Pn' },
              { label: 'PancakeSwap', href: `https://pancakeswap.finance/swap?outputCurrency=${CONTRACTS.token}` },
              { label: 'Whitepaper PDF', href: '/whitepaper.pdf' },
              { label: 'Pitch Deck', href: '/pitch' },
            ].map((link) => (
              <a key={link.label} href={link.href} target={link.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer noopener"
                style={{ color: B.slateLight, border: '1px solid rgba(148,163,184,0.15)', borderRadius: 100, padding: '5px 12px', fontSize: 12, textDecoration: 'none' }}
                className="hover:opacity-80 transition-opacity">
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
           CONTACT
      ═══════════════════════════════════════════════════════════════ */}
      <section id="contact" className="mx-auto max-w-6xl px-4 sm:px-6 py-12 pb-20">
        <SectionLabel num="08" text="Контакт" />

        <div style={{ background: 'linear-gradient(135deg, rgba(250,204,21,0.06) 0%, rgba(167,139,250,0.06) 100%)', border: `1px solid ${B.goldBorder}` }} className="rounded-3xl p-8 sm:p-12 text-center">
          {/* Orbit icon */}
          <div className="flex justify-center mb-6">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="30" stroke="#facc15" strokeWidth="1.2" strokeOpacity=".4" />
              <circle cx="32" cy="32" r="22" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity=".5" />
              <circle cx="32" cy="32" r="14" stroke="#facc15" strokeWidth="1.5" strokeOpacity=".7" />
              <circle cx="32" cy="32" r="9" fill="rgba(250,204,21,0.15)" />
              <circle cx="32" cy="32" r="6" fill="#facc15" />
              <circle cx="32" cy="10" r="2" fill="#facc15" fillOpacity=".7" />
              <circle cx="54" cy="32" r="1.5" fill="#a78bfa" fillOpacity=".8" />
              <circle cx="32" cy="54" r="1.5" fill="#facc15" fillOpacity=".5" />
            </svg>
          </div>

          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, letterSpacing: '-0.02em' }} className="text-2xl sm:text-4xl mb-3">
            Готовы поговорить?
          </h2>
          <p style={{ color: B.slateLight, maxWidth: 440, margin: '0 auto 32px' }} className="text-sm sm:text-base leading-relaxed">
            Если вы фонд, launchpad или стратегический партнёр — напишите нам. Все материалы доступны по запросу.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <a href={`mailto:${CONTACT_EMAIL}?subject=GAD%20Corp%20Investor%20Inquiry&body=Hello%20GAD%20Corp%20team%2C%0A%0AI%27m%20interested%20in%20learning%20more%20about%20investing%20in%20the%20project.%0A%0APlease%20share%3A%0A-%20Latest%20pitch%20deck%0A-%20Tokenomics%20details%0A-%20Current%20fundraising%20terms%0A%0ABest%20regards%2C%0A%5BYour%20Name%5D`}
              style={{ background: B.gold, color: B.black, fontFamily: 'Syne, sans-serif', fontWeight: 700, borderRadius: 12, padding: '12px 28px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}
              className="hover:opacity-90 transition-opacity">
              Написать инвестору →
            </a>
            <Link href="/pitch"
              style={{ border: `1px solid ${B.goldBorder}`, color: B.gold, background: B.goldGlow, borderRadius: 12, padding: '12px 24px', fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'Syne, sans-serif', fontWeight: 600 }}
              className="hover:opacity-80 transition-opacity">
              Pitch Deck ↗
            </Link>
          </div>

          <div style={{ color: B.slateMid }} className="text-xs">
            <span style={{ color: B.gold }}>{CONTACT_EMAIL}</span>
            {'  ·  '}
            <a href="https://x.com/FamilyGad" target="_blank" rel="noreferrer noopener" style={{ color: B.slateMid, textDecoration: 'none' }} className="hover:text-white transition-colors">Twitter @FamilyGad</a>
            {'  ·  '}
            <a href="https://discord.gg/p6r4YFa9Pn" target="_blank" rel="noreferrer noopener" style={{ color: B.slateMid, textDecoration: 'none' }} className="hover:text-white transition-colors">Discord</a>
          </div>

          <p style={{ color: B.slateMid, marginTop: 16 }} className="text-[11px]">
            Прозрачность — это дефолт, а не маркетинговый приём.
          </p>
        </div>
      </section>

    </main>
  );
}
