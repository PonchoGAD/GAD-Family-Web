"use client";
import React from "react";
import NFTCard from "../../../nft/components/NFTCard";

export default function ProfileClient({ wallet }:{ wallet:string }) {
  const [rows, setRows] = React.useState<any[]>([]);
  const [cursor, setCursor] = React.useState<number|null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = async (c?:number|null) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("limit", "100");
      qs.set("seller", wallet);
      if (c) qs.set("cursor", String(c));
      const r = await fetch(`/nft/api/index?${qs.toString()}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.error || "failed");
      setRows(prev => [...prev, ...(j.items||[])]);
      setCursor(j.nextCursor);
    } finally { setLoading(false); }
  };

  React.useEffect(()=>{ load(null); }, [wallet]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Listings by {wallet.slice(0,6)}…{wallet.slice(-4)}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {rows.map((r:any)=>(
          <NFTCard key={`${r.txHash}-${r.tokenId}`} nft={r.nft} tokenId={r.tokenId}
                   currency={r.currency} price={r.price} seller={r.seller}/>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 rounded border border-white/10"
                disabled={!cursor || loading}
                onClick={()=>load(cursor)}>Load more</button>
      </div>
    </div>
  );
}
