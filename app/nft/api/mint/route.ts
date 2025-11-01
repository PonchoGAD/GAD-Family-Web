// app/nft/api/mint/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Ответ Pinata */
type PinataPinResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

type NftMetadata = {
  name?: string;
  description?: string;
  image: string;
  attributes?: Array<Record<string, unknown>>;
};

// ─── helpers ────────────────────────────────────────────────────────────────
function sanitizeMetadata(meta: NftMetadata): NftMetadata {
  const safe: NftMetadata = {
    name: meta.name ? String(meta.name) : undefined,
    description: meta.description ? String(meta.description) : undefined,
    image: String(meta.image),
    attributes: Array.isArray(meta.attributes)
      ? meta.attributes.map((a) => {
          const out: Record<string, unknown> = {};
          Object.entries(a ?? {}).forEach(([k, v]) => {
            if (v === undefined || typeof v === "function") return;
            if (typeof v === "bigint") out[k] = v.toString();
            else out[k] = v;
          });
          return out;
        })
      : [],
  };
  return safe;
}

async function readAsJsonOrText(r: Response) {
  const raw = await r.text();
  try { return JSON.parse(raw); } catch { return { __text: raw }; }
}

// ─── Pinata: upload image by URL ────────────────────────────────────────────
async function pinataUploadImageFromUrl(url: string): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT is missing");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`fetch image failed: ${res.status}`);
  const blob = await res.blob();

  const form = new FormData();
  form.append("file", blob, "image.png");
  form.append("pinataMetadata", JSON.stringify({ name: "GAD NFT Image" }));
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

  const up = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });

  const data = (await readAsJsonOrText(up)) as PinataPinResp & { error?: unknown; __text?: string };
  if (!up.ok) throw new Error(`pinFileToIPFS failed: ${JSON.stringify(data)}`);
  if (!data?.IpfsHash) throw new Error(`pinFileToIPFS no IpfsHash: ${JSON.stringify(data)}`);
  return `ipfs://${data.IpfsHash}`;
}

// ─── Pinata: upload metadata JSON ───────────────────────────────────────────
async function pinataUploadJSON(json: NftMetadata, name = "GAD NFT Metadata"): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT is missing");

  const safe = sanitizeMetadata(json);

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
  });

  const data = (await readAsJsonOrText(up)) as PinataPinResp & { error?: unknown; __text?: string };
  if (!up.ok) throw new Error(`pinJSONToIPFS failed: ${JSON.stringify(data)}`);
  if (!data?.IpfsHash) throw new Error(`pinJSONToIPFS no IpfsHash: ${JSON.stringify(data)}`);
  return `ipfs://${data.IpfsHash}`;
}

// ─── API: POST ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      // ВНИМАНИЕ: теперь сервер НЕ минтит и поле `to` не требуется.
      name?: string;
      description?: string;
      imageUrl?: string;
      attributes?: Array<Record<string, unknown>>;
    };

    const { name, description, imageUrl, attributes } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json({ error: "imageUrl is required" }, { status: 400 });
    }

    // 1) image → IPFS
    const imageCidUri = await pinataUploadImageFromUrl(imageUrl);

    // 2) metadata → IPFS
    const tokenUri = await pinataUploadJSON(
      {
        name: name || "GAD NFT",
        description: description || "Minted via GAD Family AI Studio",
        image: imageCidUri,
        attributes: Array.isArray(attributes) ? attributes : [],
      },
      name || "GAD NFT Metadata"
    );

    // Возвращаем только данные для клиентского минта
    return NextResponse.json({ ok: true, tokenUri, imageCidUri });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
