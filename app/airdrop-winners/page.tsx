'use client';

export default function AirdropWinnersPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-2xl md:text-3xl font-extrabold">Airdrop Season 1 — Winners</h1>
      <p className="text-white/70 mt-2">
        The public winners list will appear here on <b>Sep 25, 12:00 UTC</b>.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
        <p className="text-white/80">
          We’ll publish a file (CSV/JSON) with anonymized handles or addresses and provide a
          mirror link (IPFS/GitHub). Bookmark this page and check again on launch time.
        </p>
      </div>
    </main>
  );
}
