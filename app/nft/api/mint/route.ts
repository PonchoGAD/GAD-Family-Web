// app/nft/api/mint/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  imageBase64: string; // "data:image/png;base64,...."
  name: string;
  description?: string;
  attributes?: any[];
};

const PINATA_FILE_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS";
const PINATA_JSON_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS";

// Гарантированно создаём НОВЫЙ ArrayBuffer (а не ссылку на Buffer/SAB)
function base64ToArrayBuffer(dataUrl: string): ArrayBuffer {
  const b64 = (dataUrl || "").split(",", 2)[1] ?? "";
  const buf = Buffer.from(b64, "base64");
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf); // копируем байты в новый ArrayBuffer
  return ab;
}

function guessFilename(dataUrl: string) {
  const m = /^data:(.+?);base64,/.exec(dataUrl || "");
  const mime = m?.[1] ?? "application/octet-stream";
  const ext = mime.split("/")[1] || "bin";
  return { mime, filename: `file.${ext}` };
}

async function pinataPinFile(
  dataUrl: string,
  jwt: string,
  filename?: string,
  pinName = `img-${Date.now()}`
): Promise<{ cid: string }> {
  const ab = base64ToArrayBuffer(dataUrl);
  const { mime, filename: guessed } = guessFilename(dataUrl);

  const form = new FormData();
  // Передаём ИМЕННО ArrayBuffer — это валидный BlobPart для DOM-типов
  form.append("file", new Blob([ab], { type: mime }), filename ?? guessed);
  form.append(
    "pinataMetadata",
    new Blob([JSON.stringify({ name: pinName })], { type: "application/json" })
  );

  const res = await fetch(PINATA_FILE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form as any,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Pinata file error: ${res.status} ${JSON.stringify(json)}`);
  }
  const cid: string | undefined = json.IpfsHash || json.cid;
  if (!cid) throw new Error("Pinata file: missing CID in response");
  return { cid };
}

async function pinataPinJson(
  content: any,
  jwt: string,
  pinName = `meta-${Date.now()}`
): Promise<{ cid: string }> {
  const payload = {
    pinataMetadata: { name: pinName },
    pinataContent: content,
  };

  const res = await fetch(PINATA_JSON_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Pinata json error: ${res.status} ${JSON.stringify(json)}`);
  }
  const cid: string | undefined = json.IpfsHash || json.cid;
  if (!cid) throw new Error("Pinata json: missing CID in response");
  return { cid };
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const { imageBase64, name, description = "", attributes } = body || {};
    if (!imageBase64 || !name) {
      return NextResponse.json(
        { error: "imageBase64 and name are required" },
        { status: 400 }
      );
    }

    const PINATA_JWT =
      process.env.PINATA_JWT || process.env.NEXT_PUBLIC_PINATA_JWT || "";

    if (PINATA_JWT) {
      const { cid: imageCid } = await pinataPinFile(imageBase64, PINATA_JWT);
      const metadata = {
        name,
        description,
        image: `ipfs://${imageCid}`,
        attributes: Array.isArray(attributes) ? attributes : [],
      };
      const { cid: metadataCid } = await pinataPinJson(metadata, PINATA_JWT);
      return NextResponse.json({
        imageCid,
        metadataCid,
        tokenUri: `ipfs://${metadataCid}`,
      });
    }

    // Fallback: data: URI
    const metadata = {
      name,
      description,
      image: imageBase64,
      attributes: Array.isArray(attributes) ? attributes : [],
    };
    const tokenUri =
      "data:application/json;base64," +
      Buffer.from(JSON.stringify(metadata), "utf-8").toString("base64");

    return NextResponse.json({ tokenUri });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "mint api failed" },
      { status: 500 }
    );
  }
}
