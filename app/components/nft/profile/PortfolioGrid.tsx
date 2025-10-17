"use client";

import { useEffect, useState } from "react";
import NftCard from "../market/NftCard";

type Nft = {
  image: string;
  name: string;
  tokenId: string;
  price: string;
  currency: "BNB" | "USDT";
  owner: string;
  address: string;
};

export default function PortfolioGrid({ address }: { address: string }) {
  const [nfts, setNfts] = useState<Nft[]>([]);

  useEffect(() => {
    if (!address) return;
    // demo-данные — позже подключим contract.ownerOf()
    setNfts([
      {
        image: "/images/hero-family.png",
        name: "Family Guardian",
        tokenId: "1",
        price: "0.12",
        currency: "BNB",
        owner: address,
        address: "0x000…nft",
      },
      {
        image: "/images/gad_coin_glow.png",
        name: "Aurora Key",
        tokenId: "2",
        price: "0.20",
        currency: "USDT",
        owner: address,
        address: "0x000…nft",
      },
    ]);
  }, [address]);

  return (
    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {nfts.map((n) => (
        <NftCard
  key={n.tokenId}
  nft={n.address}
  seller={n.owner}
  tokenId={n.tokenId}
  price={n.price}
  currency={n.currency}
/>

      ))}
    </div>
  );
}
