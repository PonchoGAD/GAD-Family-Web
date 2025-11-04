import { NextResponse } from "next/server";
import { loadGame } from "@/lib/content";
import type { Game } from "@/lib/types";

export async function GET(_: Request, ctx: { params: { slug: string } }) {
  const game: Game | null = await loadGame(ctx.params.slug);
  if (!game) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(game);
}
