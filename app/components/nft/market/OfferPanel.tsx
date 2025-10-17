"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { buyItem } from "../../../lib/nft/sdk";
import TxToast from "../common/TxToast";
import { DEFAULT_CHAIN } from "../../../lib/nft/chains";

export default function OfferPanel({
  nft,
  tokenId,
  seller,
  priceWei,
  currency,
}: {
  nft: string;
  tokenId: string;
  seller: string;
  priceWei: bigint;
  currency: "BNB" | "USDT";
}) {
  const [offerPrice, setOfferPrice] = useState(ethers.formatEther(priceWei));
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  const sendOffer = async () => {
    try {
      setBusy(true);
      const tx = await buyItem(nft, tokenId, seller, currency, ethers.parseEther(offerPrice));
      setHash(tx?.hash);
      alert("Offer sent!");
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? "Offer failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded p-3 mt-4 bg-[#0E0E12]/80 text-white">
      <div className="font-semibold mb-2">Make an Offer</div>
      <input
        type="text"
        placeholder="Price"
        value={offerPrice}
        onChange={(e) => setOfferPrice(e.target.value)}
        className="border rounded px-3 py-2 w-full bg-transparent mb-2"
      />
      <button
        onClick={sendOffer}
        disabled={busy}
        className="border border-blue-500 text-blue-400 rounded px-3 py-2 hover:bg-blue-500 hover:text-black transition w-full"
      >
        {busy ? "Sending..." : `Offer ${offerPrice} ${currency}`}
      </button>
      <TxToast hash={hash} explorerBase={DEFAULT_CHAIN.explorer} onClose={() => setHash(null)} />
    </div>
  );
}
