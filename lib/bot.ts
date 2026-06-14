import { Telegraf } from 'telegraf';

// ─── Constants ────────────────────────────────────────────────────────────
const GAD_TOKEN   = '0x858bab88A5b8d7f29a40380c5F2D8d0b8812FE62';
const LAUNCHPAD   = 'https://gad-family.com/launchpad';
const DEXSCREENER = `https://dexscreener.com/bsc/${GAD_TOKEN}`;
const BSCSCAN     = `https://bscscan.com/token/${GAD_TOKEN}`;
const PANCAKE     = `https://pancakeswap.finance/swap?outputCurrency=${GAD_TOKEN}`;
const PITCH       = 'https://gad-family.com/pitch';
const INVESTORS   = 'https://gad-family.com/investors';
const DISCORD     = 'https://discord.gg/p6r4YFa9Pn';
const TWITTER     = 'https://x.com/FamilyGad';

// ─── Price fetch (DexScreener) ────────────────────────────────────────────
export async function fetchGADPrice(): Promise<{
  price: string; priceUsd: string; change24h: string; volume24h: string; liquidity: string;
}> {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${GAD_TOKEN}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    const pair = data?.pairs?.[0];
    if (!pair) throw new Error('no pair');
    return {
      price:     pair.priceNative ?? '—',
      priceUsd:  pair.priceUsd   ? `$${Number(pair.priceUsd).toFixed(8)}` : '—',
      change24h: pair.priceChange?.h24 != null ? `${pair.priceChange.h24 > 0 ? '+' : ''}${pair.priceChange.h24.toFixed(2)}%` : '—',
      volume24h: pair.volume?.h24 != null ? `$${Number(pair.volume.h24).toLocaleString('en')}` : '—',
      liquidity: pair.liquidity?.usd != null ? `$${Number(pair.liquidity.usd).toLocaleString('en')}` : '—',
    };
  } catch {
    return { price: '—', priceUsd: '—', change24h: '—', volume24h: '—', liquidity: '—' };
  }
}

// ─── Bot factory ──────────────────────────────────────────────────────────
export function createBot(): Telegraf {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  const bot = new Telegraf(token);

  // /start
  bot.start((ctx) => {
    const name = ctx.from?.first_name ?? 'Friend';
    ctx.reply(
      `👋 Hey ${name}! Welcome to *GAD Family Bot*\n\n` +
      `🪙 GAD is a family Move-to-Earn ecosystem on BNB Smart Chain.\n` +
      `Walk → Earn GAD → Stake, trade, and vote in DAO.\n\n` +
      `*Commands:*\n` +
      `/price — live GAD price\n` +
      `/stats — ecosystem stats\n` +
      `/links — all important links\n` +
      `/buy — how to buy GAD\n` +
      `/invest — investor materials`,
      { parse_mode: 'Markdown' }
    );
  });

  // /price
  bot.command('price', async (ctx) => {
    const p = await fetchGADPrice();
    ctx.reply(
      `📊 *GAD Price* · PancakeSwap v2 · BSC\n\n` +
      `💰 Price: \`${p.priceUsd}\`\n` +
      `📈 24h Change: ${p.change24h}\n` +
      `📦 Volume 24h: ${p.volume24h}\n` +
      `💧 Liquidity: ${p.liquidity}\n\n` +
      `[DexScreener](${DEXSCREENER}) · [BscScan](${BSCSCAN})`,
      { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
    );
  });

  // /stats
  bot.command('stats', async (ctx) => {
    const p = await fetchGADPrice();
    ctx.reply(
      `🌐 *GAD Ecosystem Stats*\n\n` +
      `🔢 Total Supply: \`10,000,000,000,000 GAD\`\n` +
      `🔒 Ecosystem Lock: 50% · 36 months\n` +
      `🏛️ Treasury: Safe Multisig (on-chain)\n` +
      `💧 Liquidity: ${p.liquidity}\n` +
      `📈 Price: ${p.priceUsd} (${p.change24h})\n\n` +
      `🚀 IDO: Preparing · Q3 2026\n` +
      `🔐 Audit: CertiK · Q2 2026\n\n` +
      `Everything verifiable on-chain ✅`,
      { parse_mode: 'Markdown' }
    );
  });

  // /links
  bot.command('links', (ctx) => {
    ctx.reply(
      `🔗 *GAD Family Links*\n\n` +
      `🚀 [Launchpad](${LAUNCHPAD})\n` +
      `📊 [DexScreener](${DEXSCREENER})\n` +
      `🔍 [BscScan Token](${BSCSCAN})\n` +
      `💎 [Investor Hub](${INVESTORS})\n` +
      `📄 [Pitch Deck](${PITCH})\n` +
      `💬 [Discord](${DISCORD})\n` +
      `🐦 [Twitter / X](${TWITTER})`,
      { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
    );
  });

  // /buy
  bot.command('buy', async (ctx) => {
    const p = await fetchGADPrice();
    ctx.reply(
      `🛒 *How to Buy GAD?*\n\n` +
      `*Option 1 — Official Launchpad (IDO):*\n` +
      `👉 ${LAUNCHPAD}\n\n` +
      `*Option 2 — PancakeSwap v2:*\n` +
      `👉 ${PANCAKE}\n\n` +
      `💰 Current Price: ${p.priceUsd}\n` +
      `Contract: \`${GAD_TOKEN}\`\n\n` +
      `⚠️ Always verify the contract address before buying!`,
      { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
    );
  });

  // /invest
  bot.command('invest', (ctx) => {
    ctx.reply(
      `💼 *GAD Investor Materials*\n\n` +
      `📄 [Pitch Deck PDF](${PITCH})\n` +
      `🏛️ [Investor Hub](${INVESTORS})\n\n` +
      `*Investment Rounds:*\n` +
      `• Seed: $1k–$10k · +15% bonus tokens\n` +
      `• Strategic: $10k–$50k · +25% bonus\n` +
      `• Lead: $50k–$300k · +40% bonus + board seat\n\n` +
      `📩 Contact: [@gad_invest](https://t.me/gad_invest)`,
      { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
    );
  });

  // New member welcome (in groups)
  bot.on('chat_member', async (ctx) => {
    const update = ctx.update as unknown as { chat_member?: { new_chat_member?: { status: string; user?: { first_name?: string } } } };
    const member = update.chat_member?.new_chat_member;
    if (member?.status === 'member' && member.user) {
      const name = member.user.first_name ?? 'Friend';
      ctx.reply(
        `👋 Welcome, *${name}*!\n\n` +
        `You've joined *GAD Family* — the Move-to-Earn ecosystem on BNB Chain.\n\n` +
        `🤖 Message the bot in private to get started: @GADFamilyM2E_bot\n` +
        `💰 /price — live GAD price\n` +
        `🔗 /links — all ecosystem links`,
        { parse_mode: 'Markdown' }
      );
    }
  });

  return bot;
}
