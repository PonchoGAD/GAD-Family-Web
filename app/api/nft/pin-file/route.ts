// app/api/nft/pin-file/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Ответ Pinata */
type PinataPinResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

const MAX_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) throw new Error("PINATA_JWT is missing");

    // читаем multipart/form-data
    const form = await req.formData();
    const file = form.get("file");
    const nameRaw = form.get("name");
    const pinName =
      typeof nameRaw === "string" && nameRaw.trim()
        ? nameRaw.trim()
        : "GAD NFT Image";

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

    // готовим FormData для Pinata
    const pinForm = new FormData();
    // ВАЖНО: передаём filename, чтобы Pinata корректно обработала поток
    pinForm.append("file", file, file.name || "upload");
    pinForm.append("pinataMetadata", JSON.stringify({ name: pinName }));
    pinForm.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const up = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: pinForm,
      // кэш не нужен
      cache: "no-store",
    });

    const raw = await up.text();
    const data = (() => {
      try {
        return JSON.parse(raw);
      } catch {
        return { __text: raw };
      }
    })() as PinataPinResp & { error?: unknown; __text?: string };

    if (!up.ok || !data?.IpfsHash) {
      throw new Error(`pinFileToIPFS failed: ${JSON.stringify(data)}`);
    }

    const cid = data.IpfsHash;
    return NextResponse.json({
      ok: true,
      cid,
      uri: `ipfs://${cid}`,
      gateway: `https://ipfs.io/ipfs/${cid}`,
      size: data.PinSize ?? size,
      type,
      name: pinName,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
