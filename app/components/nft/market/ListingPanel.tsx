"use client";
import React from "react";
import { ethers } from "ethers";
import { getBrowserProvider, getReadProvider } from "../../../lib/nft/eth";
import { getMarketplaceContract, getNftContract, getUsdtContract } from "../../../lib/nft/contracts";
import { ADDR } from "../../../lib/nft/constants";

export default function ListingPanel({ nft, tokenId }: { nft: string; tokenId: string }) {
  const [currency, setCurrency] = React.useState<"NATIVE" | "USDT">("USDT");
  const [price, setPrice] = React.useState<string>("0");
  const [busy, setBusy] = React.useState(false);

  const list = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const provider = await getBrowserProvider();
      const signer = await provider.getSigner();

      const nftCtr = getNftContract(signer, nft);
      const approved: boolean = await nftCtr.isApprovedForAll(
        await signer.getAddress(),
        ADDR.MARKETPLACE
      );
      if (!approved) {
        const tx0 = await nftCtr.setApprovalForAll(ADDR.MARKETPLACE, true);
        await tx0.wait();
      }

      let priceWei: bigint;
      let currAddr: string;
      if (currency === "USDT") {
        const erc20 = getUsdtContract(getReadProvider());
        const decimals: number = Number(await erc20.decimals().catch(() => 18)) || 18;
        priceWei = ethers.parseUnits(price || "0", decimals);
        currAddr = ADDR.USDT;
      } else {
        priceWei = ethers.parseUnits(price || "0", 18);
        currAddr = ethers.ZeroAddress;
      }

      const mkt = getMarketplaceContract(signer);
      const tx = await mkt.list(nft, tokenId, currAddr, priceWei);
      await tx.wait();
      alert("Listed ✅");
    } catch (e: any) {
      alert(e?.message || "Listing failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 bg-white/5 border border-white/10 space-y-3">
      <div className="text-sm opacity-70">List for sale</div>
      <div className="flex gap-2">
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value as any)}
          className="px-3 py-2 rounded-lg bg-black/20 border border-white/10"
        >
          <option value="USDT">USDT</option>
          <option value="NATIVE">BNB</option>
        </select>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10"
        />
        <button
          onClick={list}
          disabled={busy}
          className="px-4 py-2 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 disabled:opacity-50"
        >
          {busy ? "Listing..." : "List"}
        </button>
      </div>
    </div>
  );
}
