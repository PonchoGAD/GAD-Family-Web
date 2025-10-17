"use client";

import React, { useEffect, useState } from "react";
import NftCard from "../../../components/nft/market/NftCard";
import { useParams } from "next/navigation";
import { getReadProvider } from "../../../lib/nft/eth";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { ethers } from "ethers";

export default function ProfileClient() {
  const { wallet } = useParams() as { wallet: string };
  const [owned, setOwned] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const provider = await getReadProvider();

        // ⚠️ Здесь должен быть контракт NFT — временно используем ADDR.NFT721
        const NFT_CONTRACT = process.env.NEXT_PUBLIC_NFT721_ADDRESS;
        if (!NFT_CONTRACT) {
          console.error("❌ Missing NEXT_PUBLIC_NFT721_ADDRESS in .env.local");
          return;
        }

        const contract = new ethers.Contract(NFT_CONTRACT, nft721Abi, provider);
        const logs = await contract.queryFilter("Transfer", 0, "latest");

        const nfts = logs
          .map((l) => (l as any).args)
          .filter((a) => a?.to?.toLowerCase() === wallet.toLowerCase())
          .map((a) => ({
            tokenId: a?.tokenId?.toString(),
            owner: a?.to,
          }));

        setOwned(nfts);
      } catch (err) {
        console.error("⚠️ Error loading NFTs:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [wallet]);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">Your NFTs</h1>

      {loading ? (
        <div className="text-gray-400 text-center mt-12">Loading...</div>
      ) : owned.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {owned.map((nft, i) => (
            <NftCard
              key={i}
              nft={process.env.NEXT_PUBLIC_NFT721_ADDRESS || ""}
              seller={nft.owner}
              tokenId={nft.tokenId}
              price={"0"}
              currency={ethers.ZeroAddress}
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-400 text-center mt-12">
          You don't own any NFTs yet.
        </div>
      )}
    </main>
  );
}
