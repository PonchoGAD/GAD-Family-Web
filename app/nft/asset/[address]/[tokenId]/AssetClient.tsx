"use client";

import React from "react";
import { ethers, Contract } from "ethers";
import { DEFAULT_CHAIN } from "../../../../lib/nft/chains";
import { getReadProvider } from "../../../../lib/nft/eth";
import { ADDR } from "../../../../lib/nft/config";
import { listItem, cancelListing, buyItem, ZERO_ADDRESS } from "../../../../lib/nft/sdk";
import TxToast from "../../../../components/nft/common/TxToast";

// --- минимальные ABI ---
const ERC721_READ_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
];

const MARKET_READ_ABI = [
  "function listings(address nft, uint256 tokenId) view returns (address seller,address currency,uint256 priceWei,bool active)",
];

// IPFS → https
const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_PINATA_GATEWAY ||
  process.env.NEXT_PUBLIC_IPFS_GATEWAY ||
  "https://ipfs.io";

const ipfsToHttp = (u: string) =>
  u?.startsWith("ipfs://")
    ? `${IPFS_GATEWAY}/ipfs/${u.replace("ipfs://", "")}`
    : u;

type Listing = {
  seller: string;
  currency: string;
  priceWei: bigint;
  active: boolean;
} | null;

type Meta = {
  image?: string;
  name?: string;
  description?: string;
  attributes?: Array<{ trait_type?: string; value?: string }>;
};

function isMeta(x: unknown): x is Meta {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  const okStr = (v: unknown) => typeof v === "string" || typeof v === "undefined";
  const okAttrs =
    o.attributes === undefined ||
    (Array.isArray(o.attributes) &&
      o.attributes.every((a) => {
        if (typeof a !== "object" || a === null) return false;
        const aa = a as Record<string, unknown>;
        return okStr(aa.trait_type) && okStr(aa.value);
      }));
  return okStr(o.image) && okStr(o.name) && okStr(o.description) && okAttrs;
}

type EIP1193 = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
};

const getEth = (): EIP1193 | undefined =>
  (typeof window !== "undefined"
    ? (window as unknown as { ethereum?: EIP1193 }).ethereum
    : undefined);

type Props = {
  addressProp: string;
  tokenIdProp: string;
};

