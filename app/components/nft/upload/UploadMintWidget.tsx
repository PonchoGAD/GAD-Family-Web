// app/nft/components/nft/upload/UploadMintWidget.tsx
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { ADDR } from "../../../lib/nft/config";
import { getSigner } from "../../../lib/nft/eth";
import { nft721Abi } from "../../../lib/nft/abis/nft721";

type UploadResp = { imageCid?: string; metadataCid?: string; tokenUri: string };

export default function UploadMintWidget() {
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

  const uploadToAPI = async (): Promise<UploadResp> => {
    const res = await fetch("/nft/api/mint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: fileDataUrl, name, description }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error((j as { error?: string })?.error || "Upload failed");
    }
    return (await res.json()) as UploadResp;
  };

  const detectMintFee = async (c721: ethers.Contract): Promise<bigint> => {
    const candidates = ["mintFeeWei", "mintFee", "MINT_FEE", "fee"] as const;

    for (const fn of candidates) {
      try {
        // динамический, но типобезопасный вызов
        const maybe = (c721 as unknown as Record<string, unknown>)[fn];
        if (typeof maybe === "function") {
          const v = (await (maybe as () => Promise<unknown>)()) as unknown;

          if (typeof v === "bigint") return v;

          if (typeof v === "object" && v !== null) {
            // поддержка BigNumber-подобных
            const s = (v as { toString?: () => string }).toString?.();
            if (typeof s === "string") return BigInt(s);
          }
        }
      } catch {
        // пробуем следующий кандидат
      }
    }
    return ethers.parseEther("0.01");
  };

  // перегрузки mintWithFee без any
  type MintWithFee1 = (tokenUri: string, overrides: { value: bigint }) => Promise<ethers.TransactionResponse>;
  type MintWithFee2 = (to: string, tokenUri: string, overrides: { value: bigint }) => Promise<ethers.TransactionResponse>;

  const mint = async () => {
    if (!fileDataUrl) return alert("Choose image first");
    try {
      setBusy(true);
      setStatus("Uploading…");
      const { tokenUri } = await uploadToAPI();

      setStatus("Preparing mint…");
      const signer = await getSigner();
      const c721 = new ethers.Contract(ADDR.NFT721, nft721Abi, signer);
      const fee = await detectMintFee(c721);

      setStatus("Sending transaction…");
      const mwf = (c721 as unknown as { mintWithFee?: MintWithFee1 | MintWithFee2 }).mintWithFee;
      if (!mwf) throw new Error("mintWithFee method not found");

      let tx: ethers.TransactionResponse;
      try {
        // вариант: mintWithFee(string)
        tx = await (mwf as MintWithFee1)(tokenUri, { value: fee });
      } catch {
        // вариант: mintWithFee(address,string)
        const to = await signer.getAddress();
        tx = await (mwf as MintWithFee2)(to, tokenUri, { value: fee });
      }

      await tx.wait();

      setStatus("Minted ✅");
      alert("Minted ✅");
    } catch (e: unknown) {
      // eslint-disable-next-line no-console
      console.error(e);
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
          Upload & Mint
        </button>
        {status && <div className="text-sm opacity-70 self-center">{status}</div>}
      </div>

      <div className="mt-6 text-xs opacity-70 space-y-1">
        <div>NFT721: {ADDR.NFT721}</div>
      </div>
    </div>
  );
}
