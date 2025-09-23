// app/api/airdrop-proof/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic"; // читать файлы на каждый запрос

const ROOT = process.cwd();
const BASE_DIR = path.join(ROOT, "app", "api", "airdrop-proof");

function safeReadJson(rel: string) {
  try {
    const p = path.join(BASE_DIR, rel);
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kind = (searchParams.get("kind") || "all").toLowerCase(); // 'all' | 'roots' | 'base' | 'bonus'
  const addressRaw = (searchParams.get("address") || "").trim();
  const address = addressRaw.toLowerCase();

  // 1) Только корни
  if (kind === "roots") {
    const roots = safeReadJson("roots.json") || {};
    return NextResponse.json(roots);
  }

  // 2) Загрузка пакетов
  const basePack = safeReadJson("base/index.json");
  const bonusPack = safeReadJson("bonus/index.json");

  // 2a) Если адрес не передан — отдать краткую сводку
  if (!address) {
    return NextResponse.json({
      base: { root: basePack?.root ?? "0x" + "00".repeat(64), count: basePack?.count ?? 0 },
      bonus: { root: bonusPack?.root ?? "0x" + "00".repeat(64), count: bonusPack?.count ?? 0 },
    });
  }

  // 3) Поиск по адресu (ключи в map — в lower-case)
  const baseEntry = basePack?.map?.[address] || null;
  const bonusEntry = bonusPack?.map?.[address] || null;

  // Позволим запрашивать отдельно kind=base/bonus
  if (kind === "base") {
    return NextResponse.json({
      root: basePack?.root ?? "0x" + "00".repeat(64),
      count: basePack?.count ?? 0,
      address,
      proof: baseEntry?.proof ?? [],
    }, { status: baseEntry ? 200 : 404 });
  }
  if (kind === "bonus") {
    return NextResponse.json({
      root: bonusPack?.root ?? "0x" + "00".repeat(64),
      count: bonusPack?.count ?? 0,
      address,
      proof: bonusEntry?.proof ?? [],
    }, { status: bonusEntry ? 200 : 404 });
  }

  // 4) Агрегированный ответ (по умолчанию)
  const resp = {
    address,
    inBase: !!baseEntry,
    inBonus: !!bonusEntry,
    baseProof: baseEntry?.proof ?? [],
    bonusProof: bonusEntry?.proof ?? [],
  };

  // если адрес не найден нигде — 404 (это ожидает фронт)
  if (!resp.inBase && !resp.inBonus) {
    return NextResponse.json(resp, { status: 404 });
  }
  return NextResponse.json(resp);
}
