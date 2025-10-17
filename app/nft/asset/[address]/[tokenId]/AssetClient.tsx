"use client";

import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";

import { marketplaceAbi } from "../../../../lib/nft/abis/marketplace";
import { nft721Abi } from "../../../../lib/nft/abis/nft721";
import { ADDR } from "../../../../lib/nft/config";
import { getReadProvider, getSigner } from "../../../../lib/nft/eth";

import CancelListingButton from "../../../../components/nft/market/CancelListingButton";
import ApproveForAllButton from "../../../../components/nft/market/ApproveForAllButton";
import ListingPanel from "../../../../components/nft/market/ListingPanel";

type Listing = {
  seller: string;
  currency: "BNB" | "USDT";
  priceWei: bigint;
  priceHuman: string;
  blockNumber: number;
} | null;

type Props = {
  addressProp: string;
  tokenIdProp: string;
};

const shorten = (a: string, l = 6, r = 4) =>
  a ? `${a.slice(0, l)}…${a.slice(-r)}` : "";

export default function AssetClient({ addressProp, tokenIdProp }: Props) {
  const nft = addressProp;
  const tokenId = tokenIdProp;
  const marketplace = ADDR.MARKETPLACE;
  const usdt = ADDR.USDT;

  const [owner, setOwner] = useState<string>("");
  const [listing, setListing] = useState<Listing>(null);
  const [me, setMe] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Получаем текущего пользователя (если MetaMask подключён) */
  useEffect(() => {
    (async () => {
      try {
        const signer = await getSigner();
        const addr = await signer.getAddress();
        setMe(addr);
      } catch {
        // Метамаск не подключён — пропускаем
      }
    })();
  }, []);

  /** Загружаем владельца и листинг NFT */
  useEffect(() => {
    (async () => {
      try {
        setError(null);
        const provider = await getReadProvider();

        const c721 = new ethers.Contract(nft, nft721Abi, provider);
        const o = await c721.ownerOf(tokenId);
        setOwner(o);

        const mkt = new ethers.Contract(marketplace, marketplaceAbi, provider);
        const current = await provider.getBlockNumber();
        const fromBlock = Math.max(0, current - 200_000);

        const ev = await mkt.queryFilter(
          mkt.filters.Listed(nft as any, BigInt(tokenId) as any),
          fromBlock,
          current
        );

        if (!ev.length) {
          setListing(null);
          return;
        }

        const last = ev.sort(
          (a, b) => (b.blockNumber ?? 0) - (a.blockNumber ?? 0)
        )[0];
        const a = (last as any)?.args ?? {};
        const isBNB = a.currency === ethers.ZeroAddress;
        const price: bigint = a.price;

        setListing({
          seller: a.seller as string,
          currency: isBNB ? "BNB" : "USDT",
          priceWei: price,
          priceHuman: ethers.formatEther(price),
          blockNumber: last.blockNumber ?? 0,
        });
      } catch (e: any) {
        console.error(e);
        setError(e?.message ?? "Failed to load asset data");
      }
    })();
  }, [nft, tokenId, marketplace]);

  /** Купить за BNB */
  const buyBNB = async () => {
    if (!listing || listing.currency !== "BNB") return alert("No BNB listing.");
    try {
      setBusy(true);
      const signer = await getSigner();
      const mkt = new ethers.Contract(marketplace, marketplaceAbi, signer);
      const tx = await mkt.buy(nft, tokenId, listing.seller, {
        value: listing.priceWei,
      });
      await tx.wait();
      alert("Bought with BNB!");
    } catch (e: any) {
      setError(e?.message ?? "Buy failed");
    } finally {
      setBusy(false);
    }
  };

  /** Купить за USDT */
  const buyUSDT = async () => {
    if (!listing || listing.currency !== "USDT")
      return alert("No USDT listing.");
    try {
      setBusy(true);
      const signer = await getSigner();
      const erc20 = new ethers.Contract(
        usdt,
        ["function approve(address spender,uint256 value) external returns (bool)"],
        signer
      );
      const mkt = new ethers.Contract(marketplace, marketplaceAbi, signer);
      const a = await erc20.approve(marketplace, listing.priceWei);
      await a.wait();
      const tx = await mkt.buy(nft, tokenId, listing.seller);
      await tx.wait();
      alert("Bought with USDT!");
    } catch (e: any) {
      setError(e?.message ?? "Buy failed");
    } finally {
      setBusy(false);
    }
  };

  const isSeller = useMemo(() => {
    if (!me || !listing?.seller) return false;
    return me.toLowerCase() === listing.seller.toLowerCase();
  }, [me, listing?.seller]);

  return (
    <main className="p-6 max-w-5xl mx-auto space-y-4 text-white">
      <h1 className="text-3xl font-bold">NFT Asset</h1>

      <div className="text-sm opacity-70 break-all">
        Collection: <b>{nft}</b> · Token #{tokenId}
      </div>

      <div className="border rounded p-4 space-y-2">
        <div className="text-sm">Owner</div>
        <div className="font-mono break-all">{owner || "—"}</div>
      </div>

      <div className="border rounded p-4 space-y-2">
        <div className="text-sm mb-1">Listing</div>

        {listing ? (
          <>
            <div>
              Seller:{" "}
              <span className="font-mono">{shorten(listing.seller)}</span>
            </div>
            <div>
              Price: <b>{listing.priceHuman}</b> {listing.currency}
            </div>

            <div className="flex gap-2 mt-3 flex-wrap">
              <button
                className="border px-4 py-2 rounded hover:bg-white/10"
                onClick={buyBNB}
                disabled={busy || listing.currency !== "BNB"}
              >
                Buy with BNB
              </button>
              <button
                className="border px-4 py-2 rounded hover:bg-white/10"
                onClick={buyUSDT}
                disabled={busy || listing.currency !== "USDT"}
              >
                Buy with USDT
              </button>

              {isSeller && (
                <CancelListingButton
                  nft={nft}
                  tokenId={tokenId}
                  onDone={() => setListing(null)}
                />
              )}
            </div>
          </>
        ) : (
          <div className="opacity-60">Not listed.</div>
        )}
      </div>

      <div className="mt-6 space-y-4">
        <ApproveForAllButton nft={nft} />
        <ListingPanel nft={nft} tokenId={tokenId} />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </main>
  );
}
