import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const PINATA_JWT = process.env.PINATA_JWT || "";
  if (!PINATA_JWT) return NextResponse.json({ error: "PINATA_JWT missing" }, { status: 500 });

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof Blob)) return NextResponse.json({ error: "file required" }, { status: 400 });

  const upstream = new FormData();
  upstream.append("file", file);

  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: upstream,
  });

  if (!res.ok) return NextResponse.json({ error: "pinFile failed" }, { status: 500 });
  const data = await res.json();
  return NextResponse.json({ cid: data.IpfsHash });
}
