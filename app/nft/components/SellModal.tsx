"use client";
import React from "react";
import { BrowserProvider, Contract, ethers } from "ethers";
import { marketplaceAbi } from "../../lib/nft/abis/marketplace";
import { nft721Abi } from "../../lib/nft/abis/nft721";
import { ADDR } from "../../lib/nft/config";

type Props = {
  nftAddr: string;
  tokenId: string | number | bigint;
  onListedAction?: () => void; // <- переименовано для Next.js 71007
};

type EthereumLike = { ethereum?: ethers.Eip1193Provider };

export default function SellModal({ nftAddr, tokenId, onListedAction }: Props) {
  const [open, setOpen] = React.useState(false);
  const [price, setPrice] = React.useState("0.1"); // BNB по умолчанию
  const [currency, setCurrency] = React.useState<"BNB" | "USDT">("BNB");
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState("");

  const list = async () => {
    try {
      setBusy(true);
      setStatus("Preparing wallet…");
      const eth = (window as unknown as EthereumLike).ethereum;
      if (!eth) throw new Error("No wallet");
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();
      const me = await signer.getAddress();

      // sanity: владелец?
      const nft = new Contract(nftAddr, nft721Abi, signer);
      const owner: string = await nft.ownerOf(tokenId);
      if (owner.toLowerCase() !== me.toLowerCase()) throw new Error("You are not the owner");

      // approve (NFT остаётся у продавца, маркет требует approve/forAll)
      setStatus("Approving marketplace…");
      const isForAll: boolean = await nft.isApprovedForAll(me, ADDR.MARKETPLACE);
      if (!isForAll) {
        const txA = await nft.setApprovalForAll(ADDR.MARKETPLACE, true);
        await txA.wait();
      }

      const mkt = new Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);
      const usdtAddr: string = await mkt.USDT();
      const currencyAddr = currency === "BNB" ? ethers.ZeroAddress : usdtAddr;

      setStatus("Creating listing…");
      const wei = ethers.parseEther(price); // для USDT — вводить уже в нужной decimals
      const tx = await mkt.list(nftAddr, BigInt(tokenId), currencyAddr, wei);
      await tx.wait();

      setStatus("Listed ✅");
      onListedAction?.();
      setOpen(false);
      alert("Listed!");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "List failed";
      setStatus(msg);
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/15"
      >
        Sell
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-[#0E0E12] border border-white/10 rounded-2xl p-5">
            <div className="text-lg font-semibold mb-3">Sell this NFT</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/60 mb-1">Price</label>
                <input
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.1"
                />
              </div>
              <div>
                <label className="block text-xs text-white/60 mb-1">Currency</label>
                <select
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 outline-none"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "BNB" | "USDT")}
                >
                  <option value="BNB">BNB</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>
            <button
              onClick={list}
              disabled={busy}
              className="mt-3 w-full px-4 py-2 rounded-xl bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "Listing…" : "Create Listing"}
            </button>
            {status && <div className="text-xs text-white/60 mt-2">{status}</div>}
            <button
              onClick={() => setOpen(false)}
              className="mt-2 text-xs text-white/50 hover:text-white/80"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
