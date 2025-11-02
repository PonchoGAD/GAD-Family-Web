// app/api/nft/pin-json/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PinataResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

async function readJson(req: NextRequest) {
  const text = await req.text();
  try { return JSON.parse(text) as Record<string, unknown>; }
  catch { return {}; }
}

// ✅ OPTIONS для preflight
export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

// ✅ POST — основной
export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) return NextResponse.json({ ok: false, error: "PINATA_JWT missing" }, { status: 500 });

    const meta = await readJson(req);
    if (!meta || typeof meta !== "object" || Object.keys(meta).length === 0)
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });

    // Простейшая очистка
    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(meta)) {
      if (v === undefined || typeof v === "function") continue;
      safe[k] = typeof v === "bigint" ? v.toString() : v;
    }

    const up = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataMetadata: { name: (safe.name as string) || "GAD NFT Metadata" },
        pinataContent: safe,
        pinataOptions: { cidVersion: 1 },
      }),
      cache: "no-store",
    });

    const raw = await up.text();
    let j: PinataResp | { error?: unknown; __text?: string };
    try { j = JSON.parse(raw); } catch { j = { __text: raw }; }

    if (!up.ok || !("IpfsHash" in j) || !j.IpfsHash)
      return NextResponse.json({ ok: false, error: `pinJSONToIPFS failed: ${JSON.stringify(j)}` }, { status: 500 });

    const cid = j.IpfsHash;
    const gatewayBase = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
    return NextResponse.json({
      ok: true,
      cid,
      uri: `ipfs://${cid}`,
      gateway: gatewayBase.replace(/\/?$/, "/") + cid,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// ❌ GET — запрещён (чтобы не открывали в браузере)
export async function GET() {
  return NextResponse.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
}
