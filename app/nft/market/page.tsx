"use client";
import React from "react";
import Image from "next/image";
import { BrowserProvider, JsonRpcProvider, Contract, ethers, Log, LogDescription } from "ethers";
import { marketplaceAbi } from "../../lib/nft/abis/marketplace";
import { nft721Abi } from "../../lib/nft/abis/nft721";
import { ADDR } from "../../lib/nft/config";

type Item = {
  nft: string;
  tokenId: bigint;
  seller: string;
  currency: string; // 0x0 = BNB
  price: bigint;
  name?: string;
  image?: string;
};

type EthereumLike = { ethereum?: ethers.Eip1193Provider };

export default function MarketPage() {
  const [items, setItems] = React.useState<Item[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [usdt, setUsdt] = React.useState<string>("0x0000000000000000000000000000000000000000");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const rpcUrl = process.env.NEXT_PUBLIC_BSC_RPC || "https://bsc-dataseed.binance.org";
        const startBlockEnv = Number(process.env.NEXT_PUBLIC_MKT_START_BLOCK || 0);
        const provider = new JsonRpcProvider(rpcUrl);
        const latest = await provider.getBlockNumber();
        const fromBlock = startBlockEnv > 0 ? startBlockEnv : Math.max(1, latest - 200_000);

        const mkt = new Contract(ADDR.MARKETPLACE, marketplaceAbi, provider);
        const usdtAddr: string = await mkt.USDT();
        setUsdt(usdtAddr);

        const topicListed = ethers.id("Listed(address,uint256,address,address,uint256)");
        const topicDelisted = ethers.id("Delisted(address,uint256,address)");
        const topicBought = ethers.id("Bought(address,uint256,address,address,address,uint256,uint256,uint256)");

        const address = ADDR.MARKETPLACE;

        const [logsListed, logsDelisted, logsBought] = await Promise.all([
          provider.getLogs({ address, fromBlock, toBlock: "latest", topics: [topicListed] }),
          provider.getLogs({ address, fromBlock, toBlock: "latest", topics: [topicDelisted] }),
          provider.getLogs({ address, fromBlock, toBlock: "latest", topics: [topicBought] }),
        ]);

        const key = (nft: string, tokenId: bigint, seller: string) =>
          `${nft.toLowerCase()}|${tokenId.toString()}|${seller.toLowerCase()}`;

        const inactive = new Set<string>();
        for (const log of logsDelisted as Log[]) {
          const parsed: LogDescription = mkt.interface.parseLog({ topics: log.topics, data: log.data });
          inactive.add(key(parsed.args[0] as string, parsed.args[1] as bigint, parsed.args[2] as string));
        }
        for (const log of logsBought as Log[]) {
          const parsed: LogDescription = mkt.interface.parseLog({ topics: log.topics, data: log.data });
          const nft = parsed.args[0] as string;
          const tokenId = parsed.args[1] as bigint;
          const seller = parsed.args[3] as string;
          inactive.add(key(nft, tokenId, seller));
        }

        const raw: Item[] = [];
        for (const log of (logsListed as Log[]).reverse()) {
          const parsed: LogDescription = mkt.interface.parseLog({ topics: log.topics, data: log.data });
          const nft = parsed.args[0] as string;
          const tokenId = parsed.args[1] as bigint;
          const seller = parsed.args[2] as string;
          const currency = parsed.args[3] as string;
          const price = parsed.args[4] as bigint;

          const k = key(nft, tokenId, seller);
          if (inactive.has(k)) continue;
          if (
            raw.find(
              (r) =>
                r.nft.toLowerCase() === nft.toLowerCase() &&
                r.tokenId === tokenId &&
                r.seller.toLowerCase() === seller.toLowerCase(),
            )
          ) {
            continue;
          }
          raw.push({ nft, tokenId, seller, currency, price });
          if (raw.length >= 60) break;
        }

        await Promise.all(
          raw.map(async (it) => {
            try {
              const nft = new Contract(it.nft, nft721Abi, provider);
              const uri: string = await nft.tokenURI(it.tokenId);
              const http = uri.startsWith("ipfs://") ? uri.replace("ipfs://", "https://ipfs.io/ipfs/") : uri;
              const res = await fetch(http, { cache: "no-store" });
              const meta: unknown = await res.json().catch(() => null);
              if (meta && typeof meta === "object") {
                const m = meta as { name?: string; image?: string };
                it.name = m.name ?? `#${it.tokenId.toString()}`;
                it.image = m.image ? m.image.replace(/^ipfs:\/\//, "https://ipfs.io/ipfs/") : undefined;
              }
            } catch {
              // ignore metadata failures
            }
          }),
        );

        setItems(raw);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">🛒 GAD NFT Market</h1>
          <a href="/nft" className="text-sm text-white/60 hover:text-white">
            Back to NFTs
          </a>
        </div>

        {loading && <div className="mt-6 text-white/60">Loading listings…</div>}

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {items.map((it, i) => (
            <Card key={i} it={it} usdt={usdt} />
          ))}
        </div>

        {!loading && items.length === 0 && <div className="mt-10 text-white/50">No active listings yet.</div>}

        <div className="mt-8 text-xs text-white/40">
          Tip: если листите в USDT — укажите цену в точности под decimals USDT (часто 18 или 6).
        </div>
      </div>
    </main>
  );
}

function Card({ it, usdt }: { it: Item; usdt: string }) {
  const [busy, setBusy] = React.useState(false);

  const buy = async () => {
    try {
      setBusy(true);
      const eth = (window as unknown as EthereumLike).ethereum;
      if (!eth) throw new Error("No wallet");
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();
      const mkt = new Contract(ADDR.MARKETPLACE, marketplaceAbi, signer);

      if (it.currency.toLowerCase() === usdt.toLowerCase()) {
        const erc20 = new Contract(
          usdt,
          [
            {
              inputs: [
                { internalType: "address", name: "owner", type: "address" },
                { internalType: "address", name: "spender", type: "address" },
              ],
              name: "allowance",
              outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                { internalType: "address", name: "spender", type: "address" },
                { internalType: "uint256", name: "amount", type: "uint256" },
              ],
              name: "approve",
              outputs: [{ internalType: "bool", name: "", type: "bool" }],
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          signer,
        );
        const me = await signer.getAddress();
        const cur: bigint = await erc20.allowance(me, ADDR.MARKETPLACE);
        if (cur < it.price) {
          const txA = await erc20.approve(ADDR.MARKETPLACE, it.price);
          await txA.wait();
        }
      }

      const overrides = it.currency === ethers.ZeroAddress ? { value: it.price } : {};
      const tx = await mkt.buy(it.nft, it.tokenId, it.seller, overrides);
      const rc = await tx.wait();
      alert(`Purchased! Tx: ${rc?.hash?.slice(0, 10)}…`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Buy failed";
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  const isBNB = it.currency === ethers.ZeroAddress;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="relative aspect-square bg-black/20 overflow-hidden">
        {it.image ? (
          <Image
            src={it.image}
            alt={it.name || ""}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm p-4">
            {it.name || `#${it.tokenId.toString()}`}
          </div>
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="font-semibold">{it.name || `Token #${it.tokenId.toString()}`}</div>
        <div className="text-white/60 text-xs font-mono break-all">{it.nft}</div>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">
            {ethers.formatEther(it.price)} {isBNB ? "BNB" : "USDT*"}
          </div>
          <button
            onClick={buy}
            disabled={busy}
            className="px-3 py-2 rounded-lg bg-[#FFD166] text-[#0B0F17] text-sm font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {busy ? "Buying…" : "Buy"}
          </button>
        </div>
      </div>
    </div>
  );
}