export default function AssetClient({ addressProp, tokenIdProp }: Props) {
  const [loading, setLoading] = React.useState(true);

  const [nftName, setNftName] = React.useState<string>("");
  const [nftSymbol, setNftSymbol] = React.useState<string>("");
  const [owner, setOwner] = React.useState<string>("");
  const [tokenURI, setTokenURI] = React.useState<string>("");
  const [meta, setMeta] = React.useState<Meta | null>(null);

  const [listing, setListing] = React.useState<Listing>(null);
  const [account, setAccount] = React.useState<string>("");

  // UI: листинг
  const [price, setPrice] = React.useState<string>("");
  const [currency, setCurrency] = React.useState<"BNB" | "USDT">("BNB");

  // tx toast
  const [txHash, setTxHash] = React.useState<string | null>(null);
  const closeToast = () => setTxHash(null);

  // пассивное чтение адреса кошелька
  React.useEffect(() => {
    const eth = getEth();
    if (!eth) return;

    const setFromAccounts = (accs: unknown) => {
      if (Array.isArray(accs) && typeof accs[0] === "string") {
        setAccount(accs[0]);
      } else {
        setAccount("");
      }
    };

    eth.request({ method: "eth_accounts" })
      .then(setFromAccounts)
      .catch(() => {});

    const accChanged = (accs: unknown) => setFromAccounts(accs);
    eth.on?.("accountsChanged", accChanged);
    return () => eth.removeListener?.("accountsChanged", accChanged);
  }, []);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    try {
      const provider = await getReadProvider();
      const nft = new Contract(addressProp, ERC721_READ_ABI, provider);

      const [nm, sm, own, uri] = await Promise.all([
        nft.name().catch(() => ""),
        nft.symbol().catch(() => ""),
        nft.ownerOf(tokenIdProp).catch(() => ethers.ZeroAddress),
        nft.tokenURI(tokenIdProp).catch(() => ""),
      ]);

      setNftName(nm);
      setNftSymbol(sm);
      setOwner(own);
      setTokenURI(uri);

      // metadata
      let m: Meta | null = null;
      if (uri) {
        const http = ipfsToHttp(uri);
        try {
          const res = await fetch(http, { cache: "no-store" });
          if (res.ok) {
            const data: unknown = await res.json();
            if (isMeta(data)) m = data;
          }
        } catch {
          /* ignore */
        }
      }
      setMeta(m);

      // listing (best-effort)
      try {
        const mkt = new Contract(ADDR.MARKETPLACE, MARKET_READ_ABI, provider);
        const ls = await mkt.listings(addressProp, tokenIdProp);
        const parsed: Listing = {
          seller: ls.seller,
          currency: ls.currency,
          priceWei: ls.priceWei,
          active: ls.active,
        };
        setListing(parsed);
      } catch {
        setListing(null);
      }
    } finally {
      setLoading(false);
    }
  }, [addressProp, tokenIdProp]);

  React.useEffect(() => {
    void refresh();
  }, [refresh]);

  const isOwner =
    account !== "" &&
    owner !== "" &&
    account.toLowerCase() === owner.toLowerCase();

  // — helpers для ошибок —
  const toMessage = (e: unknown) =>
    e instanceof Error ? e.message : "Operation failed";

  // --- actions ---
  const doList = async () => {
    try {
      if (!price) return alert("Enter price");
      const receipt = await listItem(addressProp, tokenIdProp, currency, price);
      const h =
        (receipt as { hash?: string })?.hash ??
        (receipt as { transactionHash?: string })?.transactionHash ??
        "";
      setTxHash(h || null);
      await refresh();
    } catch (e: unknown) {
      alert(toMessage(e));
    }
  };

  const doCancel = async () => {
    try {
      const receipt = await cancelListing(addressProp, tokenIdProp);
      const h =
        (receipt as { hash?: string })?.hash ??
        (receipt as { transactionHash?: string })?.transactionHash ??
        "";
      setTxHash(h || null);
      await refresh();
    } catch (e: unknown) {
      alert(toMessage(e));
    }
  };

  const doBuy = async () => {
    try {
      if (!listing || !listing.active) return alert("No active listing");
      const curr = listing.currency === ZERO_ADDRESS ? "BNB" : "USDT";
      const receipt = await buyItem(
        addressProp,
        tokenIdProp,
        listing.seller,
        curr,
        listing.priceWei
      );
      const h =
        (receipt as { hash?: string })?.hash ??
        (receipt as { transactionHash?: string })?.transactionHash ??
        "";
      setTxHash(h || null);
      await refresh();
    } catch (e: unknown) {
      alert(toMessage(e));
    }
  };

  const imgUrl = meta?.image ? ipfsToHttp(meta.image) : "";

  return (
    <section className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold">
            {nftName || "NFT"}{" "}
            <span className="text-white/50">{nftSymbol ? `(${nftSymbol})` : ""}</span>
          </h1>
          <div className="text-white/60 text-sm mt-1 font-mono">
            {addressProp} · #{tokenIdProp}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-white/50">Network</div>
          <div className="text-sm">{DEFAULT_CHAIN.name}</div>
        </div>
      </div>

      {/* Main */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image */}
        <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden aspect-square flex items-center justify-center">
          {imgUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imgUrl}
              alt={meta?.name || `#${tokenIdProp}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white/50 text-sm">No preview</div>
          )}
        </div>

        {/* Info + Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="space-y-2">
            <div className="text-sm text-white/60">Owner</div>
            <div className="font-mono">{owner || "—"}</div>
          </div>

          {meta?.description && (
            <div className="mt-4">
              <div className="text-sm text-white/60 mb-1">Description</div>
              <div className="whitespace-pre-wrap">{meta.description}</div>
            </div>
          )}

          {meta?.attributes?.length ? (
            <div className="mt-4">
              <div className="text-sm text-white/60 mb-2">Attributes</div>
              <div className="flex flex-wrap gap-2">
                {meta.attributes.map((a, i) => (
                  <div
                    key={`${a.trait_type ?? "attr"}-${i}`}
                    className="px-3 py-1 rounded-xl bg-black/30 border border-white/10 text-sm"
                  >
                    {a.trait_type ? `${a.trait_type}: ` : ""}
                    {a.value ?? "—"}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Listing / Buy */}
          <div className="mt-6 border-t border-white/10 pt-4">
            {isOwner ? (
              <div>
                <div className="text-sm font-semibold">List for sale</div>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <select
                    className="bg-black/30 border border-white/10 rounded-lg px-2 py-2 text-sm"
                    value={currency}
                    onChange={(e) =>
                      setCurrency(e.target.value as "BNB" | "USDT")
                    }
                  >
                    <option value="BNB">BNB</option>
                    <option value="USDT">USDT</option>
                  </select>
                  <input
                    className="col-span-2 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none"
                    placeholder="Price (e.g. 0.15)"
                    value={price}
                    onChange={(e) => setPrice(e.target.value.replace(",", "."))}
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={doList}
                    className="px-4 py-2 rounded-xl bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90"
                  >
                    List
                  </button>
                  {listing?.active ? (
                    <button
                      onClick={doCancel}
                      className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40"
                    >
                      Cancel listing
                    </button>
                  ) : null}
                </div>

                {listing?.active && (
                  <div className="mt-3 text-xs text-white/60">
                    Active listing:{" "}
                    {listing.currency === ZERO_ADDRESS ? "BNB" : "USDT"} ·{" "}
                    {ethers.formatEther(listing.priceWei)}{" "}
                    {listing.currency === ZERO_ADDRESS ? "BNB" : "USDT"}
                  </div>
                )}
              </div>
            ) : listing?.active ? (
              <div>
                <div className="text-sm text-white/60">Price</div>
                <div className="text-lg font-bold">
                  {ethers.formatEther(listing.priceWei)}{" "}
                  {listing.currency === ZERO_ADDRESS ? "BNB" : "USDT"}
                </div>
                <button
                  onClick={doBuy}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90"
                >
                  Buy now
                </button>
              </div>
            ) : (
              <div className="text-white/60">Not listed for sale.</div>
            )}
          </div>

          <div className="mt-4 text-xs text-white/50">
            Token URI:{" "}
            {tokenURI ? (
              <a
                href={ipfsToHttp(tokenURI)}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                open
              </a>
            ) : (
              "—"
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="mt-6 text-white/60 text-sm">Loading on-chain data…</div>
      )}

      <TxToast
        hash={txHash || ""}
        explorerBase={`${DEFAULT_CHAIN.explorer}/tx`}
        onCloseAction={closeToast}
      />
    </section>
  );
}
