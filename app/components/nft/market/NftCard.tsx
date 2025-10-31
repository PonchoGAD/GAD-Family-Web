"use client";

import React from "react";
import Image from "next/image";
import { ethers, type Eip1193Provider, Contract } from "ethers";
import { getReadProvider } from "../../../lib/nft/eth";
import { ADDR } from "../../../lib/nft/config";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { marketplaceAbi } from "../../../lib/nft/abis/marketplace";

type Props = {
  nft: string;
  tokenId: string;
  seller: string;
  /** address(0)=BNB, иначе адрес валюты (наша логика — USDT) */
  currency: string;
  /** Цена в wei (строка). */
  price: string;
};

type EIP1193 = Eip1193Provider & {
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
};

function getEth(): EIP1193 | undefined {
  return (window as unknown as { ethereum?: EIP1193 }).ethereum;
}

const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY?.replace(/\/$/, "") ||
  "https://gateway.pinata.cloud/ipfs";

function ipfsToHttp(u: string): string {
  if (!u) return u;
  if (u.startsWith("ipfs://")) {
    return `${IPFS_GATEWAY}/${u.replace("ipfs://", "")}`;
  }
  return u;
}

export default function NftCard({ nft, tokenId, seller, currency, price }: Props) {
  const [img, setImg] = React.useState<string | null>(null);
  const [name, setName] = React.useState<string>(`NFT #${tokenId}`);
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState("");

  // Загружаем метаданные tokenURI
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const provider = await getReadProvider();
        const nftc = new Contract(nft, nft721Abi, provider);
        const uri: string = await nftc.tokenURI(tokenId).catch(() => "");

        if (!uri) return;

        const url = ipfsToHttp(uri);
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) return;

        const meta = (await r.json()) as Record<string, unknown>;
        const mImage = typeof meta.image === "string" ? ipfsToHttp(meta.image) : null;
        const mName = typeof meta.name === "string" ? meta.name : `NFT #${tokenId}`;

        if (!mounted) return;
        if (mImage) setImg(mImage);
        setName(mName);
      } catch {
        // swallow
      }
    })();

    return () => {
      mounted = false;
    };
  }, [nft, tokenId]);

  const buy = async () => {
    setLoading(true);
    setMsg("");
    try {
      const eth = getEth();
      if (!eth) throw new Error("MetaMask not found");

      const provider = new ethers.BrowserProvider(eth);
      const signer = await provider.getSigner();
      const mkt = new Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);

      const priceWei = BigInt(price || "0");

      if (currency === ethers.ZeroAddress) {
        // покупка за BNB
        const tx = await mkt.buy(nft, tokenId, seller, { value: priceWei });
        await tx.wait();
      } else {
        // покупка за USDT: approve -> buy
        const erc20 = new Contract(
          ADDR.USDT,
          ["function approve(address spender,uint256 value) external returns (bool)"],
          signer
        );
        const ap = await erc20.approve(ADDR.MARKETPLACE, priceWei);
        await ap.wait();

        const tx = await mkt.buy(nft, tokenId, seller);
        await tx.wait();
      }
      setMsg("✅ Purchase successful!");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e !== null && "message" in e
          ? String((e as { message?: unknown }).message)
          : "Buy failed";
      setMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (v: string) => {
    try {
      return ethers.formatEther(BigInt(v || "0"));
    } catch {
      return v;
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex flex-col">
      <div className="relative aspect-square bg-black/30">
        {img ? (
          <Image
            src={img}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
            className="object-cover"
            priority={false}
          />
        ) : null}
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="text-sm text-white/60">
          {nft.slice(0, 6)}…{nft.slice(-4)} · #{tokenId}
        </div>
        <div className="text-lg font-semibold mt-1">{name}</div>
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
