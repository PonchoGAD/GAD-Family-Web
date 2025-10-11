"use client";
import React from "react";
import { ethers } from "ethers";
import { getBrowserProvider } from "../../../lib/nft/eth";
import { getMarketplaceContract, getUsdtContract } from "../../../lib/nft/contracts";
import { ADDR } from "../../../lib/nft/constants";

export default function BuyNowButton(props: {
  nft: string; tokenId: string; currency: string; price: string; className?: string
}) {
  const { nft, tokenId, currency, price, className } = props;
  const [busy, setBusy] = React.useState(false);
  const isUSDT = currency.toLowerCase() === ADDR.USDT.toLowerCase();

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();
      const mkt = getMarketplaceContract(signer);

      if (isUSDT) {
        const usdt = getUsdtContract(signer);
        const me = await signer.getAddress();
        const allowance: bigint = await usdt.allowance(me, ADDR.MARKETPLACE);
        const need = BigInt(price);
        if (allowance < need) {
          const txA = await usdt.approve(ADDR.MARKETPLACE, need);
          await txA.wait();
        }
        const tx = await mkt.buyWithUSDT(nft, tokenId);
        await tx.wait();
      } else {
        const tx = await mkt.buy(nft, tokenId, { value: BigInt(price) });
        await tx.wait();
      }
      alert("Purchased ✅");
    } catch (e: any) {
      alert(e?.message || "Buy failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={className || "px-4 py-2 rounded-lg bg-yellow-500/90 hover:bg-yellow-500 disabled:opacity-50"}
    >
      {busy ? "Processing..." : "Buy now"}
    </button>
  );
}
