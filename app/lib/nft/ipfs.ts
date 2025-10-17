const PINATA_JWT = process.env.PINATA_JWT!;
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || "https://gateway.pinata.cloud";

export type PinJsonResp = { IpfsHash: string; PinSize: number; Timestamp: string };

export const pinJSON = async (payload: any): Promise<{ cid: string; url: string }> => {
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
  const url = `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;
  return { cid: data.IpfsHash, url };
};

export const pinFile = async (file: File | Blob): Promise<{ cid: string; url: string }> => {
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
  const url = `${PINATA_GATEWAY}/ipfs/${data.IpfsHash}`;
  return { cid: data.IpfsHash, url };
};
