// app/api/airdrop-proof/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const address = (searchParams.get('address') || '').trim().toLowerCase();
    if (!/^0x[0-9a-f]{40}$/.test(address)) {
      return NextResponse.json({ error: 'bad address' }, { status: 400 });
    }
    const file = path.join(process.cwd(), 'public', 'airdrop-proofs.json');
    const raw = await fs.readFile(file, 'utf-8');
    const db = JSON.parse(raw || '{}');
    const rec = db[address];
    if (!rec) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(rec);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'internal error' }, { status: 500 });
  }
}
