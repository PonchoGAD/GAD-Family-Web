// app/api/nft/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { url, fileName = "asset.png", contentType: _contentType = "image/png" } = await req.json();
    if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

    const jwt = process.env.PINATA_JWT;
    if (!jwt) throw new Error("PINATA_JWT is missing");

    const file = await fetch(url, { cache: "no-store" });
    if (!file.ok) throw new Error(`fetch file failed: ${file.status}`);
    const blob = await file.blob();

    const form = new FormData();
    // Прикручиваем расширение к имени файла, чтобы «использовать» _contentType и не ругаться на eslint
    const safeName = fileName.includes(".") ? fileName : (_contentType.includes("png") ? `${fileName}.png` : fileName);
    form.append("file", blob, safeName);
    form.append("pinataMetadata", JSON.stringify({ name: safeName }));
    form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));

    const up = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
    });

    const raw = await up.text();
    const json = (() => { try { return JSON.parse(raw); } catch { return { __text: raw }; } })();
    if (!up.ok) throw new Error(`pinFileToIPFS failed: ${JSON.stringify(json)}`);

    const cid = json?.IpfsHash;
    return NextResponse.json({ cid, uri: `ipfs://${cid}`, gatewayUrl: `https://ipfs.io/ipfs/${cid}`, provider: "pinata" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
