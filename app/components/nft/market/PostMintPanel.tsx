"use client";

import { useState } from "react";
import { ethers, type Eip1193Provider } from "ethers";
import { marketplaceAbi } from "../../../lib/nft/abis/marketplace";
import { ADDR } from "../../../lib/nft/config";

type EIP1193 = Eip1193Provider & {
  request(args: { method: string; params?: unknown[] | Record<string, unknown> }): Promise<unknown>;
};

function getEth(): EIP1193 | undefined {
  return (window as unknown as { ethereum?: EIP1193 }).ethereum;
}

export default function PostMintPanel({ nft, tokenId }: { nft: string; tokenId: string }) {
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState<"BNB" | "USDT">("BNB");
  const [busy, setBusy] = useState(false);

  async function listNFT() {
    try {
      const eth = getEth();
      if (!eth) return alert("MetaMask required");
      setBusy(true);

      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const mkt = new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);

      const value = ethers.parseEther(price || "0");
      const currencyAddr = currency === "BNB" ? ethers.ZeroAddress : ADDR.USDT;

      const tx = await mkt.list(nft, tokenId, currencyAddr, value);
      await tx.wait();
      alert(`NFT listed for ${price} ${currency}`);
    } catch (e: unknown) {
      const er = e as { message?: string };
      console.error(e);
      alert(er?.message ?? "Listing failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border border-gray-700 rounded-lg p-4 mt-6 bg-[#0E0E12]/80 text-white">
      <h3 className="text-lg font-semibold mb-2">💰 List your NFT on Marketplace</h3>

      <input
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price"
        className="border rounded px-3 py-2 w-full bg-transparent mb-2"
      />

      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value as "BNB" | "USDT")}
        className="border rounded px-3 py-2 w-full bg-transparent mb-3"
      >
        <option value="BNB">BNB</option>
        <option value="USDT">USDT</option>
      </select>

      <button
        onClick={listNFT}
        disabled={busy}
        className="px-5 py-3 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition w-full"
      >
        {busy ? "Listing..." : "List NFT"}
      </button>
    </div>
  );
}
