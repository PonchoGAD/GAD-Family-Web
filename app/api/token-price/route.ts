import { NextResponse } from 'next/server';

const GAD_TOKEN = '0x858bab88A5b8d7f29a40380c5F2D8d0b8812FE62';

export const revalidate = 60; // 1 min cache

export async function GET() {
  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${GAD_TOKEN}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    const pair = data?.pairs?.[0] ?? null;

    if (!pair) {
      return NextResponse.json({ ok: false, price: null, message: 'No pair found on DexScreener' });
    }

    return NextResponse.json({
      ok: true,
      price:       pair.priceUsd ?? null,
      priceNative: pair.priceNative ?? null,
      change24h:   pair.priceChange?.h24 ?? null,
      change6h:    pair.priceChange?.h6  ?? null,
      volume24h:   pair.volume?.h24 ?? null,
      liquidity:   pair.liquidity?.usd ?? null,
      marketCap:   pair.marketCap ?? null,
      fdv:         pair.fdv ?? null,
      txns24h: {
        buys:  pair.txns?.h24?.buys  ?? 0,
        sells: pair.txns?.h24?.sells ?? 0,
      },
      pairAddress: pair.pairAddress ?? null,
      pairUrl:     pair.url ?? null,
      updatedAt:   Date.now(),
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
