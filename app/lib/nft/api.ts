// app/lib/nft/api.ts
"use client";

const API = process.env.NEXT_PUBLIC_API_BASE!;

async function json(r: Response) {
  const t = await r.text();
  try { return JSON.parse(t); } catch { throw new Error(t || `HTTP ${r.status}`); }
}

export async function getNftConfig() {
  const r = await fetch(`${API}/api/nft/config`, { cache: "no-store" });
  if (!r.ok) throw new Error(await r.text());
  return json(r);
}

export async function makeSpec(prompt: string) {
  const r = await fetch(`${API}/api/nft/spec`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });
  if (!r.ok) throw new Error(await r.text());
  return json(r);
}

export async function generateImage(prompt: string, style?: string, size?: string) {
  const r = await fetch(`${API}/api/nft/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style, size })
  });
  if (!r.ok) throw new Error(await r.text());
  return json(r); // { url?, savedPath?, ... }
}

export async function uploadToIpfsFromUrl(url: string, fileName = "asset.png", contentType = "image/png") {
  const r = await fetch(`${API}/api/nft/upload`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, fileName, contentType })
  });
  if (!r.ok) throw new Error(await r.text());
  return json(r); // { cid, uri, gatewayUrl, provider }
}

export async function pinJson(metadata: any, name?: string) {
  const r = await fetch(`${API}/api/nft/pin-json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ metadata, name })
  });
  if (!r.ok) throw new Error(await r.text());
  return json(r); // { cid, uri, gatewayUrl, provider }
}
