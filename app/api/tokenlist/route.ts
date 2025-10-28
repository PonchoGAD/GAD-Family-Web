import { NextResponse } from 'next/server';
import bscDefault from '@/src/wallet/core/tokenlist/bsc-default.json';

// небольшой таймаут, чтобы не висеть
async function fetchWithTimeout(url: string, ms: number) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, next: { revalidate: 60 } });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_BSC_TOKENLIST_URL;
  if (url) {
    try {
      const res = await fetchWithTimeout(url, 3000);
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: 200 });
      }
    } catch {
      // fallthrough to default
    }
  }
  // фоллбек — минимальный список
  return NextResponse.json(bscDefault, { status: 200 });
}
