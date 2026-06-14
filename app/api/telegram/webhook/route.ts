import { NextRequest, NextResponse } from 'next/server';
import { createBot } from '@/lib/bot';

// Vercel Edge compatible: use Node runtime for telegraf
export const runtime = 'nodejs';

// Singleton bot (warm between requests on same instance)
let bot: ReturnType<typeof createBot> | null = null;

function getBot() {
  if (!bot) bot = createBot();
  return bot;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const b = getBot();
    // Process update manually (webhook mode)
    await b.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[tg-webhook]', err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

// GET — set webhook (call once on deploy: /api/telegram/webhook?set=1)
export async function GET(req: NextRequest) {
  const set = req.nextUrl.searchParams.get('set');
  const secret = req.nextUrl.searchParams.get('secret');

  // Simple auth
  if (secret !== process.env.TELEGRAM_SETUP_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (set === '1') {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/telegram/webhook`;
    const b = getBot();
    await b.telegram.setWebhook(webhookUrl);
    return NextResponse.json({ ok: true, webhookUrl });
  }

  // Get webhook info
  const b = getBot();
  const info = await b.telegram.getWebhookInfo();
  return NextResponse.json(info);
}
