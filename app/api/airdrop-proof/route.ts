// app/api/airdrop-proof/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic'; // не пререндерим, читаем файлы на каждом запросе

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, 'app', 'api', 'airdrop-proof');

function safeReadJson(rel: string) {
  try {
    const p = path.join(BASE_DIR, rel);
    const txt = fs.readFileSync(p, 'utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kind = (searchParams.get('kind') || 'base').toLowerCase(); // 'base' | 'bonus' | 'roots'
  const address = (searchParams.get('address') || '').trim().toLowerCase();

  // сводка корней
  if (kind === 'roots') {
    const roots = safeReadJson('roots.json') || {};
    return NextResponse.json(roots);
  }

  // конкретный пакет (base/bonus)
  const pack =
    kind === 'bonus'
      ? safeReadJson('bonus/index.json')
      : safeReadJson('base/index.json');

  if (!pack) {
    return NextResponse.json({
      root: '0x' + '00'.repeat(64),
      count: 0,
      proof: [],
    });
  }

  // без адреса возвращаем только root + count
  if (!address) {
    return NextResponse.json({
      root: pack.root,
      count: pack.count,
      proof: [],
    });
  }

  // ищем пруф по адресу (ключи в map — в lower-case)
  const entry = pack.map?.[address] || null;

  return NextResponse.json({
    root: pack.root,
    count: pack.count,
    address,
    proof: entry?.proof || [],
  });
}
