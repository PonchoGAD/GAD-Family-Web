"use client";

import React from "react";
import Link from "next/link";
import { ethers, Contract, type TopicFilter } from "ethers";
import { DEFAULT_CHAIN } from "../../../lib/nft/chains";
import { getReadProvider } from "../../../lib/nft/eth";

const ERC721_READ_ABI = [
  "event Transfer(address indexed from,address indexed to,uint256 indexed tokenId)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
  "https://ipfs.io";

const ipfsToHttp = (u: string) =>
  u?.startsWith("ipfs://")
    ? `${IPFS_GATEWAY}/ipfs/${u.replace("ipfs://", "")}`
    : u;

type Meta = { image?: string; name?: string; description?: string };
function isMeta(x: unknown): x is Meta {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  const okStr = (v: unknown) => typeof v === "string" || typeof v === "undefined";
  return okStr(o.image) && okStr(o.name) && okStr(o.description);
}

type Item = { tokenId: string; image?: string; name?: string; tokenURI?: string };

export default function CollectionClient({ addressProp }: { addressProp: string }) {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const provider = await getReadProvider();
      const nft = new Contract(addressProp, ERC721_READ_ABI, provider);

      const latest = await provider.getBlockNumber();
      const fromBlock = Math.max(latest - 50_000, 1);

      const zeroTopic =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
      const transferTopic = ethers.id("Transfer(address,address,uint256)");

      // делаем изменяемый массив topics, чтобы соответствовать TopicFilter (не readonly)
      const topics: TopicFilter = [transferTopic, zeroTopic]; // from=0x0

      const logs = await provider.getLogs({
        address: addressProp,
        fromBlock,
        toBlock: latest,
        topics,
      });

      const recent = logs.slice(-12).reverse();

      const out: Item[] = [];
      for (const lg of recent) {
        const tokenIdHex = lg.topics[3];
        const tokenId = BigInt(tokenIdHex).toString();

        let tokenURI = "";
        try {
          tokenURI = await nft.tokenURI(tokenId);
        } catch {}

        let meta: Meta | undefined;
        if (tokenURI) {
          try {
            const http = ipfsToHttp(tokenURI);
            const res = await fetch(http, { cache: "no-store" });
            if (res.ok) {
              const data: unknown = await res.json();
              if (isMeta(data)) meta = data;
            }
          } catch {}
        }

        out.push({
          tokenId,
          tokenURI,
          image: meta?.image ? ipfsToHttp(meta.image) : undefined,
          name: meta?.name,
        });
      }

      setItems(out);
    } finally {
      setLoading(false);
    }
  }, [addressProp]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">Collection</h1>
            <div className="font-mono text-white/60 text-xs mt-1">{addressProp}</div>
          </div>
          <Link
            href="/nft/ai-mint"
            className="px-4 py-2 rounded-lg bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90"
          >
            + AI Mint
          </Link>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          {loading ? (
            <div className="text-white/60 text-sm">Loading recent mints…</div>
          ) : items.length === 0 ? (
            <div className="text-white/60 text-sm">No items found in the last 50k blocks.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {items.map((it) => (
                <Link
                  key={it.tokenId}
                  href={`/nft/asset/${addressProp}/${it.tokenId}`}
                  className="group block rounded-xl overflow-hidden border border-white/10 bg-black/30 hover:border-white/30 transition"
                >
                  <div className="aspect-square bg-black/30 flex items-center justify-center">
                    {it.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={it.image} alt={it.name || `#${it.tokenId}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-white/50 text-xs">No preview</div>
                    )}
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-semibold truncate">{it.name || `#${it.tokenId}`}</div>
                    <div className="text-[11px] text-white/50">#{it.tokenId}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 text-xs text-white/50 text-center">
          Powered by GAD Family · {DEFAULT_CHAIN.name}
        </div>
      </div>
    </main>
  );
}
