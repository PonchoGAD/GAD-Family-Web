// lib/nft/ipfs.ts
const PINATA_JWT = process.env.PINATA_JWT || "";
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

export type PinJsonResp = { IpfsHash: string; PinSize: number; Timestamp: string };

const isServer = typeof window === "undefined";

export const pinJSON = async (payload: unknown): Promise<{ cid: string; url: string }> => {
  if (!isServer) {
    // клиент → безопасно проксируем через API
    const res = await fetch("/api/ipfs/pinJSON", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`pinJSON api failed: ${res.status}`);
    const { cid } = (await res.json()) as { cid: string };
    return { cid, url: `${PINATA_GATEWAY}/ipfs/${cid}` };
  }

  // сервер → прямой вызов Pinata
  if (!PINATA_JWT) throw new Error("PINATA_JWT is missing in env");
  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Pinata JSON failed: ${res.status}`);
  const data = (await res.json()) as PinJsonResp;
  return { cid: data.IpfsHash, url: `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}` };
};

export const pinFile = async (file: File | Blob): Promise<{ cid: string; url: string }> => {
  if (!isServer) {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/ipfs/pinFile", { method: "POST", body: form });
    if (!res.ok) throw new Error(`pinFile api failed: ${res.status}`);
    const { cid } = (await res.json()) as { cid: string };
    return { cid, url: `${PINATA_GATEWAY}/ipfs/${cid}` };
  }

  if (!PINATA_JWT) throw new Error("PINATA_JWT is missing in env");
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: form,
  });
  if (!res.ok) throw new Error(`Pinata File failed: ${res.status}`);
  const data = (await res.json()) as PinJsonResp;
  return { cid: data.IpfsHash, url: `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}` };
};
