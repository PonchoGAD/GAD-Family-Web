// app/api/nft/pin-file/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type PinataPinResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

// Префлайт (если браузер шлёт OPTIONS)
export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) {
      return NextResponse.json({ ok: false, error: "PINATA_JWT is missing" }, { status: 500 });
    }

    // читаем multipart/form-data
    const form = await req.formData();
    const file = form.get("file");
    const nameRaw = form.get("name");
    const pinName = typeof nameRaw === "string" && nameRaw.trim() ? nameRaw.trim() : "GAD NFT Image";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "file is required" }, { status: 400 });
    }

    // базовые валидации
    const size = file.size ?? 0;
    const type = file.type ?? "application/octet-stream";
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

    // готовим FormData для Pinata (важно передать filename)
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

    // Парсим без any
    let data: (PinataPinResp & { error?: unknown }) | { __text: string };
    try {
      data = JSON.parse(raw) as PinataPinResp & { error?: unknown };
    } catch {
      data = { __text: raw };
    }

    // Проверяем успешность
    if (!up.ok || !("IpfsHash" in data) || !data.IpfsHash) {
      return NextResponse.json(
        { ok: false, error: `pinFileToIPFS failed: ${JSON.stringify(data)}` },
        { status: 500 }
      );
    }

    const cid = data.IpfsHash;
    const gatewayBase = process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/";
    return NextResponse.json({
      ok: true,
      cid,
      uri: `ipfs://${cid}`,
      gateway: gatewayBase.replace(/\/?$/, "/") + cid, // нормализуем слэш
      size: "PinSize" in data && typeof data.PinSize === "number" ? data.PinSize : size,
      type,
      name: pinName,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// Явный 405 на GET, чтобы нельзя было просто открыть эндпоинт в браузере
export async function GET() {
  return NextResponse.json({ ok: false, error: "Method Not Allowed" }, { status: 405 });
}
