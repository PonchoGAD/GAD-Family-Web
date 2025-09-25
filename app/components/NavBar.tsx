'use client';
import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="w-full border-b border-white/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        {/* Логотип/название */}
        <Link href="/" className="font-bold text-xl hover:opacity-80">
          GAD
        </Link>

        {/* Навигация */}
        <div className="flex items-center gap-6">
          <Link
            href="/claim-airdrop"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-x1 bg-[#ffd166] text-[#0b0f17] font-semibold hover: opacity-90"
            >
              Claim
            </Link>
          {/* Airdrop */}
          <Link
            href="/airdrop"
            className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90"
          >
            🚀 Airdrop
          </Link>

          {/* Earn */}
          <Link href="/earn" className="hover:opacity-80">
            Earn
          </Link>

          {/* Farming */}
          <Link
            href="/earn"
            className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90"
          >
            Start Farming
          </Link>
        </div>
      </nav>
    </header>
  );
}
