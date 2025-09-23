// app/api/airdrop-proof/route.ts
import { NextResponse } from "next/server";

// ВАЖНО: статические импорты включают JSON в серверный бандл.
// После `npm run airdrop` нужно сделать git add/commit/push этих файлов!
import rootsJson from "./roots.json";
import basePackJson from "./base/index.json";
import bonusPackJson from "./bonus/index.json";

export const runtime = "nodejs";
// данные статичны после билда, но оставим dynamic чтобы не кэшировалось CDN
export const dynamic = "force-dynamic";

type Pack = {
  root: string;
  count: number;
  map?: Record<string, { amount: string; amountWei: string; proof: string[] }>;
};

const ZERO = "0x" + "00".repeat(64);

function getPackSafe(pack: any): Pack {
  return {
    root: typeof pack?.root === "string" ? pack.root : ZERO,
    count: typeof pack?.count === "number" ? pack.count : 0,
    map: (pack?.map ?? {}) as Pack["map"],
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const kind = (searchParams.get("kind") || "all").toLowerCase(); // 'roots' | 'base' | 'bonus' | 'all'
  const addressRaw = (searchParams.get("address") || "").trim();
  const address = addressRaw.toLowerCase();

  const roots = (rootsJson as any) ?? {};
  const basePack = getPackSafe(basePackJson);
  const bonusPack = getPackSafe(bonusPackJson);

  if (kind === "roots") {
    return NextResponse.json(roots);
  }

  // Без адреса — краткая сводка
  if (!address) {
    return NextResponse.json({
      base: { root: basePack.root, count: basePack.count },
      bonus: { root: bonusPack.root, count: bonusPack.count },
    });
  }

  const baseEntry = basePack.map?.[address] ?? null;   // ключи в JSON — в lower-case
  const bonusEntry = bonusPack.map?.[address] ?? null;

  if (kind === "base") {
    return NextResponse.json(
      { root: basePack.root, count: basePack.count, address, proof: baseEntry?.proof ?? [] },
      { status: baseEntry ? 200 : 404 }
    );
  }
  if (kind === "bonus") {
    return NextResponse.json(
      { root: bonusPack.root, count: bonusPack.count, address, proof: bonusEntry?.proof ?? [] },
      { status: bonusEntry ? 200 : 404 }
    );
  }

  // Агрегированный ответ
  const resp = {
    address,
    inBase: !!baseEntry,
    inBonus: !!bonusEntry,
    baseProof: baseEntry?.proof ?? [],
    bonusProof: bonusEntry?.proof ?? [],
  };
  return NextResponse.json(resp, { status: resp.inBase || resp.inBonus ? 200 : 404 });
}
