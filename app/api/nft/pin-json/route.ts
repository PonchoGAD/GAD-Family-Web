// app/api/nft/pin-json/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

// Префлайт
export async function OPTIONS() {
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

// HEAD (CDN/браузер может дернуть)
export async function HEAD() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  });
}

type PinataPinResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

function sanitize(x: unknown) {
  if (!x || typeof x !== "object") return {};
  const o: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(x as Record<string, unknown>)) {
    if (v === undefined || typeof v === "function") continue;
    o[k] = typeof v === "bigint" ? v.toString() : v;
  }
  return o;
}

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "PINATA_JWT is missing" }, { status: 500 });
    }

    const text = await req.text();
    let meta: unknown = null;
    try { meta = JSON.parse(text); } catch { /* пусто */ }

    if (!meta || typeof meta !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const safe = sanitize(meta);

    const up = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataMetadata: { name: String((safe as { name?: string }).name || "GAD NFT Metadata") },
        pinataContent: safe,
        pinataOptions: { cidVersion: 1 },
      }),
      cache: "no-store",
    });

    const raw = await up.text();
    let j: PinataPinResp | { __text: string } | Record<string, unknown>;
    try { j = JSON.parse(raw) as PinataPinResp; } catch { j = { __text: raw }; }

    const cid = (j as PinataPinResp).IpfsHash;
    if (!up.ok || !cid) {
      return NextResponse.json(
        { ok: false, error: `pinJSONToIPFS failed: ${JSON.stringify(j)}` },
        { status: 500 }
      );
    }

    const gatewayBase = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/").replace(/\/?$/, "/");
    return NextResponse.json(
      { ok: true, cid, uri: `ipfs://${cid}`, gateway: gatewayBase + cid },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// Для любых других методов — 405 + Allow
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
