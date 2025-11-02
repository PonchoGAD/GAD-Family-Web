// app/api/nft/pin-json/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

type PinataPinResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

function cors204() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS, HEAD",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export async function OPTIONS() { return cors204(); }
export async function HEAD()    { return cors204(); }

// Универсальный парсер тела
async function readBody(req: NextRequest): Promise<unknown | null> {
  const text = await req.text();
  try { return JSON.parse(text); } catch { return null; }
}

// Лёгкая санитизация метаданных
function sanitizeMeta(x: unknown): Record<string, unknown> {
  if (!x || typeof x !== "object") return {};
  const src = x as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(src)) {
    if (v === undefined || typeof v === "function") continue;
    out[k] = typeof v === "bigint" ? v.toString() : v;
  }
  return out;
}

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "PINATA_JWT is missing" }, { status: 500 });
    }

    const metaRaw = await readBody(req);
    if (!metaRaw || typeof metaRaw !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const safe = sanitizeMeta(metaRaw);
    const name = typeof (safe as { name?: unknown }).name === "string" && (safe as { name?: string }).name?.trim()
      ? (safe as { name: string }).name.trim()
      : "GAD NFT Metadata";

    const up = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataMetadata: { name },
        pinataContent: safe,
        pinataOptions: { cidVersion: 1 },
      }),
      cache: "no-store",
    });

    const raw = await up.text();
    let parsed: PinataPinResp | { __text: string };
    try { parsed = JSON.parse(raw) as PinataPinResp; }
    catch { parsed = { __text: raw }; }

    const ok = up.ok && "IpfsHash" in parsed && typeof (parsed as PinataPinResp).IpfsHash === "string";
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: `pinJSONToIPFS failed: ${JSON.stringify(parsed)}` },
        { status: 500 }
      );
    }

    const cid = (parsed as PinataPinResp).IpfsHash;
    const base = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/").replace(/\/?$/, "/");

    return NextResponse.json(
      { ok: true, cid, uri: `ipfs://${cid}`, gateway: base + cid },
      { status: 200, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// Явный 405 на GET
export async function GET() {
  return new NextResponse(JSON.stringify({ ok: false, error: "Method Not Allowed" }), {
    status: 405,
    headers: {
      "content-type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Allow": "POST, OPTIONS, HEAD",
    },
  });
}
