"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Game } from "@/lib/types";

type Props = { params: { slug: string } };

export default function GameDetailPage({ params }: Props) {
  const { slug } = params;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [claiming, setClaiming] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/games/${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Game | null) => setGame(data))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleClaim() {
    setClaiming(true);
    setMsg(null);
    try {
      const res = await fetch("/api/quest/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data: { message?: string } = await res.json();
      setMsg(data.message ?? (res.ok ? "Claim successful" : "Claim failed"));
    } catch {
      setMsg("Network error");
    } finally {
      setClaiming(false);
    }
  }

  if (loading) return <main className="mx-auto max-w-3xl px-6 py-12">Loading…</main>;
  if (!game) return <main className="mx-auto max-w-3xl px-6 py-12">Game not found</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link href="/games" className="opacity-80 hover:opacity-100">
        ← All games
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">{game.title}</h1>
      <p className="mt-2 opacity-80">
        Reward: {game.reward?.GAD ?? 0} GAD • Cooldown: {game.cooldownHours ?? 0}h
      </p>

      <div className="mt-6">
        <button
          onClick={handleClaim}
          disabled={claiming}
          className="rounded-xl border border-white/10 px-4 py-3 hover:bg-white/5 disabled:opacity-60"
        >
          {claiming ? "Processing…" : game.cta ?? "Claim reward"}
        </button>
        {msg && <p className="mt-3 text-sm opacity-90">{msg}</p>}
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 p-4">
        <p className="text-sm opacity-90">What’s next?</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-xl border border-white/10 px-3 py-1 hover:bg-white/5" href="/toys">
            Toy discounts
          </Link>
          <Link className="rounded-xl border border-white/10 px-3 py-1 hover:bg-white/5" href="/book">
            Related chapter
          </Link>
        </div>
      </div>
    </main>
  );
}
