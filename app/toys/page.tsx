import Link from "next/link";
import type { Metadata } from "next";
import { loadToysJson } from "@/lib/content-json";
import type { Toy } from "@/lib/types";
export const dynamic = "force-static";
export const revalidate = false;

export const metadata: Metadata = {
  title: "GAD Family — Toys",
  description: "Eco-Glow Buddies and accessories. Preorders, NFT certificates, and AR.",
  openGraph: { title: "GAD Family — Toys", url: "https://gad-family.com/toys" },
};

export default async function ToysPage() {
  const toys: Toy[] = await loadToysJson();
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Toys — Coming soon</h1>
        <p className="mt-2 opacity-80">Eco-Glow Buddies, AR, NFT certificates</p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {toys.map((t) => (
          <Link key={t.slug} href={`/toys/${t.slug}`} className="group rounded-2xl border border-white/10 p-4 hover:bg-white/5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold group-hover:opacity-90">{t.title}</h3>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                NFT-verified
              </span>
            </div>
            <p className="mt-2 text-sm opacity-80">Status: {t.status} • Shipping: {t.shipEta}</p>
            <p className="mt-3 text-sm">
              Price: {t.price?.GAD?.toLocaleString()} GAD / {t.price?.BNB} BNB
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
