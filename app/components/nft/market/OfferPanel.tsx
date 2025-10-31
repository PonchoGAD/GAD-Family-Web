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
      const tx = await buyItem(
        nft,
        tokenId,
        seller,
        currency,
        ethers.parseEther(offerPrice)
      );
      setHash(tx?.hash ?? null);
      alert("✅ Offer submitted successfully!");
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Offer failed";
      // eslint-disable-next-line no-console
      console.error(e);
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 mt-4 bg-white/5 text-white">
      <div className="font-semibold mb-2">💰 Make an Offer</div>

      <input
        type="text"
        placeholder="Price in BNB"
        value={offerPrice}
        onChange={(e) => setOfferPrice(e.target.value.replace(",", "."))}
        className="border border-white/10 rounded-lg px-3 py-2 w-full bg-transparent text-sm outline-none focus:border-white/30 mb-3"
      />

      <button
        onClick={sendOffer}
        disabled={busy}
        className="w-full border border-blue-400 text-blue-300 rounded-lg px-3 py-2 font-semibold hover:bg-blue-500 hover:text-black transition disabled:opacity-50"
      >
        {busy
          ? "Sending..."
          : `Offer ${offerPrice} ${currency === "BNB" ? "BNB" : "USDT"}`}
      </button>

      <TxToast
        hash={hash}
        explorerBase={`${DEFAULT_CHAIN.explorer}/tx/`}
        onCloseAction={() => setHash(null)}
      />
    </div>
  );
}
