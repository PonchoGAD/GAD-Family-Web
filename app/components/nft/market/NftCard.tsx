"use client";

import React from "react";
import { ethers } from "ethers";
import { getReadProvider, getSigner } from "../../../lib/nft/eth";
import { ADDR } from "../../../lib/nft/config";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { marketplaceAbi } from "../../../lib/nft/abis/marketplace";

type Props = {
  nft: string;
  tokenId: string;
  seller: string;
  currency: string; // address(0)=BNB else USDT
  price: string; // in wei
};

export default function NftCard({ nft, tokenId, seller, currency, price }: Props) {
  const [img, setImg] = React.useState<string | null>(null);
  const [name, setName] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  // --- Load tokenURI metadata ---
  React.useEffect(() => {
    (async () => {
      try {
        const provider = await getReadProvider();
        const nftc = new ethers.Contract(nft, nft721Abi, provider);
        const uri: string = await nftc.tokenURI(tokenId);

        let url = uri;
        if (uri.startsWith("ipfs://")) {
          url =
            (process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
              "https://gateway.pinata.cloud/ipfs/") +
            uri.replace("ipfs://", "");
        }

        const r = await fetch(url);
        const meta = await r.json().catch(() => ({}));
        if (meta?.image) {
          let im = meta.image as string;
          if (im.startsWith("ipfs://")) {
            im =
              (process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
                "https://gateway.pinata.cloud/ipfs/") +
              im.replace("ipfs://", "");
          }
          setImg(im);
        }
        setName(meta?.name || `NFT #${tokenId}`);
      } catch {
        setName(`#${tokenId}`);
      }
    })();
  }, [nft, tokenId]);

  // --- Buy NFT ---
  const buy = async () => {
    setLoading(true);
    setMsg("");
    try {
      if (!(window as any).ethereum) throw new Error("MetaMask not found");
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const mkt = new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);

      if (currency === ethers.ZeroAddress) {
        // BNB buy
        const tx = await mkt.buy(nft, tokenId, seller, { value: price });
        await tx.wait();
      } else {
        // USDT buy
        const usdt = new ethers.Contract(
          ADDR.USDT,
          ["function approve(address spender,uint256 value) external returns (bool)"],
          signer
        );
        await usdt.approve(ADDR.MARKETPLACE, price);
        const tx = await mkt.buy(nft, tokenId, seller);
        await tx.wait();
      }
      setMsg("✅ Purchase successful!");
    } catch (e: any) {
      setMsg(e?.message || "Buy failed");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: string) => {
    try {
      return ethers.formatEther(v);
    } catch {
      return v;
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex flex-col">
      <div className="aspect-square bg-black/30">
        {img ? (
          <img
            src={img}
            alt={name || ""}
            className="w-full h-full object-cover"
          />
        ) : null}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-sm text-white/60">
          {nft.slice(0, 6)}…{nft.slice(-4)} · #{tokenId}
        </div>
        <div className="text-lg font-semibold mt-1">{name || `#${tokenId}`}</div>
        <div className="text-sm text-white/60 mt-1">
          Seller: {seller.slice(0, 6)}…{seller.slice(-4)}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xl font-bold">
            {fmt(price)} {currency === ethers.ZeroAddress ? "BNB" : "USDT"}
          </div>
          <button
            onClick={buy}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-yellow-400 text-black font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Processing…" : "Buy"}
          </button>
        </div>

        {msg && <div className="mt-2 text-xs text-yellow-300">{msg}</div>}
      </div>
    </div>
  );
}
