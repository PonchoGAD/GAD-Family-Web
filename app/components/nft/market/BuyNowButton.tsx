"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { buyItem } from "../../../lib/nft/sdk";
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
      setHash(tx?.hash ?? null);
      alert("✅ Purchase completed successfully!");
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Buy failed";
      // eslint-disable-next-line no-console
      console.error(e);
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4">
      <button
        onClick={buy}
        disabled={busy}
        className="w-full border border-green-500 text-green-400 rounded-lg px-3 py-2 font-semibold hover:bg-green-500 hover:text-black transition disabled:opacity-50"
      >
        {busy
          ? "Processing..."
          : `Buy Now (${ethers.formatEther(priceWei)} ${currency})`}
      </button>

      <TxToast
        hash={hash}
        explorerBase={`${DEFAULT_CHAIN.explorer}/tx/`}
        onCloseAction={() => setHash(null)}
      />
    </div>
  );
}
