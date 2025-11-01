"use client";

import { useState } from "react";
import Image from "next/image";
import { ethers, Contract } from "ethers";
import { ADDR } from "../../../lib/nft/config";
import { getSigner } from "../../../lib/nft/eth";
import { nft721Abi } from "../../../lib/nft/abis/nft721";

type PinFileResp = {
  ok: boolean;
  cid?: string;
  uri?: string;      // ipfs://...
  gateway?: string;  // https gateway for preview
  error?: string;
};

type PinJsonResp = {
  ok: boolean;
  cid?: string;
  uri?: string;      // ipfs://...
  error?: string;
};

type UnknownRecord = Record<string, unknown>;

export default function UploadMintWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>(""); // gateway или dataURL
  const [imageIpfs, setImageIpfs] = useState<string>(""); // ipfs://...
  const [name, setName] = useState("My NFT");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const onFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    setImageIpfs("");
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  async function pinFile(): Promise<{ imageUri: string; gateway: string }> {
    if (!file) throw new Error("Choose image first");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name || "GAD NFT Image");

    const r = await fetch("/api/nft/pin-file", { method: "POST", body: fd });
    const j = (await r.json()) as PinFileResp;
    if (!j.ok || !j.uri) throw new Error(j.error || "pin-file failed");
    return { imageUri: j.uri, gateway: j.gateway || "" };
  }

  async function pinJson(imageUri: string): Promise<string> {
    const meta = {
      name: name || "GAD NFT",
      description: description || "Minted via GAD Family Studio",
      image: imageUri,
      attributes: [] as Array<Record<string, unknown>>,
    };
    const r = await fetch("/api/nft/pin-json", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meta),
    });
    const j = (await r.json()) as PinJsonResp;
    if (!j.ok || !j.uri) throw new Error(j.error || "pin-json failed");
    return j.uri; // ipfs://...
  }

  async function detectMintFee(c721: Contract): Promise<bigint> {
    const candidates = ["mintFeeWei", "mintFee", "MINT_FEE", "fee"] as const;

    for (const fn of candidates) {
      try {
        const rec = c721 as unknown as UnknownRecord;
        const maybe = rec[fn];

        if (typeof maybe === "function") {
          const call = maybe as () => Promise<unknown>;
          const v = await call();
          if (typeof v === "bigint") return v;
          if (v && typeof (v as { toString?: () => string }).toString === "function") {
            const s = (v as { toString: () => string }).toString();
            return BigInt(s);
          }
        }
      } catch {
        // try next
      }
    }
    // дефолт-ожидание, если контракт не дал явного значения
    return ethers.parseEther("0.001");
  }

  type MintWithFee1 = (tokenUri: string, overrides: { value: bigint }) => Promise<ethers.TransactionResponse>;
  type MintWithFee2 = (to: string, tokenUri: string, overrides: { value: bigint }) => Promise<ethers.TransactionResponse>;

  const mint = async () => {
    if (!file) return alert("Choose image first");
    try {
      setBusy(true);
      setStatus("Uploading file to IPFS…");
      const { imageUri, gateway } = await pinFile();
      setImageIpfs(imageUri);
      if (gateway) setPreview(gateway);

      setStatus("Creating metadata (pin-json) …");
      const tokenUri = await pinJson(imageUri);

      setStatus("Preparing wallet…");
      const signer = await getSigner();
      const c721 = new Contract(ADDR.NFT721, nft721Abi, signer);
      const fee = await detectMintFee(c721);

      setStatus(`Sending mint tx (fee ${ethers.formatEther(fee)} BNB)…`);
      const rec = c721 as unknown as UnknownRecord;
      const mwfUnknown = rec["mintWithFee"];

      if (typeof mwfUnknown !== "function") {
        throw new Error("mintWithFee method not found");
      }

      let tx: ethers.TransactionResponse;
      try {
        // mintWithFee(tokenUri, { value })
        const mwf1 = mwfUnknown as MintWithFee1;
        tx = await mwf1(tokenUri, { value: fee });
      } catch {
        // mintWithFee(to, tokenUri, { value })
        const to = await signer.getAddress();
        const mwf2 = mwfUnknown as MintWithFee2;
        tx = await mwf2(to, tokenUri, { value: fee });
      }

      await tx.wait();
      setStatus("Minted ✅ (fee & gas paid by user)");
      alert("Minted ✅");
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Mint failed";
      setStatus(msg);
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-3 space-y-3">
          <div className="font-semibold">1) Image</div>
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
          {preview && (
            <div className="rounded border overflow-hidden">
              <Image
                src={preview}
                alt="preview"
                width={512}
                height={512}
                className="w-full h-auto"
                unoptimized
                priority
              />
            </div>
          )}
          {imageIpfs && (
            <div className="text-xs opacity-70 break-all">
              IPFS: {imageIpfs}
            </div>
          )}
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="font-semibold">2) Metadata</div>
          <input
            className="border p-2 w-full rounded"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="border p-2 w-full rounded"
            placeholder="Description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="text-xs opacity-70">
            Token: {ADDR.NFT721}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="border px-4 py-2 rounded hover:bg-black hover:text-white disabled:opacity-50"
          onClick={mint}
          disabled={busy || !file || !name.trim()}
        >
          Upload & Mint
        </button>
        {status && <div className="text-sm opacity-70 self-center">{status}</div>}
      </div>
    </div>
  );
}
