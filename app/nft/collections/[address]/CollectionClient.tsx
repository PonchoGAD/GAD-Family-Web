"use client";
import React from "react";
import NFTCard from "../../../nft/components/NFTCard";

type Row = {
  txHash: string;
  tokenId: string | number;
  nft: string;
  currency?: string;
  price?: string;
  seller?: string;
};

export default function CollectionClient({ address }: { address: string }) {
  const [rows, setRows] = React.useState<Row[]>([]);
  const [cursor, setCursor] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = async (c?: number | null) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "100");
      qs.set("nft", address);
      if (c) qs.set("cursor", String(c));

      // как и было: обращаемся к твоему API-роуту
      const r = await fetch(`/nft/api/index?${qs.toString()}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "failed");

      setRows((prev) => [...prev, ...((j.items as Row[]) || [])]);
      setCursor(j.nextCursor ?? null);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // при смене адреса — обнуляем состояние и грузим заново
    setRows([]);
    setCursor(null);
    load(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        Collection {address.slice(0, 6)}…{address.slice(-4)}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {rows.map((r) => (
          <NFTCard
            key={`${r.txHash}-${r.tokenId}`}
            nft={r.nft}
            tokenId={String(r.tokenId)}
            currency={r.currency}
            price={r.price}
            seller={r.seller}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <button
          className="px-3 py-2 rounded border border-white/10 disabled:opacity-50"
          disabled={!cursor || loading}
          onClick={() => load(cursor)}
        >
          {loading ? "Loading…" : "Load more"}
        </button>
      </div>
    </div>
  );
}
