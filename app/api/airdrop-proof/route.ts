// app/api/airdrop-proof/route.ts
import { NextResponse } from "next/server";
import fs from "fs";

// ВАЖНО: гарантируем Node-runtime (иначе fs недоступен)
export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // читать файлы при каждом запросе

function readJsonAdjacent(rel: string) {
  try {
    const url = new URL(rel, import.meta.url); // путь рядом с этим файлом
    const txt = fs.readFileSync(url, "utf8");
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kind = (searchParams.get("kind") || "all").toLowerCase(); // 'roots' | 'base' | 'bonus' | 'all'
  const addressRaw = (searchParams.get("address") || "").trim();
  const address = addressRaw.toLowerCase();

  // 1) Только корни
  if (kind === "roots") {
    const roots = readJsonAdjacent("./roots.json") || {};
    return NextResponse.json(roots);
  }

  // 2) Загружаем base/bonus пакеты (рядом с файлом)
  const basePack = readJsonAdjacent("./base/index.json");
  const bonusPack = readJsonAdjacent("./bonus/index.json");

  // 2a) Без адреса — краткая сводка
  if (!address) {
    return NextResponse.json({
      base: { root: basePack?.root ?? "0x" + "00".repeat(64), count: basePack?.count ?? 0 },
      bonus: { root: bonusPack?.root ?? "0x" + "00".repeat(64), count: bonusPack?.count ?? 0 },
    });
  }

  // 3) Поиск записи (ключи карты — в lower-case)
  const baseEntry = basePack?.map?.[address] ?? null;
  const bonusEntry = bonusPack?.map?.[address] ?? null;

  if (kind === "base") {
    return NextResponse.json(
      {
        root: basePack?.root ?? "0x" + "00".repeat(64),
        count: basePack?.count ?? 0,
        address,
        proof: baseEntry?.proof ?? [],
      },
      { status: baseEntry ? 200 : 404 }
    );
  }
  if (kind === "bonus") {
    return NextResponse.json(
      {
        root: bonusPack?.root ?? "0x" + "00".repeat(64),
        count: bonusPack?.count ?? 0,
        address,
        proof: bonusEntry?.proof ?? [],
      },
      { status: bonusEntry ? 200 : 404 }
    );
  }

  // 4) Агрегированный ответ (по умолчанию)
  const resp = {
    address,
    inBase: !!baseEntry,
    inBonus: !!bonusEntry,
    baseProof: baseEntry?.proof ?? [],
    bonusProof: bonusEntry?.proof ?? [],
  };
  if (!resp.inBase && !resp.inBonus) {
    return NextResponse.json(resp, { status: 404 });
  }
  return NextResponse.json(resp);
}
