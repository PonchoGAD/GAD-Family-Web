import { NextRequest, NextResponse } from 'next/server';
import { createBot, fetchGADPrice } from '@/lib/bot';

export const runtime = 'nodejs';

// Called by Vercel Cron (vercel.json) or external cron service once per day
// Authorization: Bearer CRON_SECRET
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const channelId = process.env.TELEGRAM_CHANNEL_ID;
  if (!channelId) {
    return NextResponse.json({ error: 'TELEGRAM_CHANNEL_ID not set' }, { status: 500 });
  }

  try {
    const p = await fetchGADPrice();
    const bot = createBot();

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    await bot.telegram.sendMessage(
      channelId,
      `📊 *Daily GAD Report* — ${dateStr}\n\n` +
      `💰 Price: ${p.priceUsd}\n` +
      `📈 24h Change: ${p.change24h}\n` +
      `📦 Volume: ${p.volume24h}\n` +
      `💧 Liquidity: ${p.liquidity}\n\n` +
      `🔒 50% supply locked · 36 months\n` +
      `🚀 IDO coming · Q3 2026\n\n` +
      `Buy: [PancakeSwap](https://pancakeswap.finance/swap?outputCurrency=0x858bab88A5b8d7f29a40380c5F2D8d0b8812FE62) · [Launchpad](https://gad-family.com/launchpad)\n` +
      `#GAD #BNBChain #MoveToEarn #Web3`,
      { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } }
    );

    return NextResponse.json({ ok: true, sent: dateStr });
  } catch (err) {
    console.error('[tg-cron]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
