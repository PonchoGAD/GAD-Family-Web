// app/nft/studio/page.tsx
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { ADDR } from "../../lib/nft/constants";
import { getSigner } from "../../lib/nft/eth";
import { nft721Abi } from "../../lib/nft/abis/nft721";

type UploadResp = { imageCid: string; metadataCid: string; tokenUri: string };

export default function StudioPage() {
  const [fileDataUrl, setFileDataUrl] = useState<string>("");
  const [name, setName] = useState("My NFT");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const onFile = (f?: File) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setFileDataUrl(reader.result as string);
    reader.readAsDataURL(f);
  };

  const uploadToIPFS = async (): Promise<UploadResp> => {
    const res = await fetch("/nft/api/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: fileDataUrl,
        name,
        description,
      }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error || "Upload failed");
    }
    return (await res.json()) as UploadResp;
  };

  const detectMintFee = async (c721: ethers.Contract): Promise<bigint> => {
    const candidates = ["mintFee", "MINT_FEE", "fee"];
    for (const fn of candidates) {
      try {
        const v = await (c721 as any)[fn]();
        if (typeof v === "bigint") return v;
        if (v?._isBigNumberish) return BigInt(v.toString());
      } catch {}
    }
    // fallback
    return ethers.parseEther("0.01");
  };

  const mint = async () => {
    if (!fileDataUrl) return alert("Choose image first");
    try {
      setBusy(true);
      setStatus("Uploading to IPFS…");
      const { tokenUri } = await uploadToIPFS();

      setStatus("Preparing mint…");
      const signer = await getSigner();
      const c721 = new ethers.Contract(ADDR.NFT721, nft721Abi, signer);
      const fee = await detectMintFee(c721);

      setStatus("Sending transaction…");
      // поддержим 2 сигнатуры: mintWithFee(string) и mintWithFee(address,string)
      let tx;
      try {
        tx = await (c721 as any).mintWithFee(tokenUri, { value: fee });
      } catch {
        const to = await signer.getAddress();
        tx = await (c721 as any).mintWithFee(to, tokenUri, { value: fee });
      }
      await tx.wait();

      setStatus("Minted successfully!");
      alert("Minted ✅");
    } catch (e: any) {
      console.error(e);
      setStatus(e?.message ?? "Mint failed");
      alert(e?.message ?? "Mint failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">AI Studio — Mint</h1>
      <p className="opacity-70 text-sm">
        Upload an image, we’ll pin it & metadata to IPFS (Pinata), then call <code>mintWithFee</code>.
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-3 space-y-3">
          <div className="font-semibold">1) Image</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          {fileDataUrl && (
            <img src={fileDataUrl} alt="preview" className="rounded border" />
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
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className="border px-4 py-2 rounded hover:bg-black hover:text-white disabled:opacity-50"
          onClick={mint}
          disabled={busy || !fileDataUrl || !name.trim()}
        >
          Upload to IPFS & Mint
        </button>
        {status && <div className="text-sm opacity-70 self-center">{status}</div>}
      </div>

      <div className="mt-6 text-xs opacity-70 space-y-1">
        <div>NFT721: {ADDR.NFT721}</div>
      </div>
    </main>
  );
}
