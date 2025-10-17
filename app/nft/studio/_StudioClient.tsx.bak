"use client";

import { useState } from "react";
import Image from "next/image";
import { ethers } from "ethers";
import { nft721Abi } from "../../lib/nft/abis/nft721";
import { getSigner } from "../../lib/nft/eth";
import { ADDR } from "../../lib/nft/constants";


export default function StudioClient() {
  const [recipient, setRecipient] = useState("");
  const [tokenURI, setTokenURI] = useState("ipfs://YOUR_CID/metadata.json");
  const [preview, setPreview] = useState<string>("");
  const [tx, setTx] = useState("");

  const onFile = async (f: File | null) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const mint = async () => {
    try {
      if (!recipient || !tokenURI) {
        alert("Recipient and tokenURI are required");
        return;
      }
      const signer = await getSigner();
      const c = new ethers.Contract(ADDR.NFT721, nft721Abi, signer);
      const fee = ethers.parseEther("0.001"); // 0.001 BNB
      const resp = await c.mintWithFee(recipient, tokenURI, { value: fee });
      const rec = await resp.wait();
      setTx(rec?.hash ?? resp.hash);
      alert("Minted!\nTx: " + (rec?.hash ?? resp.hash));
    } catch (e: any) {
      alert(e.message ?? "Mint failed");
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">AI Studio — Generate & Mint</h1>
      <p className="opacity-70 text-sm">
        Mint fee: <b>0.001 BNB</b> sent to LiquidityVault.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded p-3">
          <div className="text-sm font-semibold mb-2">Preview</div>
          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center overflow-hidden">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="opacity-50 text-sm">No image selected</div>
            )}
          </div>
          <label className="mt-3 block">
            <span className="text-sm">Upload (local preview)</span>
            <input
              className="mt-1 block"
              type="file"
              accept="image/*"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        <div className="border rounded p-3 space-y-3">
          <div>
            <div className="text-sm mb-1">Recipient (wallet address)</div>
            <input
              className="border p-2 rounded w-full"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
          </div>

          <div>
            <div className="text-sm mb-1">Token URI (IPFS metadata)</div>
            <input
              className="border p-2 rounded w-full"
              placeholder="ipfs://..."
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
            />
            <div className="text-xs opacity-60 mt-1">
              Use an IPFS metadata JSON with image field pointing to your image CID.
            </div>
          </div>

          <button
            className="border px-4 py-2 rounded hover:bg-black hover:text-white"
            onClick={mint}
          >
            Mint NFT (0.001 BNB)
          </button>

          {tx && <div className="text-xs break-all">Tx: {tx}</div>}
        </div>
      </div>
    </main>
  );
}
