# GAD Family Web — CLAUDE.md
> Полный анализ проекта, план развития, стратегия токена GAD
> Дата: 14.06.2026 | Последнее обновление: 14.06.2026 | Автор: Claude Sonnet 4.6

---

## 1. ЧТО ТАКОЕ ЭТОТ ПРОЕКТ

**GAD-Family-Web** — главный сайт/dApp экосистемы GAD Family на BNB Smart Chain.
Построен на **Next.js 15 App Router**, задеплоен на **Vercel**, пакетный менеджер — **pnpm**.

**Связанные проекты (одна экосистема):**
```
c:\Users\gafit\GAD-Family-App     — мобильное приложение (Expo + Firebase)
c:\Users\gafit\GAD-Family-Web     — этот проект (сайт + dApp)
c:\Users\gafit\GAD-AI-Terminal    — AI-терминал
c:\Users\gafit\GAD-Decision-OS    — система принятия решений
c:\Users\gafit\GAD-Skills         — скиллы для Claude Code
```

---

## 2. ТЕХНИЧЕСКИЙ СТЕК

| Слой | Технология |
|---|---|
| Framework | Next.js 15 (App Router) |
| Язык | TypeScript (strict: false) |
| Стили | Tailwind CSS v4 + PostCSS |
| Web3 | Wagmi v2, Viem v2, Ethers.js v6 |
| Wallet UI | RainbowKit, Web3Modal / Reown AppKit |
| Иконки | Lucide React |
| Чарты | Recharts |
| AI | OpenAI DALL-E (NFT генерация) |
| IPFS | Pinata |
| Analytics | Vercel Analytics |
| Smart contracts | Hardhat v3, OpenZeppelin |
| State | Zustand |
| Storage | IndexedDB (web), Expo SecureStore (mobile) |
| Deploy | Vercel, pnpm workspaces |
| Telegram Bot | Telegraf v4 (webhook + polling) |
| Fonts | Syne (display/headings), Inter (body) — Google Fonts |

---

## 3. СТРУКТУРА ПРОЕКТА

```
GAD-Family-Web/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Главная страница — REWRITTEN (GAD Corp brand, orbital, M2E, live)
│   ├── layout.tsx          # Root layout (NavBar + Syne font + Analytics)
│   ├── globals.css         # REWRITTEN — CSS animation library (orbital, pulse, fade-up, ticker)
│   ├── components/         # Shared компоненты
│   │   ├── NavBar.tsx
│   │   ├── FarmingDashboard.tsx
│   │   ├── GADStaking.tsx
│   │   ├── GADLocker.tsx
│   │   ├── ZapBox.tsx
│   │   ├── Chart.tsx
│   │   └── WalletConnectButton.tsx
│   ├── nft/                # NFT Marketplace + AI Mint
│   ├── earn/               # Farming & Staking
│   ├── stake/              # Single staking
│   ├── launchpad/          # Token Launchpad
│   ├── dao/                # DAO Governance
│   ├── wallet/             # Web3 Wallet
│   ├── airdrop/            # Airdrop info
│   ├── claim-airdrop/      # Airdrop claim
│   ├── investors/          # Investor hub — REWRITTEN (GAD Corp brand, 8-step liquidity plan)
│   ├── pitch/              # Pitch deck
│   ├── proof/              # Contract transparency
│   └── api/                # Next.js API routes
│       ├── token-price/    # DexScreener live price (revalidate 60s)
│       ├── telegram/
│       │   ├── webhook/    # Telegraf webhook endpoint (POST + GET set)
│       │   └── cron/       # Daily stats post to Telegram channel (09:00 UTC)
│       ├── circulating-supply/
│       ├── staking-stats/
│       └── ...
├── lib/
│   └── bot.ts              # Telegram bot: commands, fetchGADPrice(), createBot()
├── scripts/
│   ├── bot-polling.ts      # Local dev: запуск бота в polling режиме
│   └── ...                 # Airdrop generation
├── src/
│   └── wallet/             # Wallet abstraction layer
│       ├── core/           # Services, state (Zustand), utils
│       └── adapters/       # Web (IndexedDB) / Mobile (Expo)
├── contracts/nft/          # Hardhat smart contracts
├── abis/                   # Contract ABIs (JSON + TS)
├── public/                 # Static assets
├── scripts/                # Airdrop generation
└── tools/                  # Diagnostic tools
```

