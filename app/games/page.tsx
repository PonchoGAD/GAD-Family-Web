import Link from "next/link";
import type { Metadata } from "next";
import { loadGames } from "@/lib/content";
import type { Game } from "@/lib/types";

export const metadata: Metadata = {
  title: "GAD Family — Games",
  description: "Quests and mini-games. Earn GAD for activity.",
  openGraph: { title: "GAD Family — Games", url: "https://gad-family.com/games" },
};

export default async function GamesPage() {
  const games: Game[] = await loadGames();
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold">Games — Coming soon</h1>
        <p className="mt-2 opacity-80">Daily quests, quizzes, and seasons</p>
      </header>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g) => (
          <Link key={g.slug} href={`/games/${g.slug}`} className="rounded-2xl border border-white/10 p-4 hover:bg-white/5">
            <h3 className="text-lg font-semibold">{g.title}</h3>
            <p className="mt-2 text-sm opacity-80">
              Reward: {g.reward?.GAD ?? 0} GAD • CD: {g.cooldownHours ?? 0}h
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
