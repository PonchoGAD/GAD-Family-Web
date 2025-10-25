"use client";
import React, { useEffect, useState } from "react";
import NftCard from "../components/nft/market/NftCard";
import { ADDR } from "../lib/nft/config";
import { getReadProvider } from "../lib/nft/eth";
import { marketplaceAbi } from "../lib/nft/abis/marketplace";
import { ethers } from "ethers";

type ListedArgs = {
  nft?: string;
  tokenId?: bigint;
  seller?: string;
  price?: bigint;
  currency?: string;
};

type ListedLog = {
  args?: ListedArgs;
};

type ListingItem = {
  nft: string;
  tokenId: string;
  seller: string;
  price: string;
  currency: "BNB" | "USDT";
};

export default function HomeClient() {
  const [listings, setListings] = useState<ListingItem[]>([]);

  useEffect(() => {
    (async () => {
      const provider = await getReadProvider();
      // приведение к совместимому типу провайдера ethers v6
      const mkt = new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, provider as unknown as ethers.Provider);

      const logs = await mkt.queryFilter("Listed", 0, "latest") as unknown as ListedLog[];

      const items: ListingItem[] = logs.map((l) => {
        const a = l.args ?? {};
        const currency = a.currency === ethers.ZeroAddress ? "BNB" as const : "USDT" as const;
        return {
          nft: String(a.nft ?? ""),
          tokenId: (a.tokenId ?? 0n).toString(),
          seller: String(a.seller ?? ""),
          price: (a.price ?? 0n).toString(),
          currency,
        };
      });

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
            nft={l.nft}
            seller={l.seller}
            tokenId={l.tokenId}
            price={l.price}
            currency={l.currency}
          />
        ))}
      </div>
    </main>
  );
}
