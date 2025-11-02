import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PinataResp = {
  IpfsHash?: string;
  PinSize?: number;
  Timestamp?: string;
  error?: string;
  message?: string;
  __text?: string;
};

// Универсальный парсер тела
async function readJson<T = unknown>(req: NextRequest): Promise<T | null> {
  const text = await req.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

// ⚙️ префлайт (если браузер шлёт OPTIONS)
export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

// ✅ основной метод
export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "PINATA_JWT is missing" }, { status: 500 });
    }

    const meta = await readJson<Record<string, unknown>>(req);
    if (!meta || typeof meta !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    // Санитизация метаданных
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
        pinataMetadata: { name: String((safe.name as string) || "GAD NFT Metadata") },
        pinataContent: safe,
        pinataOptions: { cidVersion: 1 },
      }),
      cache: "no-store",
    });

    const raw = await up.text();
    let j: PinataResp;
    try {
      j = JSON.parse(raw) as PinataResp;
    } catch {
      j = { __text: raw };
    }

    if (!up.ok || !j.IpfsHash) {
      return NextResponse.json(
        { ok: false, error: `pinJSONToIPFS failed: ${JSON.stringify(j)}` },
        { status: 500 }
      );
    }

    const cid = j.IpfsHash;
    const uri = `ipfs://${cid}`;
    const gatewayBase = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
    return NextResponse.json({ ok: true, cid, uri, gateway: gatewayBase + cid });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// 👇 Запрещаем GET (чтобы явно возвращал 405)
export async function GET() {
  return NextResponse.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
}