---

## 4. КОНТРАКТЫ BSC MAINNET (Chain ID: 56)

```
GAD Token:         0x858bab88A5b8d7f29a40380c5F2D8d0b8812FE62
Launchpad V3:      0x528e90A8304dCd05B351F1291eA34d7d74E4A08d
USDT BEP-20:       0x55d398326f99059fF775485246999027B3197955
LP Token Locker:   0xF40B3dE6822837E0c4d937eF20D67B944aE39163
Vesting Vault:     0x9653Cb1fc5daD8A384c2dAD18A4223b77eCF4A15
Treasury Safe:     0xe08F53ac892E89b6Ba431b90A96C640A39386736
Marketplace NFT:   0x8117b368f5C620BE0D7173F12a0Fa25729A5fEEd
NFT721:            0xa1a72398bCded7D40f26c2679dC35E5A73dA3948
Vault:             0x86500D900db7424E9D93DEd334C3165A82C10783
GAD Locker (xGAD): 0x2479158bFA2a0F164E7a1B9b7CaF8d3Ea2307ea1
Governor (DAO):    0x6b07d69A2bE398e353f1877b81E116603837D556
PancakeSwap v2:    0x10ED43C718714eb63d5aA57B78B54704E256024E
```

**Токеномика:**
- Total supply: **10,000,000,000,000 GAD** (10 триллионов)
- 30% — Launchpad (public sale)
- 50% — Long-term Lock (App & Ecosystem, 36 мес, разлок каждые 6 мес)
- 10% — Early Investors (vesting)
- 10% — Founder & Core Dev

---

## 5. API ROUTES

| Route | Метод | Назначение |
|---|---|---|
| `/nft/api/ai` | POST | OpenAI DALL-E генерация изображений |
| `/api/dao/stats` | GET | Статистика DAO |
| `/api/airdrop-proof` | GET | Merkle proof для airdrop |
| `/api/circulating-supply` | GET | Текущий circulating supply |
| `/api/staking-stats` | GET | Статистика стейкинга |
| `/api/total-supply` | GET | Общий supply |
| `/api/tokenlist` | GET | Список токенов для кошелька |
| `/api/farming-config` | GET | Конфигурация пулов фарминга |
| `/api/token-price` | GET | **NEW** Live цена GAD с DexScreener (revalidate 60s) |
| `/api/telegram/webhook` | POST/GET | **NEW** Telegraf webhook (POST=updates, GET?set=1=setup) |
| `/api/telegram/cron` | GET | **NEW** Daily Telegram post (Vercel Cron 09:00 UTC) |

---

## 6. КОМАНДЫ

```bash
# Dev server (port 3000)
pnpm dev

# Build
pnpm build

# Start prod
pnpm start

# Airdrop generation
pnpm airdrop

# Lint
pnpm lint
```

**Требования:** Node.js >=18.18 <21, pnpm 10.19.0

---

## 7. ТЕМА И ЦВЕТА

```
Background:  #050711 / #0b0f17  (очень тёмный сине-чёрный)
Primary:     #ffd166             (золото — кнопки, акценты)
Success:     emerald-500         (статус Live)
Warning:     yellow-500          (статус In Progress)
Info:        sky-500             (статус R&D)
Danger:      #ff4b4b             (Launchpad highlight)
Text:        white / white/70 / white/45
```

---

## 8. GAD FAMILY APP — АНАЛИЗ (c:\Users\gafit\GAD-Family-App)

Мобильное приложение (Expo 53 + Firebase) с готовым CLAUDE.md внутри.

