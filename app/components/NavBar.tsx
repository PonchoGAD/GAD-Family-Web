'use client';
import Link from 'next/link';

export default function NavBar() {
  return (
    <header className="w-full border-b border-white/10">
      <nav className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href="/" className="font-bold text-xl hover:opacity-80">GAD</Link>
        <div className="flex items-center gap-6">
          <Link href="/earn" className="hover:opacity-80">Earn</Link>
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

<Link
  href="/airdrop"
  className="px-4 py-2 rounded-xl bg-[#ffd166] text-[#0b0f17] font-semibold hover:opacity-90"
>
  🚀 Airdrop
</Link>
