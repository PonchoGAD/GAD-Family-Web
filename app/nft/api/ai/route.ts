import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as unknown;
    const prompt = (body as { prompt?: unknown })?.prompt;
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "prompt required" }, { status: 400 });
    }

    const token = process.env.OPENAI_API_KEY!;
    if (!token) throw new Error("OPENAI_API_KEY is missing");

    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1", // или dall-e-3, если активен
        prompt,
        size: "1024x1024",
      }),
    });

    const j = (await r.json()) as unknown as {
      data?: Array<{ url?: string }>;
      error?: { message?: string };
    };
    if (!r.ok) throw new Error(j?.error?.message || "OpenAI failed");

    const imageUrl = j?.data?.[0]?.url;
    if (!imageUrl) throw new Error("no image URL returned");

    return NextResponse.json({ ok: true, imageUrl });
  } catch (e: unknown) {
    const msg = (e as { message?: string })?.message ?? "Unknown error";
    console.error("AI/POST error", e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