**Стек:** Expo SDK ~53, React Native 0.81.5, React 19, Firebase Cloud Functions v2, Firestore, BSC (ethers.js v6).

**Что реализовано (на 09.06.2026):**
- ✅ Move-to-Earn: Step Engine V2 (cron + fraud detection)
- ✅ Семейная система: vault, goals, geo safe-zones
- ✅ Wallet: BSC баланс, BscScan activity/NFT
- ✅ Anti-fraud engine (velocity check, cap 50k шагов, spike detection)
- ✅ Payouts: создание/отмена запросов на вывод GAD
- ✅ Push уведомления (FCM)
- ✅ AI Assistant (базовый)

**Критические уязвимости (ещё не исправлены):**
1. `StepsScreen.tsx` — прямой `setDoc` в Firestore (`dailySteps`) без Cloud Function → чит на шаги
2. `families/{fid}` Firestore rule — любой авторизованный видит все семьи
3. `applyGasStipend` — uid из `req.data` вместо `req.auth.uid`
4. `StepsScreen` Chain ID = 97 (тестнет), RPC = BscScan explorer (не RPC endpoint)

**Production Readiness: ~72%**

**Связь с GAD-Family-Web:**
- Оба используют одинаковые адреса контрактов
- Мобильное приложение зарабатывает GAD Points → конвертируются в GAD → используются в Web dApp
- Общий токен GAD как расчётный актив

---

## 9. АНАЛИЗ GAD ТОКЕНА НА BSC

### Текущее состояние

**Проблемы с ликвидностью:**
- Ликвидность на PancakeSwap v2 (GAD/USDT) — минимальная (не публично раскрыта)
- Без ликвидности → нет цены → нет интереса инвесторов
- LP tokens залочены через `0xF40B3dE6822837E0c4d937eF20D67B944aE39163` (хорошо)
- Launchpad V3 активен, но объём продаж неизвестен

**Сильные стороны токена:**
- Реальная утилита (Move-to-Earn, стейкинг, NFT, DAO, кошелёк)
- Фиксированный supply (не inflationary по умолчанию)
- Прозрачность: Treasury через Safe multisig
- Vesting Vault с расписанием unlock
- LP locker для защиты ликвидности

**Слабые стороны:**
- Нет листинга на CEX (только PancakeSwap)
- Нет Market Making
- Нет аудита смарт-контрактов (упомянуто "Audit in progress")
- Малая community (Twitter + Discord)
- Отсутствие трекеров (CoinMarketCap, CoinGecko — не подтверждено)

---

## 10. СТРАТЕГИЯ ЛИКВИДНОСТИ И ИНВЕСТИЦИЙ

### 10.1 Ликвидность (приоритет #1)

**Немедленные действия:**

1. **Seed Liquidity на PancakeSwap v2** (GAD/USDT и GAD/BNB)
   - Минимум $5,000–10,000 для нормального slippage
   - LP tokens немедленно залочить через LP Locker контракт
   - Публично показать размер ликвидности на сайте (live on-chain данные)

2. **Launchpad → Liquidity Pipeline**
   - % от каждой продажи на Launchpad автоматически → PancakeSwap LP
   - Это уже в архитектуре (`LiquidityVault.sol`) — убедиться что работает
   - Показать на сайте: "X% от продаж → в ликвидность"

3. **Farming программа GAD/USDT**
   - Награды для LP провайдеров в GAD
   - APR должен быть привлекательным (>30% на старте)
   - `FarmingDashboard.tsx` уже есть — подключить реальный контракт

4. **Market Making партнёрство**
   - Bitget Wallet MM, Gotbit, Skynet — контакты для BSC MM
   - Начать переговоры параллельно с IDO

### 10.2 IDO / Листинг стратегия

**Рекомендуемая последовательность:**

