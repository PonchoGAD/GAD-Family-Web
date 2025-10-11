// app/nft/ai-mint/page.tsx
"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { getSignerAndContract } from "../../../lib/nft/ethers";
import { getNftConfig, makeSpec, generateImage, uploadToIpfsFromUrl, pinJson } from "../../../lib/nft/api";
import { ADDR } from "../../../lib/nft/constants";
import { nft721Abi } from "../../../lib/nft/abis/nft721";

export default function AiMintPage() {
  const [prompt, setPrompt] = useState("golden coin glowing softly");
  const [status, setStatus] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [metadataCid, setMetadataCid] = useState<string>("");

  async function doGenerate() {
    try {
      setStatus("Loading config...");
      const cfg = await getNftConfig(); // не обяз., но полезно показать пользователю fee/chain

      setStatus(`Generating spec (fee: ${cfg.mintFeeWei} wei)...`);
      const spec = await makeSpec(prompt);

      setStatus("Generating image...");
      const gen = await generateImage(spec.prompt, spec.style, spec.size);
      const url = gen.url as string | undefined;
      if (!url) throw new Error("No image URL from API");
      setPreviewUrl(url);

      setStatus("Uploading image to IPFS...");
      const up = await uploadToIpfsFromUrl(url, "nft.png", "image/png");

      const metadata = {
        name: "GAD NFT",
        description: spec.prompt,
        image: up.uri, // ipfs://...
        attributes: [
          { trait_type: "Style", value: spec.style },
          { trait_type: "Background", value: spec.background || "transparent" }
        ]
      };

      setStatus("Pin metadata.json...");
      const pinned = await pinJson(metadata, "GAD NFT metadata");
      setMetadataCid(pinned.cid);
      setStatus("Ready to mint!");
    } catch (e: any) {
      setStatus(`Error: ${e?.message || e}`);
    }
  }

  async function doMint() {
    try {
      if (!metadataCid) throw new Error("No metadata CID");
      setStatus("Connecting wallet...");
      const { signer, contract } = await getSignerAndContract(ADDR.NFT721, nft721Abi);
      const to = await signer.getAddress();

      setStatus("Reading mintFeeWei...");
      const fee: bigint = await contract.mintFeeWei();

      setStatus("Sending tx...");
      const uri = `ipfs://${metadataCid}`;
      const tx = await contract.mintWithFee(to, uri, { value: fee });
      const receipt = await tx.wait();
      setStatus(`Minted! Tx: ${receipt.hash}`);
    } catch (e: any) {
      setStatus(`Mint error: ${e?.message || e}`);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "32px auto", padding: 16, fontFamily: "Inter, system-ui" }}>
      <h1>AI Mint — GAD NFT</h1>

      <label style={{ display: "block", marginTop: 12, fontWeight: 600 }}>Prompt</label>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={3}
        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
      />

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <button onClick={doGenerate} style={{ padding: "10px 16px", borderRadius: 8, background: "#111827", color: "#fff" }}>
          1) Generate & Pin
        </button>
        <button onClick={doMint} disabled={!metadataCid} style={{ padding: "10px 16px", borderRadius: 8, background: "#2563eb", color: "#fff" }}>
          2) Mint (user pays)
        </button>
      </div>

      {status && <p style={{ marginTop: 10, color: "#374151" }}>{status}</p>}

      {previewUrl && (
        <div style={{ marginTop: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={previewUrl} alt="preview" style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid #eee" }} />
        </div>
      )}
    </main>
  );
}
