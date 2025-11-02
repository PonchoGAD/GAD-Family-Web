// app/components/nft/upload/UploadMintWidget.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ethers, Contract, BrowserProvider } from "ethers";
import { ADDR } from "../../../lib/nft/config";
import { getSigner } from "../../../lib/nft/eth";
import { nft721Abi } from "../../../lib/nft/abis/nft721";

// API responses
type PinFileResp = { ok: boolean; cid?: string; uri?: string; gateway?: string; error?: string };
type PinJsonResp = { ok: boolean; cid?: string; uri?: string; error?: string };

// Narrow contract interfaces
type Nft721Read = {
  mintFeeWei: () => Promise<bigint>;
  paused: () => Promise<boolean>;
  vault: () => Promise<string>;
  tokenURI: (id: string | number) => Promise<string>;
};
type Nft721Write = {
  mintWithFee: (to: string, uri: string, overrides: { value: bigint; gasLimit?: bigint }) => Promise<ethers.TransactionResponse>;
};

export default function UploadMintWidget() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [imageIpfs, setImageIpfs] = useState<string>("");

  const [name, setName] = useState("My NFT");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");

  const [mintFee, setMintFee] = useState<string>("");
  const [paused, setPaused] = useState<boolean | null>(null);
  const [vaultAddr, setVaultAddr] = useState<string>("");
  const [vaultIsContract, setVaultIsContract] = useState<boolean | null>(null);

  const hasWallet = useMemo(
    () => typeof window !== "undefined" && !!(window as unknown as { ethereum?: unknown }).ethereum,
    []
  );

  // Preflight: fee/paused/vault
  useEffect(() => {
    (async () => {
      try {
        const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
        const provider = eth ? new BrowserProvider(eth) : new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const nftBase = new Contract(ADDR.NFT721, nft721Abi, provider);
        const nft = nftBase as unknown as Nft721Read;

        let fee = 0n;
        try { fee = await nft.mintFeeWei(); } catch {}
        setMintFee(fee ? ethers.formatEther(fee) : "0");

        try { setPaused(await nft.paused()); } catch { setPaused(null); }

        try {
          const v = await nft.vault();
          setVaultAddr(v);
          const code = await provider.getCode(v);
          setVaultIsContract(!!code && code !== "0x");
        } catch {
          setVaultAddr("");
          setVaultIsContract(null);
        }
      } catch { /* ignore */ }
    })();
  }, [hasWallet]);

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

    console.log("[pin-file] POST /api/nft/pin-file");
    const r = await fetch(`/api/nft/pin-file?ts=${Date.now()}`, {
      method: "POST",
      body: fd,
      cache: "no-store",
      redirect: "manual",
      credentials: "same-origin",
    });
    const j = (await r.json()) as PinFileResp;
    if (!r.ok || !j.ok || !j.uri) {
      console.error("[pin-file] failed", r.status, j);
      throw new Error(j.error || `pin-file failed: ${r.status}`);
    }
    return { imageUri: j.uri, gateway: j.gateway || "" };
  }

  async function pinJson(imageUri: string): Promise<string> {
    const meta = {
      name: name || "GAD NFT",
      description: description || "Minted via GAD Family Studio",
      image: imageUri,
      attributes: [] as Array<Record<string, unknown>>,
    };
    const body = JSON.stringify(meta);
    console.log("[pin-json] POST /api/nft/pin-json body=", body);

    const r = await fetch(`/api/nft/pin-json?ts=${Date.now()}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      cache: "no-store",
      redirect: "manual",
      credentials: "same-origin",
    });
    const j = (await r.json()) as PinJsonResp;
    if (!r.ok || !j.ok || !j.uri) {
      console.error("[pin-json] failed", r.status, j);
      throw new Error(j.error || `pin-json failed: ${r.status}`);
    }
    return j.uri;
  }

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
      const cBase = new Contract(ADDR.NFT721, nft721Abi, signer);
      const cRead = cBase as unknown as Nft721Read;
      const cWrite = cBase as unknown as Nft721Write;

      try { if (await cRead.paused()) throw new Error("Contract is paused"); } catch {}

      try {
        const v = await cRead.vault();
        const code = await signer.provider!.getCode(v);
        if (v === ethers.ZeroAddress || !code || code === "0x") {
          throw new Error("NFT vault misconfigured; ask admin to setVault()");
        }
      } catch {}

      const fee = await (async () => { try { return await cRead.mintFeeWei(); } catch { return ethers.parseEther("0.001"); } })();

      setStatus(`Sending mint tx (fee ${ethers.formatEther(fee)} BNB)…`);
      const to = await signer.getAddress();
      const tx = await cWrite.mintWithFee(to, tokenUri, { value: fee, gasLimit: 300000n });
      await tx.wait();

      setStatus("Minted ✅ (fee & gas paid by user)");
      alert("Minted ✅");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Mint failed";
      setStatus(msg);
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  // Внешний контейнер принудительно блокирует сабмит любых родительских <form>
  return (
    <form onSubmit={(e)=>e.preventDefault()} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border rounded p-3 space-y-3">
          <div className="font-semibold">1) Image</div>
          <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
          {preview && (
            <div className="rounded border overflow-hidden">
              <Image src={preview} alt="preview" width={512} height={512} className="w-full h-auto" unoptimized priority />
            </div>
          )}
          {imageIpfs && <div className="text-xs opacity-70 break-all">IPFS: {imageIpfs}</div>}
        </div>

        <div className="border rounded p-3 space-y-3">
          <div className="font-semibold">2) Metadata</div>
          <input className="border p-2 w-full rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <textarea className="border p-2 w-full rounded" placeholder="Description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="text-xs opacity-70 space-y-1">
            <div>NFT721: {ADDR.NFT721}</div>
            <div>Mint fee (contract): {mintFee || "—"} BNB</div>
            <div>Paused: {paused === null ? "—" : paused ? "yes" : "no"}</div>
            <div>Vault: {vaultAddr ? `${vaultAddr.slice(0, 10)}…${vaultAddr.slice(-8)}` : "—"}</div>
            <div>Vault is contract: {vaultIsContract === null ? "—" : vaultIsContract ? "yes" : "no"}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="border px-4 py-2 rounded hover:bg-black hover:text-white disabled:opacity-50"
          onClick={mint}
          disabled={busy || !file || !name.trim()}
        >
          Upload & Mint
        </button>
        {status && <div className="text-sm opacity-70 self-center">{status}</div>}
      </div>
    </form>
  );
}