```
Шаг 1: Собственный Launchpad V3 (текущий) → закрыть первый раунд
Шаг 2: Листинг на PancakeSwap + достаточная ликвидность
Шаг 3: Подача на CoinGecko + CoinMarketCap (нужна активность 30+ дней)
Шаг 4: Партнёрство с Launchpad площадками (PinkSale, Unicrypt, DxSale)
Шаг 5: CEX листинг (Gate.io, MEXC, BitMart — подходят для BSC проектов)
```

**Для листинга на CEX нужно:**
- Аудит смарт-контракта (CertiK / Hacken / PeckShield — $5-15k)
- Whitepaper актуальный (PDF уже есть)
- Active Twitter (1k+ followers)
- Discord community (500+ members)
- Market cap обоснование
- Pitch deck (уже есть: `/pitch`)

### 10.3 Инвестиционная привлекательность

**Что улучшить для инвесторов:**

1. **Live метрики на сайте** (сейчас статичные данные):
   - Текущая цена GAD (real-time с PancakeSwap)
   - TVL (Total Value Locked) в фарминге
   - Количество holders (BscScan API)
   - Volume 24h
   - Circulating supply vs locked

2. **Доказательство продукта:**
   - Demo видео GAD Family App (iOS/Android скриншоты)
   - Количество установок / активных пользователей
   - Step Engine статистика (шаги → GAD rewards)

3. **Roadmap с датами:**
   - Конкретные даты вместо "In Progress"
   - Публичный GitHub с прогрессом

4. **Аудит:**
   - Самый важный trust signal для серьёзных инвесторов
   - Начать как можно раньше

---

## 11. ПЛАН УЛУЧШЕНИЯ САЙТА — ОТ СТАТИЧНОГО К ЖИВОМУ

### 11.1 Текущие проблемы главной страницы

Сайт **(`app/page.tsx`, 1463 строки)** — хорошая структура, но:
- Все данные **статичные** (hardcoded цифры)
- Нет **живых данных** с блокчейна
- Нет **анимаций** (только CSS transition на hover)
- Hero секция интерактивна (hover nodes), но нет реального взаимодействия
- Нет **счётчиков** (holders, volume, TVL)
- Нет **движения** — страница мёртвая визуально

### 11.2 Приоритетные улучшения

**Уровень 1 — Данные (высокий impact, 1 неделя):**

- [ ] Живая цена GAD (PancakeSwap API / GeckoTerminal API)
- [ ] Live holders count (BscScan API: `api.bscscan.com/api?module=token&action=tokeninfo`)
- [ ] Market cap (цена × circulating supply)
- [ ] Анимация счётчиков при загрузке (число "считается" с нуля)
- [ ] Volume 24h с PancakeSwap

**Уровень 2 — Интерактивность (1-2 недели):**

- [ ] **Hero: живая карта экосистемы** — орбитальная анимация модулей вокруг GAD центра (CSS keyframes / Framer Motion)
- [ ] **Ecosystem cards** — hover открывает popup с live данными (TVL, users)
- [ ] **Token Distribution** — интерактивная pie chart (Recharts уже есть)
- [ ] **Roadmap** — timeline с прогресс-барами
- [ ] **"Buy GAD" калькулятор** — введи USDT → получи GAD (real-time курс)

**Уровень 3 — Движение и жизнь (2-4 недели):**

- [ ] **Particle background** — лёгкие частицы/звёзды (tsParticles / vanilla canvas)
- [ ] **Scroll animations** — секции появляются при скролле (Intersection Observer)
- [ ] **Live ticker** — лента последних транзакций GAD (BscScan WebSocket или polling)
- [ ] **Animated number counters** для TVL, holders, volume
- [ ] **Move-to-Earn демо** — интерактивная схема как шаги → GAD
- [ ] **3D Ecosystem sphere** (Three.js) — опционально, только если не вредит перформансу

**Уровень 4 — Полное переписывание Hero (месяц):**

