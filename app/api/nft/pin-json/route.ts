// app/api/nft/pin-json/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Ответ Pinata */
type PinataPinResp = { IpfsHash: string; PinSize?: number; Timestamp?: string };

export async function POST(req: NextRequest) {
  try {
    const jwt = process.env.PINATA_JWT;
    if (!jwt) throw new Error("PINATA_JWT is missing");

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
    }

    const name = typeof body.name === "string" && body.name.trim() ? body.name : "GAD NFT Metadata";

    // Отправляем на Pinata
    const up = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pinataMetadata: { name },
        pinataContent: body,
        pinataOptions: { cidVersion: 1 },
      }),
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
      throw new Error(`pinJSONToIPFS failed: ${JSON.stringify(data)}`);
    }

    const uri = `ipfs://${data.IpfsHash}`;
    const gateway = `https://ipfs.io/ipfs/${data.IpfsHash}`;

    return NextResponse.json({
      ok: true,
      cid: data.IpfsHash,
      uri,
      gateway,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
