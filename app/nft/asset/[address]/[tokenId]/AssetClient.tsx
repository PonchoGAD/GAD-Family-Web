"use client";
import React from "react";
import BuyNowButton from "../../../../components/nft/market/BuyNowButton";
import ListingPanel from "../../../../components/nft/market/ListingPanel";
import { getReadProvider } from "../../../../lib/nft/eth";
import { getMarketplaceContract } from "../../../../lib/nft/contracts";
import { ethers } from "ethers";
import { ADDR } from "../../../../lib/nft/constants";

export default function AssetClient({ address, tokenId }:{ address:string; tokenId:string }) {
  const [listing, setListing] = React.useState<null | {currency:string; price:string}>(null);
  const [error, setError] = React.useState<string|null>(null);

  const load = React.useCallback(async ()=>{
    try {
      setError(null);
      const p = getReadProvider();
      const mkt = getMarketplaceContract(p);
      // простой call: вернёт struct/tuple (зависит от контракта)
      const l = await mkt.getListing?.(address, tokenId).catch(()=>null);
      if (l && l.active !== false) {
        setListing({
          currency: String(l.currency ?? ethers.ZeroAddress),
          price: String(l.price ?? "0"),
        });
      } else {
        setListing(null);
      }
    } catch (e:any) {
      setError(e?.message || "failed to load");
    }
  }, [address, tokenId]);

  React.useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-4">
      {error && <div className="text-red-400 text-sm">{error}</div>}

      {listing ? (
        <div className="rounded-2xl p-4 bg-white/5 border border-white/10">
          <div className="mb-3 text-sm opacity-70">Current listing</div>
          <div className="flex items-center justify-between gap-3">
            <div className="opacity-80">
              Price: {listing.price}{" "}
              {listing.currency.toLowerCase() === ADDR.USDT.toLowerCase() ? "USDT" : "BNB"}
            </div>
            <BuyNowButton
              nft={address}
              tokenId={tokenId}
              currency={listing.currency}
              price={listing.price}
            />
          </div>
        </div>
      ) : (
        <ListingPanel nft={address} tokenId={tokenId} />
      )}
    </div>
  );
}