```
[НОВЫЙ HERO КОНЦЕПТ]

Левая половина:
- Большой заголовок с gradient animate
- Счётчики: "12,483 holders" "₀.₀₀₀₁₂ GAD price" "↑ 3.2% 24h"
- CTA кнопки с pulse анимацией

Правая половина:
- Анимированная орбитальная схема:
  GAD в центре (пульсирующий)
  Вокруг орбиты: Wallet, App, NFT, Launchpad, DAO, Staking
  Линии связи мигают при hover
  Click на модуль → разворачивает карточку с деталями
```

### 11.3 Move-to-Earn секция

Добавить отдельную **"Move to Earn"** секцию на главную:

```
[КОНЦЕПТ СЕКЦИИ]

Заголовок: "Walk. Earn. Live."

Левая колонка — Как это работает:
  📱 Установи GAD Family App
     ↓
  👟 Ходи 10,000 шагов в день
     ↓
  🪙 Получай GAD Points автоматически
     ↓
  💰 Выводи в GAD токены
     ↓
  📈 Стейкай, трать, голосуй в DAO

Правая колонка — живые цифры:
  "Сегодня: 2,847,291 шагов сделано семьями"
  "GAD Points начислено: 284,729"
  "Активных семей: 1,247"
  
  [Интерактивный калькулятор]
  Я хожу ___ шагов в день
  → Заработаю ~___ GAD Points/день
  → ~___ GAD/месяц
  → ~___ USD/месяц
```

### 11.4 Новые страницы к добавлению

- [ ] `/move-to-earn` — полная страница о M2E механике
- [ ] `/token` — детальная страница токена (live charts, distribution, vesting schedule)
- [ ] `/ecosystem` — интерактивная карта всей экосистемы
- [ ] `/terms` — Terms of Service (ссылка в footer, страницы нет)
- [ ] `/privacy` — Privacy Policy (ссылка в footer, страницы нет)

---

## 12. ПЛАН РАБОТ — С ЧЕГО НАЧАТЬ

### Sprint 1 — Данные и жизнь (1-2 недели)

**Задачи в порядке приоритета:**

1. **Live данные с PancakeSwap + BscScan**
   - Создать `/api/token-price` → fetch с GeckoTerminal или DexScreener API
   - Создать `/api/holders-count` → BscScan API
   - Добавить `TokenStats` компонент на Hero (price, holders, mcap, volume)

2. **Animated counters**
   - Установить `react-countup` или написать custom hook
   - Применить к holders, TVL, volume

3. **Интерактивный калькулятор M2E**
   - Новый компонент `StepsCalculator.tsx`
   - Input шагов → output GAD/месяц (на основе tokenomics формулы из mobile app)

4. **Token Distribution — живая pie chart**
   - Recharts `PieChart` с анимацией
   - Кликабельные сегменты

### Sprint 2 — Анимации и движение (2-4 недели)

1. **Framer Motion** — установить, добавить scroll animations
2. **Hero орбитальная схема** — CSS animation / Framer Motion
3. **Particle background** — лёгкий, не нагружающий
4. **Live transaction ticker** — лента последних переводов GAD
5. **Move-to-Earn секция** с калькулятором

### Sprint 3 — Переписывание и новые страницы (месяц)

1. **Полный редизайн Hero** — новая концепция с орбитами и live данными
2. Страница `/move-to-earn`
3. Страница `/token` с live charts
4. Улучшенная страница `/investors` с pitch materials
5. `/terms` и `/privacy`

---

## 13. MOVE-TO-EARN — ОПИСАНИЕ ПРОЕКТА

### Концепция

GAD Family App реализует **Move-to-Earn (M2E)** механику:

```
Пользователь ходит / бегает
         ↓
Шаги считаются через HealthKit (iOS) / Health Connect (Android)
         ↓
Firebase Cloud Function (Step Engine V2) валидирует:
  - источник данных (не ручной ввод)
  - anti-fraud (velocity cap 50k шагов/день)
  - аномалии (spike detection)
         ↓
Начисляются GAD Points в Firestore (только backend)
         ↓
Пользователь создаёт Payout Request
         ↓
weeklyPayout cron → реальный перевод GAD на BSC кошелёк
         ↓
Токены доступны в GAD Wallet (стейкинг, NFT, DAO)
```

