// pages/api/ai/generate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";
import FormData from "form-data";
import fetch from "node-fetch";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    // 🧠 Генерация изображения
    const image = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    const imageUrl = image.data[0].url;
    if (!imageUrl) throw new Error("Image URL missing");

    // 📤 Загрузка на Pinata
    const r = await fetch(imageUrl);
    const buffer = Buffer.from(await r.arrayBuffer());

    const form = new FormData();
    form.append("file", buffer, { filename: "ai-generated.png" });

    const upload = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.PINATA_JWT}` },
      body: form,
    });

    const data = await upload.json();
    const ipfsHash =
      (data as { IpfsHash?: string; Hash?: string }).IpfsHash ||
      (data as { IpfsHash?: string; Hash?: string }).Hash ||
      "";

    return res.status(200).json({
      success: true,
      imageUrl,
      ipfs: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    });
  } catch (err: unknown) {
    const e = err as { message?: string };
    // оставляем console.error — у тебя глобально ESLint на CI выключен, а локально правило можно не дизейблить
    console.error("AI generate error:", err);
    res.status(500).json({ error: e?.message ?? "Unknown error" });
  }
}
