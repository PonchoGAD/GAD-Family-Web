// app/nft/components/MarketGrid.tsx
"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ethers } from "ethers";
import { ADDR } from "../../lib/nft/config";
import { getNftContractRead } from "../../lib/nft/sdk";

type ApiListing = {
  nft: string;
  tokenId: string;
  seller: string;
  currency: "BNB" | "USDT";
  priceWei: string; // из API приходит строкой
};

type NftItem = {
  tokenId: string;
  image: string;
  name: string;
  priceLabel?: string;     // "0.15 BNB" | "10.0 USDT"
  currency?: "BNB" | "USDT";
};

const ipfsToHttp = (url: string) =>
  url?.startsWith("ipfs://")
    ? `https://ipfs.io/ipfs/${url.replace("ipfs://", "")}`
    : url;

export default function MarketGrid() {
  const [items, setItems] = React.useState<NftItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        // 1) Пробуем реальные листинги
        const r = await fetch("/api/nft/list", { cache: "no-store" });
        if (r.ok) {
          const j = (await r.json()) as { ok: boolean; listings?: ApiListing[] };
          if (j.ok && Array.isArray(j.listings) && j.listings.length) {
            const c = await getNftContractRead();

            const filled: NftItem[] = [];
            for (const ls of j.listings) {
              try {
                // тянем tokenURI каждого выставленного токена
                const uri = await c.tokenURI(ls.tokenId).catch(() => "");
                if (!uri) continue;

                const metaRes = await fetch(ipfsToHttp(uri), { cache: "no-store" });
                const meta = (metaRes.ok ? await metaRes.json().catch(() => null) : null) as
                  | { image?: string; name?: string }
                  | null;

                const image = ipfsToHttp((meta?.image as string) || "/placeholder.png");
                const name = String(meta?.name || `NFT #${ls.tokenId}`);
                const priceLabel = `${ethers.formatEther(ls.priceWei)} ${ls.currency}`;

                filled.push({
                  tokenId: ls.tokenId,
                  image,
                  name,
                  priceLabel,
                  currency: ls.currency,
                });
              } catch {
                // пропускаем битые записи
              }
            }

            if (filled.length) {
              setItems(filled);
              return;
            }
          }
        }

        // 2) Фолбэк — как было: первые 12 tokenId
        const c = await getNftContractRead();
        const demo: NftItem[] = [];
        for (let i = 0; i < 12; i++) {
          try {
            const uri = await c.tokenURI(i).catch(() => "");
            if (!uri) continue;

            const res = await fetch(ipfsToHttp(uri), { cache: "no-store" });
            const meta = (res.ok ? await res.json().catch(() => null) : null) as
              | { image?: string; name?: string }
              | null;
            if (!meta) continue;

            demo.push({
              tokenId: i.toString(),
              image: ipfsToHttp(meta.image || "/placeholder.png"),
              name: String(meta.name || `NFT #${i}`),
            });
          } catch {
            /* skip broken tokenId */
          }
        }
        setItems(demo);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  if (loading)
    return <div className="text-center py-10 text-white/70">Loading NFTs…</div>;

  if (!items.length)
    return <div className="text-center py-10 text-white/50">No NFTs found</div>;

  return (
    <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((nft) => (
        <Link
          key={nft.tokenId}
          href={`/nft/asset/${ADDR.NFT721}/${nft.tokenId}`}
          className="group relative border border-white/10 rounded-2xl overflow-hidden bg-white/5 hover:bg-white/10 transition"
        >
          <div className="relative aspect-square w-full">
            <Image
              src={nft.image}
              alt={nft.name}
              fill
              unoptimized
              sizes="(max-width: 768px) 50vw, 20vw"
              className="object-cover group-hover:scale-[1.03] transition-transform"
            />
          </div>
          <div className="p-3">
            <div className="font-semibold text-sm truncate">{nft.name}</div>
            <div className="text-xs text-white/50 mt-1">#{nft.tokenId}</div>
            {nft.priceLabel && (
              <div className="mt-2 text-sm font-semibold">
                {nft.priceLabel}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
