import { NextRequest, NextResponse } from "next/server";

type OpenAIImageResp = {
  data?: Array<{ url?: string }>;
  error?: { message?: string };
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { prompt?: unknown; size?: unknown };
    const prompt = typeof body.prompt === "string" ? body.prompt : undefined;
    const size =
      body.size === "512" || body.size === "768" || body.size === "1024"
        ? (body.size as "512" | "768" | "1024")
        : "1024";

    if (!prompt) {
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
        model: "gpt-image-1", // или "dall-e-3" если включён
        prompt,
        size: `${size}x${size}`,
      }),
    });

    const j = (await r.json()) as OpenAIImageResp;
    if (!r.ok) throw new Error(j?.error?.message || "OpenAI failed");

    const imageUrl = j?.data?.[0]?.url;
    if (!imageUrl) throw new Error("no image URL returned");

    return NextResponse.json({ ok: true, imageUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("AI/POST error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
