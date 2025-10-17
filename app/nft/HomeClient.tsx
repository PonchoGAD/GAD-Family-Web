"use client";
import React, { useEffect, useState } from "react";
import NftCard from "../components/nft/market/NftCard";
import { ADDR } from "../lib/nft/config";
import { getReadProvider } from "../lib/nft/eth";
import { marketplaceAbi } from "../lib/nft/abis/marketplace";
import { ethers } from "ethers";

export default function HomeClient() {
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const provider = await getReadProvider();
      const mkt = new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, provider);
      const logs = await mkt.queryFilter("Listed", 0, "latest");

      const items = logs.map((l) => ({
        nft: (l as any).args?.nft,
        tokenId: (l as any).args?.tokenId?.toString(),
        seller: (l as any).args?.seller,
        price: (l as any).args?.price?.toString() || "0",
        currency: (l as any).args?.currency === ethers.ZeroAddress ? "BNB" : "USDT",
      }));

      setListings(items.reverse().slice(0, 20));
    })();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-white">🌌 GAD Family NFT Marketplace</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {listings.map((l, i) => (
          <NftCard
            key={i}
            nft={l.nft}                // адрес контракта NFT
            seller={l.seller}          // адрес продавца
            tokenId={l.tokenId}        // ID токена
            price={l.price}            // цена в wei
            currency={l.currency}      // BNB или USDT
          />
        ))}
      </div>
    </main>
  );
}
