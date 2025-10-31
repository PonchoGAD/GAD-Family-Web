"use client";

import Link from "next/link";
import Image from "next/image";
import ConnectButton from "../common/ConnectButton";

export default function NftHeader() {
  return (
    <header className="w-full py-4 flex items-center justify-between">
      <Link href="/nft" className="flex items-center gap-3">
        {/* next/image вместо img — улучшает LCP и чинит eslint @next/next/no-img-element */}
        <Image
          src="/logo.png"
          alt="GAD"
          width={32}
          height={32}
          className="h-8 w-8"
          priority
        />
        <div className="text-xl font-bold">GAD Family — NFT</div>
      </Link>

      <nav className="flex items-center gap-3">
        <Link className="hover:underline" href="/nft">Market</Link>
        {/* Синхронизировано с нашей страницей генерации */}
        <Link className="hover:underline" href="/nft/ai-mint">AI Studio</Link>
      </nav>

      <ConnectButton />
    </header>
  );
}
