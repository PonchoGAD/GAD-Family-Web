import fs from "node:fs";
import path from "node:path";
import type { Toy, Game } from "./types";

const ROOT = process.cwd();

function readJsonDir<T>(dirRel: string): T[] {
  const dir = path.join(ROOT, dirRel);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as T);
}

export async function loadToysJson(): Promise<Toy[]> {
  return readJsonDir<Toy>("content/toys");
}
export async function loadToyJson(slug: string): Promise<Toy | null> {
  const all = await loadToysJson();
  return all.find(t => t.slug === slug) ?? null;
}
export async function loadGamesJson(): Promise<Game[]> {
  return readJsonDir<Game>("content/games");
}
export async function loadGameJson(slug: string): Promise<Game | null> {
  const all = await loadGamesJson();
  return all.find(g => g.slug === slug) ?? null;
}
