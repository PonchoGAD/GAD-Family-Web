"use client";
import Link from "next/link";
import ConnectButton from "../common/ConnectButton";

export default function NftHeader() {
  return (
    <header className="border-b">
      <div className="max-w-7xl mx-auto p-3 flex items-center justify-between">
        <Link href="/nft" className="font-bold">GAD NFT</Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/nft">Marketplace</Link>
          <Link href="/nft/ai-mint">AI Studio</Link>
          <div className="ml-2">
            <ConnectButton />
          </div>
        </nav>
      </div>
    </header>
  );
}
