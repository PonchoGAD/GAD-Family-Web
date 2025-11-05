export const runtime = "edge";

export async function POST(req: Request) {
  const { slug } = (await req.json().catch(() => ({}))) as { slug?: string };
  if (!slug) {
    return new Response(JSON.stringify({ error: "Bad request" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ ok: true, slug, message: `Claim accepted for ${slug}. (stub)` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
