"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { ADDR } from "../../lib/nft/config";
import { nft721Abi } from "../../lib/nft/abis/nft721";
import PostMintPanel from "../../components/nft/market/PostMintPanel";

export default function AIStudio() {
  const [prompt, setPrompt] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [ipfs, setIpfs] = useState<string | null>(null);
  const [minting, setMinting] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<string | null>(null);

  // 🧠 Генерация изображения через API
  async function generate() {
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.success) {
        setImage(data.imageUrl);
        setIpfs(data.ipfs);
      } else alert("AI Error: " + data.error);
    } catch (err: any) {
      console.error(err);
      alert("AI generation failed: " + err.message);
    }
  }

  // 💎 Минтинг NFT
  async function mint() {
    if (!ipfs) return alert("Generate image first");
    try {
      setMinting(true);
      if (!(window as any).ethereum) return alert("MetaMask required");

      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      const nft = new ethers.Contract(ADDR.NFT721, nft721Abi, signer);
      const mintFee = await nft.mintFeeWei();

      const tx = await nft.mintWithFee(addr, ipfs, { value: mintFee });
      const receipt = await tx.wait();

      setMintedTokenId(
        (receipt?.logs?.[0] as any)?.args?.tokenId?.toString() ?? null
      );

      alert("NFT Minted!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Mint failed");
    } finally {
      setMinting(false);
    }
  }

  return (
    <main className="p-8 max-w-5xl mx-auto text-white space-y-6">
      <h1 className="text-3xl font-bold">🎨 GAD AI Studio Mint</h1>
      <p className="opacity-70">
        Create unique AI-art NFTs using OpenAI DALL·E & Pinata IPFS.  
        Mint directly to blockchain with your wallet.
      </p>

      <textarea
        className="w-full p-3 rounded bg-[#0E0E12] border border-gray-700"
        rows={3}
        placeholder="Describe your NFT idea..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <div className="flex gap-4">
        <button
          onClick={generate}
          disabled={!prompt}
          className="px-5 py-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition"
        >
          Generate
        </button>

        {ipfs && (
          <button
            onClick={mint}
            disabled={minting}
            className="px-5 py-3 bg-green-500 text-black font-bold rounded hover:bg-green-400 transition"
          >
            {minting ? "Minting..." : "Mint NFT"}
          </button>
        )}
      </div>

      {image && (
        <div className="mt-6">
          <img
            src={image}
            alt="Generated"
            className="rounded-xl shadow-lg border border-[#2A2A1E]"
          />
          <p className="text-sm mt-2 opacity-70">
            IPFS:{" "}
            <a
              href={ipfs!}
              target="_blank"
              rel="noopener noreferrer"
              className="text-yellow-400 underline"
            >
              {ipfs}
            </a>
          </p>

          {mintedTokenId && (
            <div className="mt-4">
              <PostMintPanel nft={ADDR.NFT721} tokenId={mintedTokenId} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
