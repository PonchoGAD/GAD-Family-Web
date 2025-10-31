import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const PINATA_JWT = process.env.PINATA_JWT || "";
  if (!PINATA_JWT) return NextResponse.json({ error: "PINATA_JWT missing" }, { status: 500 });

  const payload = await req.json();
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${PINATA_JWT}` },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) return NextResponse.json({ error: "pinJSON failed" }, { status: 500 });
  const data = await res.json();
  return NextResponse.json({ cid: data.IpfsHash });
}
