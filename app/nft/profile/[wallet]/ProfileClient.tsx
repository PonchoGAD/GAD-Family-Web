"use client";

import React from "react";
import NftCard from "../../../components/nft/market/NftCard";
import { useParams } from "next/navigation";
import { getReadProvider } from "../../../lib/nft/eth";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { ADDR } from "../../../lib/nft/config";
import { ethers, Interface, type Log } from "ethers";

type OwnedItem = { tokenId: string; owner: string };

const TRANSFER_TOPIC = ethers.id("Transfer(address,address,uint256)");

export default function ProfileClient() {
  const { wallet } = useParams<{ wallet: string }>();
  const [owned, setOwned] = React.useState<OwnedItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const provider = await getReadProvider();
        const NFT_CONTRACT =
          process.env.NEXT_PUBLIC_NFT721_ADDRESS?.trim() || ADDR.NFT721;

        // читаем последние ~200k блоков (подстрой при необходимости)
        const latest = await provider.getBlockNumber();
        const fromBlock = Math.max(latest - 200_000, 1);

        // фильтр Transfer по адресу контракта (topics[0] = сигнатура события)
        const logs: Log[] = await provider.getLogs({
          address: NFT_CONTRACT,
          fromBlock,
          toBlock: latest,
          topics: [TRANSFER_TOPIC],
        });

        const iface = new Interface(nft721Abi);

        const items: OwnedItem[] = [];
        for (const lg of logs) {
          try {
            const parsed = iface.parseLog(lg);
            if (parsed?.name !== "Transfer") continue;

            // args: [from, to, tokenId]
            const to = String(parsed.args[1]);
            const tokenId = parsed.args[2] as bigint;

            if (to.toLowerCase() === wallet.toLowerCase()) {
              items.push({ tokenId: tokenId.toString(), owner: to });
            }
          } catch {
            // игнорируем логи, не относящиеся к ERC721 Transfer
          }
        }

        setOwned(items);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("⚠️ Error loading NFTs:", err);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [wallet]);

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your NFTs</h1>

        {loading ? (
          <div className="text-white/60 text-center mt-12">Loading…</div>
        ) : owned.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {owned.map((nft, i) => (
              <NftCard
                key={`${nft.tokenId}-${i}`}
                nft={process.env.NEXT_PUBLIC_NFT721_ADDRESS?.trim() || ADDR.NFT721}
                seller={nft.owner}
                tokenId={nft.tokenId}
                price={"0"}
                currency={ethers.ZeroAddress}
              />
            ))}
          </div>
        ) : (
          <div className="text-white/60 text-center mt-12">
            You don&apos;t own any NFTs yet.
          </div>
        )}
      </div>
    </main>
  );
}