### Токеномика M2E (из `tokenomicsShared.ts`)

- Пул наград: 50% supply = **5,000,000,000,000 GAD** (5 триллионов)
- Разлок каждые 6 месяцев
- 10% каждого транша → сжигается
- Дневная ставка зависит от дня недели (выходные ×1.1)
- Тарифы: free (10k шагов/день, ×1.0), plus (15k, ×1.5), pro (20k, ×2.0)

### Семейная механика

- Семьи: родители + дети, роли (owner/parent/child)
- Family Vault — общая казна семьи
- Family Goals — общие цели с прогресс-трекером
- Safe Zones — геозоны безопасности для детей
- SOS — кнопка экстренного вызова

### Gamification элементы

- Стрики (consecutive active days)
- Achievement NFT Badges (on-chain)
- Family leaderboard
- Missions (ежедневные/еженедельные задачи)
- Referral система

---

## 14. ПРАВИЛА РАЗРАБОТКИ

### Общее

- Все Web3 взаимодействия идут через `wagmi` хуки или `viem` — не напрямую через `ethers.js` в UI
- Компоненты с `'use client'` директивой для Web3 hooks
- Server components для статичного контента
- Tailwind классы — не inline styles
- Темная тема — все новые компоненты в `bg-[#050711]` палитре

### Безопасность

- **Никогда** не коммитить `.env.local` (содержит приватный ключ!)
- API routes валидируют входные данные перед использованием
- Внешние ссылки: всегда `rel="noreferrer noopener"`
- Нет прямых вызовов blockchain из Server Components

### Производительность

- `next/image` для всех изображений
- Динамический импорт (`next/dynamic`) для тяжёлых Web3 компонентов
- `loading.tsx` для страниц с blockchain данными

### Стиль кода

- TypeScript везде, `any` — избегать
- Компоненты-функции, не классы
- Props типизировать через `type`, не `interface` (консистентность)
- Константы в UPPER_CASE

---

## 15. ИЗВЕСТНЫЕ ПРОБЛЕМЫ

1. **`favicon.ico` — 2.9MB** — нужно уменьшить до <100KB
2. **`logo-32.png` — 2MB** — аномально большой для 32px иконки
3. **`indexeddb-trace.txt` — 1.4MB** — debug файл, удалить или gitignore
4. **`next.config.mjs`** — `images: { unoptimized: true }` — отключает оптимизацию Next.js
5. **`tailwind.config.js`** — content только `./app/**` — не покрывает `./src/**`
6. **GitHub ссылка** в Footer — `href="#"` (TODO заменить)
7. **`/terms` и `/privacy`** — ссылки есть в footer, страниц нет → 404
8. **`strict: false`** в tsconfig — много потенциальных type ошибок

---

## 16. ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ

```bash
# Blockchain
NEXT_PUBLIC_CHAIN_ID=56
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_BSC_RPC=https://bsc-dataseed.binance.org

# Контракты (см. секцию 4)
NEXT_PUBLIC_GAD_TOKEN=0x858bab...

# AI & Storage
OPENAI_API_KEY=sk-proj-...
PINATA_JWT=...
PINATA_GATEWAY=...

# WalletConnect
NEXT_PUBLIC_WC_PROJECT_ID=ca1cc570316d8f9d6c99f0167565d6a1

# Telegram Bot (добавлено 14.06.2026)
TELEGRAM_BOT_TOKEN=8368222851:AAG...          # @GADFamilyM2E_bot
TELEGRAM_CHANNEL_ID=@gadfamilytg              # channel for daily posts
TELEGRAM_SETUP_SECRET=...                     # для защиты GET /api/telegram/webhook?set=1
CRON_SECRET=...                               # Authorization: Bearer для /api/telegram/cron

# App URL
NEXT_PUBLIC_APP_URL=https://gad-family.com

# ⚠️ КРИТИЧНО — никогда в git!
DEPLOYER_PRIVATE_KEY=...
```

