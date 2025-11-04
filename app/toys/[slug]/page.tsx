import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadToyJson, loadToysJson } from "@/lib/content-json";
import type { Toy } from "@/lib/types";

export async function generateStaticParams() {
  const toys = await loadToysJson();
  return toys.map((t) => ({ slug: t.slug }));
}
export const dynamic = "force-static";
export const revalidate = false;

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const toy = await loadToyJson(params.slug);
  if (!toy) return {};
  return {
    title: `${toy.title} — GAD Family`,
    description: `Preorder and NFT for ${toy.title}`,
    openGraph: { images: toy.ogImage ? [toy.ogImage] : [] },
  };
}

export default async function ToyDetail({ params }: Props) {
  const toy: Toy | null = await loadToyJson(params.slug);
  if (!toy) return notFound();

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link href="/toys" className="opacity-80 hover:opacity-100">
        ← All toys
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{toy.title}</h1>
      <p className="mt-2 opacity-80">
        Status: {toy.status} • Shipping: {toy.shipEta}
      </p>

      {toy.images && toy.images[0] && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <Image src={toy.images[0]} alt={toy.title} width={1200} height={700} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button className="rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5">
          Buy with GAD
        </button>
        <button className="rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5">
          Buy with BNB
        </button>
        <button className="rounded-xl border border-emerald-500/20 px-4 py-3 hover:bg-emerald-500/10">
          Mint NFT certificate
        </button>
      </div>

      {toy.specs && toy.specs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Specifications</h3>
          <ul className="mt-2 list-disc pl-5 opacity-90">
            {toy.specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
