// app/api/nft/pin-file/route.ts
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const preferredRegion = "auto";

type PinataPinResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

// --- CORS / preflight
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

export async function HEAD() {
  return new NextResponse(null, {
    status: 204,
    headers: { "Access-Control-Allow-Origin": "*" },
  });
}

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "PINATA_JWT is missing" }, { status: 500 });
    }

    const form = await req.formData();
    const file = form.get("file");
    const nameRaw = form.get("name");
    const pinName =
      typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : "GAD NFT Image";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    const size: number = file.size ?? 0;
    const type: string = file.type ?? "application/octet-stream";
    if (size <= 0) {
      return NextResponse.json({ ok: false, error: "empty file" }, { status: 400 });
    }
    if (size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { ok: false, error: `file too large (>${MAX_SIZE_BYTES} bytes)` },
        { status: 413 }
      );
    }
    if (!ALLOWED_MIME.has(type)) {
      return NextResponse.json(
        { ok: false, error: `unsupported content-type: ${type}` },
        { status: 415 }
      );
    }

    // Pinata upload
    const pinForm = new FormData();
    pinForm.append("file", file, file.name || "upload");
    pinForm.append("pinataMetadata", JSON.stringify({ name: pinName }));
    pinForm.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const up = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: pinForm,
      cache: "no-store",
    });

    const raw = await up.text();
    let parsed: PinataPinResp | { __text: string };
    try {
      parsed = JSON.parse(raw) as PinataPinResp;
    } catch {
      parsed = { __text: raw };
    }

    const ok = up.ok && "IpfsHash" in parsed && typeof (parsed as PinataPinResp).IpfsHash === "string";
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: `pinFileToIPFS failed: ${JSON.stringify(parsed)}` },
        { status: 500 }
      );
    }

    const cid = (parsed as PinataPinResp).IpfsHash;
    const gatewayBase = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/").replace(/\/?$/, "/");

    return NextResponse.json(
      {
        ok: true,
        cid,
        uri: `ipfs://${cid}`,
        gateway: gatewayBase + cid,
        size: "PinSize" in parsed && typeof parsed.PinSize === "number" ? parsed.PinSize : size,
        type,
        name: pinName,
      },
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
