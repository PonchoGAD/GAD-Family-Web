import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Toy, Game, ChapterMeta, ChapterSource } from "./types";

const ROOT = process.cwd();

function readJsonDir<T>(dirRel: string): T[] {
  const dir = path.join(ROOT, dirRel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as T);
}

export async function loadToys(): Promise<Toy[]> {
  return readJsonDir<Toy>("content/toys");
}

export async function loadToy(slug: string): Promise<Toy | null> {
  const all = readJsonDir<Toy>("content/toys");
  return all.find((t) => t.slug === slug) ?? null;
}

export async function loadChaptersMeta(): Promise<ChapterMeta[]> {
  const dir = path.join(ROOT, "content/book");
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  const metas = files.map((f) => {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const { data } = matter(raw);
    const meta: ChapterMeta = {
      slug: String(data.slug),
      title: String(data.title),
      teaser: data.teaser ? String(data.teaser) : undefined,
      order: typeof data.order === "number" ? data.order : 0,
      audio: data.audio ? String(data.audio) : undefined,
      ogImage: data.ogImage ? String(data.ogImage) : undefined,
    };
    return meta;
  });
  metas.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return metas;
}

export async function loadChapterSource(slug: string): Promise<ChapterSource | null> {
  const dir = path.join(ROOT, "content/book");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  for (const f of files) {
    const raw = fs.readFileSync(path.join(dir, f), "utf8");
    const parsed = matter(raw);
    if (String(parsed.data.slug) === slug) {
      const fm: ChapterMeta = {
        slug,
        title: String(parsed.data.title),
        teaser: parsed.data.teaser ? String(parsed.data.teaser) : undefined,
        order: typeof parsed.data.order === "number" ? parsed.data.order : 0,
        audio: parsed.data.audio ? String(parsed.data.audio) : undefined,
        ogImage: parsed.data.ogImage ? String(parsed.data.ogImage) : undefined,
      };
      return { frontmatter: fm, content: parsed.content };
    }
  }
  return null;
}

export async function loadGames(): Promise<Game[]> {
  return readJsonDir<Game>("content/games");
}

export async function loadGame(slug: string): Promise<Game | null> {
  const all = readJsonDir<Game>("content/games");
  return all.find((g) => g.slug === slug) ?? null;
}
