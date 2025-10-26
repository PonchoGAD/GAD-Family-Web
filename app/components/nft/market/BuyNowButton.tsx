"use client";

import { useState } from "react";
import { buyItem } from "../../../lib/nft/sdk";
import { ethers } from "ethers";
import { DEFAULT_CHAIN } from "../../../lib/nft/chains";
import TxToast from "../common/TxToast";

export default function BuyNowButton({
  nft,
  tokenId,
  seller,
  currency,
  priceWei,
}: {
  nft: string;
  tokenId: string;
  seller: string;
  currency: "BNB" | "USDT";
  priceWei: bigint;
}) {
  const [busy, setBusy] = useState(false);
  const [hash, setHash] = useState<string | null>(null);

  const buy = async () => {
    try {
      setBusy(true);
      const tx = await buyItem(nft, tokenId, seller, currency, priceWei);
      setHash(tx?.hash);
      alert("Purchase completed!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Buy failed";
      console.error(e);
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={buy}
        disabled={busy}
        className="border border-green-500 text-green-400 rounded px-3 py-2 hover:bg-green-500 hover:text-black transition w-full"
      >
        {busy ? "Processing..." : `Buy Now (${ethers.formatEther(priceWei)} ${currency})`}
      </button>

      <TxToast hash={hash} explorerBase={DEFAULT_CHAIN.explorer} onClose={() => setHash(null)} />
    </>
  );
}
