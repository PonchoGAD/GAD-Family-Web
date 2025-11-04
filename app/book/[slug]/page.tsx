import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { loadChaptersMeta, loadChapterSource } from "@/lib/content-mdx";
import type { ChapterSource } from "@/lib/types";

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  const chapters = await loadChaptersMeta();
  return chapters.map((c) => ({ slug: c.slug }));
}

export const dynamic = "force-static";
export const revalidate = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ch = await loadChapterSource(params.slug);
  if (!ch) return {};
  const fm = ch.frontmatter;
  return {
    title: `${fm.title} — GAD Family`,
    description: fm.teaser ?? "A chapter of the GAD Family book",
    openGraph: { images: fm.ogImage ? [fm.ogImage] : [] },
  };
}

export default async function ChapterPage({ params }: Props) {
  const data: ChapterSource | null = await loadChapterSource(params.slug);
  if (!data) return notFound();
  const { frontmatter, content } = data; // content is HTML

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/book" className="opacity-80 hover:opacity-100">
        ← Table of contents
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{frontmatter.title}</h1>
      {frontmatter.teaser && <p className="mt-2 opacity-80">{frontmatter.teaser}</p>}
      {frontmatter.audio && <audio className="mt-6 w-full" controls src={frontmatter.audio} />}

      <article className="prose prose-invert mt-8 max-w-none">
        {/* content comes pre-rendered as HTML */}
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>

      <div className="mt-10 rounded-2xl border border-white/10 p-4">
        <p className="text-sm opacity-90">What’s next?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-xl border border-white/10 px-3 py-1 hover:bg-white/5" href="/games">
            Take a quest
          </Link>
          <Link className="rounded-xl border border-white/10 px-3 py-1 hover:bg-white/5" href="/toys">
            See souvenirs
          </Link>
        </div>
      </div>
    </main>
  );
}
