import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== "string")
      return NextResponse.json({ error: "prompt required" }, { status: 400 });

    const token = process.env.OPENAI_API_KEY!;
    if (!token) throw new Error("OPENAI_API_KEY is missing");

    const r = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1", // или dall-e-3, если активен
        prompt,
        size: "1024x1024",
      }),
    });

    const j = await r.json();
    if (!r.ok) throw new Error(j.error?.message || "OpenAI failed");

    const imageUrl = j.data?.[0]?.url;
    if (!imageUrl) throw new Error("no image URL returned");

    return NextResponse.json({ ok: true, imageUrl });
  } catch (e: any) {
    console.error("AI/POST error", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
