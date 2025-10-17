"use client";

import Link from "next/link";
import ConnectButton from "../common/ConnectButton";

export default function NftHeader() {
  return (
    <header className="w-full py-4 flex items-center justify-between">
      <Link href="/nft" className="flex items-center gap-3">
        <img src="/logo.png" alt="GAD" className="h-8 w-8" />
        <div className="text-xl font-bold">GAD Family — NFT</div>
      </Link>
      <nav className="flex items-center gap-3">
        <Link className="hover:underline" href="/nft">Market</Link>
        <Link className="hover:underline" href="/nft/studio">AI Studio</Link>
      </nav>
      <ConnectButton />
    </header>
  );
}
