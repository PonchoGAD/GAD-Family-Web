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

type MintWithFeeSig = (to: string, tokenUri: string, overrides: { value: bigint }) => Promise<ethers.TransactionResponse>;
type Mint1Sig = (tokenUri: string, overrides?: { value?: bigint }) => Promise<ethers.TransactionResponse>;
type Mint2Sig = (to: string, tokenUri: string, overrides?: { value?: bigint }) => Promise<ethers.TransactionResponse>;

const GATEWAY = (process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://ipfs.io/ipfs/").replace(/\/+$/, "");

export default function UploadMintWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [imageIpfs, setImageIpfs] = useState<string>("");
  const [name, setName] = useState("My NFT");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const onFile = (f?: File) => {
    if (!f) return;
    setFile(f);
    setImageIpfs("");
    setPreview(URL.createObjectURL(f));
  };

  async function pinFile(): Promise<{ imageUri: string; gateway: string }> {
    if (!file) throw new Error("Choose image first");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name || "GAD NFT Image");

    const r = await fetch("/api/nft/pin-file", { method: "POST", body: fd });
    const j: PinFileResp = await r.json();
    if (!j.ok || !j.uri) throw new Error(j.error || "pin-file failed");

    const gw = j.gateway || (j.cid ? `${GATEWAY}/${j.cid}` : "");
    return { imageUri: j.uri, gateway: gw };
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
    const j: PinJsonResp = await r.json();
    if (!j.ok || !j.uri) throw new Error(j.error || "pin-json failed");
    return j.uri; // ipfs://...
  }

  async function detectMintFee(c721: Contract): Promise<bigint> {
    const candidates = ["mintFeeWei", "mintFee", "MINT_FEE", "fee"] as const;
    for (const fn of candidates) {
      const maybe = (c721 as unknown as Record<string, unknown>)[fn];
      if (typeof maybe === "function") {
        try {
          const v = await (maybe as () => Promise<unknown>)();
          if (typeof v === "bigint") return v;
          const s = (v as { toString?: () => string } | null)?.toString?.();
          if (typeof s === "string") return BigInt(s);
        } catch { /* next */ }
      }
    }
    return ethers.parseEther("0.001"); // fallback
  }

  // пред-симуляция через estimateGas — без ts-комментариев и any
  async function simulateAndPick(
    c721: Contract,
    to: string,
    tokenUri: string,
    fee: bigint
  ): Promise<"mintWithFee" | "mint1" | "mint2"> {
    // 1) ваш основной путь: mintWithFee(address,string)
    if ("mintWithFee" in c721) {
      try {
        await (c721 as unknown as { estimateGas: { mintWithFee: MintWithFeeSig } })
          .estimateGas.mintWithFee(to, tokenUri, { value: fee });
        return "mintWithFee";
      } catch { /* try other fallbacks */ }
    }
    // 2) fallback: mint(tokenUri)
    if ("mint" in c721) {
      try {
        await (c721 as unknown as { estimateGas: { mint: Mint1Sig } })
          .estimateGas.mint(tokenUri, { value: fee });
        return "mint1";
      } catch { /* next */ }
      // 3) fallback: mint(to, tokenUri)
      try {
        await (c721 as unknown as { estimateGas: { mint: Mint2Sig } })
          .estimateGas.mint(to, tokenUri, { value: fee });
        return "mint2";
      } catch { /* next */ }
    }
    throw new Error("Contract reverted during gas estimation for all known variants. Check fee, pause/allowlist, or ABI.");
  }

  const mint = async () => {
    if (!file) return alert("Choose image first");
    try {
      setBusy(true);
      setStatus("Uploading file to IPFS…");
      const { imageUri, gateway } = await pinFile();
      setImageIpfs(imageUri);
      if (gateway) setPreview(gateway);

      setStatus("Creating metadata…");
      const tokenUri = await pinJson(imageUri);

      setStatus("Preparing wallet…");
      const signer = await getSigner();
      const to = await signer.getAddress();
      const c721 = new Contract(ADDR.NFT721, nft721Abi, signer);

      const fee = await detectMintFee(c721);

      setStatus("Estimating gas…");
      const variant = await simulateAndPick(c721, to, tokenUri, fee);

      setStatus(`Sending mint tx (fee ${ethers.formatEther(fee)} BNB)…`);
      let tx: ethers.TransactionResponse;
      if (variant === "mintWithFee") {
        tx = await (c721 as unknown as { mintWithFee: MintWithFeeSig })
          .mintWithFee(to, tokenUri, { value: fee });
      } else if (variant === "mint1") {
        tx = await (c721 as unknown as { mint: Mint1Sig })
          .mint(tokenUri, { value: fee });
      } else {
        tx = await (c721 as unknown as { mint: Mint2Sig })
          .mint(to, tokenUri, { value: fee });
      }

      await tx.wait();
      setStatus("Minted ✅ (fee & gas paid by user)");
      alert("Minted ✅");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Mint failed";
      if (/fee required/i.test(msg)) {
        setStatus("Mint failed: fee required (msg.value too low).");
      } else {
        setStatus(msg);
      }
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
            <div className="text-xs opacity-70 break-all">IPFS: {imageIpfs}</div>
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
          <div className="text-xs opacity-70">Token: {ADDR.NFT721}</div>
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