---

## 17. ECOSYSTEM СВЯЗИ

```
GAD Family App (Mobile)
    ↓ шаги → GAD Points → Payout Request
Firebase Cloud Functions
    ↓ weeklyPayout → BSC transfer
GAD Token (BSC)
    ↓ держи/стейкай/голосуй
GAD Family Web (dApp)
    ├── Launchpad → купить GAD
    ├── Staking / Farming → заработать yield
    ├── NFT Marketplace → купить/продать NFT
    ├── DAO → голосовать за параметры
    └── Wallet → управлять GAD

Treasury Safe (multisig)
    ← % от Launchpad продаж
    ← % от NFT fees
    → распределяется через DAO
```

---

## 18. ЧТО УЖЕ СДЕЛАНО (Sprint 1 — 14.06.2026)

### Завершено ✅

1. **GAD Corp Brandbook** — изучен, внедрён дизайн-система
   - Цвета: `#020617` (bg), `#0b1120` (cards), `#facc15` (gold), `#a78bfa` (violet)
   - Шрифты: Syne (headings/display) + Inter (body) — подключены через Google Fonts в `layout.tsx`

2. **`app/globals.css`** — полностью переписан
   - `.orbit-ring-1/2/3` + `.orbit-node-1/2/3` — орбитальные анимации
   - `.pulse-gold` / `.pulse-violet` — glow пульсация
   - `.fade-up` + `.visible` — scroll reveal
   - `.live-dot` — blink индикатор live данных
   - `.ticker-track` — горизонтальная лента
   - `.grad-text` / `.grad-text-gold` — gradient text clip
   - `.card-hover` — lift + gold border on hover
   - `.glass` — glassmorphism
   - `.bar-animate` — progress bar fill animation
   - `.shimmer`, `.float-y`, `.count-in`

3. **`app/layout.tsx`** — добавлен Syne font (Google Fonts `<link>` в `<head>`)

4. **`app/page.tsx`** — полностью переписан (~550 строк)
   - Hero: орбитальная карта экосистемы (CSS анимация), CTA кнопки, trust badges
   - StatsTicker: scrolling live лента экосистемы
   - StatCounter: animated number counters on scroll (IntersectionObserver)
   - M2E секция: flow 4 шагов + интерактивный `StepsCalculator` (slider + план)
   - Ecosystem cards: 6 модулей с `.card-hover`
   - Token Utility: distribution bars с `.bar-animate`
   - Proof секция: 6 контрактов с BscScan ссылками
   - Launchpad + Airdrop секция
   - Roadmap: Live / In Progress / Next (3 колонки)
   - Community + Investor Hub
   - Footer: GAD Corp orbit logo SVG

5. **`app/investors/page.tsx`** — полностью переписан
   - GAD Corp branding, 8-step ликвидность план, roadmap tabs (useState)
   - Investment tiers: Seed / Strategic / Lead

6. **`app/api/token-price/route.ts`** — NEW
   - DexScreener API → live цена, volume, liquidity, txns24h
   - `revalidate: 60` — кэш 1 минута

7. **`lib/bot.ts`** — NEW Telegram Bot (@GADFamilyM2E_bot)
   - Команды: /start, /price, /stats, /links, /buy, /invest
   - fetchGADPrice() — DexScreener real-time
   - createBot() — factory (singleton в webhook mode)
   - Авто-welcome новых участников в группах
   - **ЯЗЫК БОТА: АНГЛИЙСКИЙ** (целевая аудитория — English segment)

8. **`app/api/telegram/webhook/route.ts`** — NEW
   - POST: обработка Telegraf updates
   - GET?set=1: установка webhook (защищено TELEGRAM_SETUP_SECRET)

9. **`app/api/telegram/cron/route.ts`** — NEW
   - Daily пост в @gadfamilytg в 09:00 UTC
   - Authorization: Bearer CRON_SECRET

10. **`vercel.json`** — добавлен Vercel Cron: `"schedule": "0 9 * * *"`

