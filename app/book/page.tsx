import Link from "next/link";
import type { Metadata } from "next";
import { loadChaptersMeta } from "@/lib/content";
import type { ChapterMeta } from "@/lib/types";

export const metadata: Metadata = {
  title: "GAD Family — Book",
  description: "Chapter previews, audio snippets, and quests for reading.",
  openGraph: { title: "GAD Family — Book", url: "https://gad-family.com/book" },
};

export default async function BookPage() {
  const chapters: ChapterMeta[] = await loadChaptersMeta();
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Book — Coming soon</h1>
        <p className="mt-2 opacity-80">Chapters, previews, and audio</p>
      </header>
      <ul className="space-y-4">
        {chapters.map((ch) => (
          <li key={ch.slug} className="rounded-2xl border border-white/10 p-4 hover:bg-white/5">
            <Link href={`/book/${ch.slug}`} className="text-lg font-semibold underline">
              {ch.title}
            </Link>
            {ch.teaser && <p className="mt-1 text-sm opacity-80">{ch.teaser}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
