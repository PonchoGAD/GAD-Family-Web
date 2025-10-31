"use client";

import { useState } from "react";
import { ethers } from "ethers";
import { marketplaceAbi } from "../../../lib/nft/abis/marketplace";
import { ADDR } from "../../../lib/nft/config";
import { getSigner } from "../../../lib/nft/eth";
import TransactionModal from "../common/TransactionModal";

export default function ListingPanel({ nft, tokenId }: { nft: string; tokenId: string }) {
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"BNB" | "USDT">("BNB");
  const [status, setStatus] = useState<"idle" | "signing" | "pending" | "success" | "error">("idle");
  const [txHash, setTxHash] = useState<string>();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string>();
  const [busy, setBusy] = useState(false);

  const listNFT = async () => {
    try {
      setBusy(true);
      setOpen(true);
      setStatus("signing");
      const signer = await getSigner();
      const mkt = new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);
      const priceWei = ethers.parseEther(price);
      const curAddr = currency === "BNB" ? ethers.ZeroAddress : ADDR.USDT;
      const tx = await mkt.list(nft, tokenId, curAddr, priceWei);
      setStatus("pending");
      setTxHash(tx.hash);
      await tx.wait();
      setStatus("success");
    } catch (e: unknown) {
      const er = e as { message?: string };
      setStatus("error");
      setErr(er?.message);
    } finally {
      setBusy(false);
    }
  };

  const cancelNFT = async () => {
    try {
      setBusy(true);
      setOpen(true);
      setStatus("signing");
      const signer = await getSigner();
      const mkt = new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);
      const tx = await mkt.cancel(nft, tokenId);
      setStatus("pending");
      setTxHash(tx.hash);
      await tx.wait();
      setStatus("success");
    } catch (e: unknown) {
      const er = e as { message?: string };
      setStatus("error");
      setErr(er?.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded p-3 bg-[#0E0E12]/80 text-white space-y-3">
      <div className="font-semibold text-lg">List NFT for Sale</div>

      <input
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="border rounded px-3 py-2 w-full bg-transparent"
      />

      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as "BNB" | "USDT")}
        className="border rounded px-3 py-2 w-full bg-transparent"
      >
        <option value="BNB">BNB</option>
        <option value="USDT">USDT</option>
      </select>

      <div className="flex gap-2">
        <button
          onClick={listNFT}
          disabled={busy}
          className="flex-1 border border-yellow-500 text-yellow-300 rounded px-3 py-2 hover:bg-yellow-500 hover:text-black transition"
        >
          {busy ? "Listing..." : "List"}
        </button>
        <button
          onClick={cancelNFT}
          disabled={busy}
          className="flex-1 border border-red-500 text-red-400 rounded px-3 py-2 hover:bg-red-500 hover:text-black transition"
        >
          {busy ? "Canceling..." : "Cancel"}
        </button>
      </div>

      <TransactionModal
        open={open}
        onCloseAction={() => setOpen(false)}
        status={status}
        txHash={txHash}
        message={status === "signing" ? "Sign the transaction in wallet" : undefined}
        errorText={err}
      />
    </div>
  );
}