11. **`scripts/bot-polling.ts`** — NEW
    - Локальный запуск: `npx tsx scripts/bot-polling.ts`
    - Polling режим (без webhook, для dev)

### Telegram Links
- Bot: https://t.me/GADFamilyM2E_bot
- Channel/Group: https://t.me/gadfamilytg

---

## 19. СЛЕДУЮЩИЕ ШАГИ (MASTER PLAN)

### Приоритет 1 — Deploy & Activate
1. [ ] `git push` → deploy на Vercel
2. [ ] Обновить `NEXT_PUBLIC_APP_URL=https://gad-family.com` в Vercel env
3. [ ] Добавить все TELEGRAM_* переменные в Vercel dashboard
4. [ ] Вызвать `GET /api/telegram/webhook?set=1&secret=...` для активации webhook
5. [ ] Верифицировать daily cron в Vercel dashboard (Cron Jobs)

### Приоритет 2 — Хайп и комьюнити
6. [ ] Настроить n8n на Railway — daily auto-post в X (Twitter) через Buffer API
7. [ ] Создать Galxe кампанию: подпишись → задеплои tx → получи OAT badge
8. [ ] Zealy sprint: квесты (Twitter follow, Discord join, buy GAD)
9. [ ] Страница `/quests` — витрина квестов с embed виджетами
10. [ ] Страница `/refer` — реферальная программа

### Приоритет 3 — Live Data
11. [ ] Получить BscScan API ключ → `/api/holders-count` endpoint
12. [ ] Обновить Hero StatCounters с реальными данными (holders)
13. [ ] Live transaction ticker — BscScan WebSocket или polling
14. [ ] `/api/token` страница с Recharts live chart (24h price)

### Приоритет 4 — Ликвидность и листинг
15. [ ] Seed liquidity $10k+ в GAD/USDT пул на PancakeSwap
16. [ ] Smart contract audit (CertiK / Hacken — начать переговоры)
17. [ ] CoinGecko + CoinMarketCap заявки (нужен 30+ дней торгов)
18. [ ] DexScreener Boost ($200-500)
19. [ ] CEX листинг переговоры (Gate.io, MEXC, BitMart)

### Приоритет 5 — Новые страницы
20. [ ] `/move-to-earn` — полная M2E страница
21. [ ] `/token` — live charts, vesting schedule, burn history
22. [ ] `/quests` — Galxe + Zealy embed
23. [ ] `/terms` + `/privacy` — исправить 404
24. [ ] Уменьшить favicon.ico (сейчас 2.9MB → нужно <100KB)

---

## 20. КОНТЕНТ СТРАТЕГИЯ (Social Media)

### Язык
**АНГЛИЙСКИЙ** — весь контент бота, социальные сети, квесты, UI — на английском. Русский только для внутренней документации (CLAUDE.md).

### Автоматизация (Content Factory)
```
n8n (Railway) → GPT-4o генерирует пост
             → Canva API рендерит картинку
             → Buffer API → X (Twitter) + Telegram + Instagram
Vercel Cron  → /api/telegram/cron → daily post в @gadfamilytg
BSC webhook  → price trigger → авто-твит при +10% volume
```

### Контент-матрица
| Тип | Частота | Канал |
|-----|---------|-------|
| On-chain fact (price, holders) | 2×/день | Telegram + X |
| M2E motivation ("10k steps = X GAD") | 1×/день | X + Instagram |
| Education (what is LP lock, xGAD) | 3×/неделю | X threads |
| Behind the scenes (code, Figma) | 2×/неделю | X + TikTok |
| AI-generated video | 2×/неделю | TikTok + Reels |
| Community win | 1×/неделю | Telegram + X |

### Хайп инструменты
- **Galxe** — galxe.com → создать кампанию GAD OAT
- **Zealy** — zealy.io/c/gad → спринт с квестами
- **DexScreener Boost** — $200-500 за трендовое место
- **Telegram Bot** — @GADFamilyM2E_bot (LIVE, polling mode)
