import { NextResponse } from "next/server";

type ClaimBody = { slug?: string };

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as ClaimBody;
  if (!body.slug) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  // TODO: wallet signature, cooldown, etc.
  return NextResponse.json({
    ok: true,
    slug: body.slug,
    message: `Claim accepted for ${body.slug}. (stub)`,
  });
}
