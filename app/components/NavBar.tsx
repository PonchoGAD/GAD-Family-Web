'use client';
import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="w-full border-b border-white/10 backdrop-blur-md bg-[#0b0f17]/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-2xl tracking-wide text-[#ffd166] hover:opacity-90">
          GAD
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-4">
          {/* Claim */}
          <Link
            href="/claim-airdrop"
            className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:bg-[#e6bf59] transition"
          >
            Claim
          </Link>

          {/* Airdrop */}
          <Link
            href="/airdrop"
            className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:bg-[#e6bf59] transition"
          >
            🚀 Airdrop
          </Link>

          {/* NFT */}
          <Link
            href="/nft"
            className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:bg-[#e6bf59] transition"
          >
            NFT
          </Link>

          {/* Wallet */}
          <Link
            href="/wallet"
            className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:bg-[#e6bf59] transition"
          >
            Wallet
          </Link>

          {/* Start Farming */}
          <Link
            href="/earn"
            className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:bg-[#e6bf59] transition"
          >
            Start Farming
          </Link>
        </div>
      </nav>
    </header>
  );
}
