"use client";

import React from "react";
import AiMintClient from "./AiMintClient";
import MintDialog from "../../components/nft/studio/MintDialog";

// ⚙️ Если у тебя будет API-роут, достаточно прописать NEXT_PUBLIC_AI_ENDPOINT в .env
const AI_ENDPOINT =
  process.env.NEXT_PUBLIC_AI_ENDPOINT?.trim() || "/api/ai/generate";

type GenSize = "512" | "768" | "1024";

export default function Page() {
  const [tab, setTab] = React.useState<"generate" | "upload">("generate");

  // prompt + параметры генерации
  const [prompt, setPrompt] = React.useState("a futuristic golden coin glowing in the dark tech style");
  const [size, setSize] = React.useState<GenSize>("512");
  const [seed, setSeed] = React.useState<string>(""); // optional
  const [generating, setGenerating] = React.useState(false);

  // текущая картинка и история превью (до 6)
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);
  const [gallery, setGallery] = React.useState<string[]>([]);

  // статус минта (покажет тосты внутри MintDialog)
  const [mintedToken, setMintedToken] = React.useState<string | null>(null);

  const pushToGallery = (url: string) => {
    setGallery((prev) => {
      const next = [url, ...prev];
      return next.slice(0, 6); // максимум 6 превью
    });
  };

  // 🔮 генерация через API, если он есть; иначе fallback—локальный mock через canvas
  const generate = async () => {
    try {
      setGenerating(true);

      // попытка пойти в реальный endpoint
      const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, seed: seed || undefined }),
      });

if (res.ok) {
  // ожидаем любой из вариантов: {image: "data:image/png;base64,..." } или {url:"..."}
  const json: Record<string, unknown> = await res.json().catch(() => ({}));
  const img =
    typeof json.image === "string"
      ? json.image
      : typeof json.url === "string"
      ? json.url
      : typeof json.dataUrl === "string"
      ? json.dataUrl
      : typeof json.data === "string"
      ? json.data
      : undefined;

  if (img) {
    setSelectedImage(img);
    pushToGallery(img);
    return;
  }
}

      // fallback: локально нарисуем плейсхолдер, чтобы UX был завершённым
      const dataUrl = await drawPlaceholder(prompt, size);
      setSelectedImage(dataUrl);
      pushToGallery(dataUrl);
    } catch {
      const dataUrl = await drawPlaceholder(prompt, size);
      setSelectedImage(dataUrl);
      pushToGallery(dataUrl);
    } finally {
      setGenerating(false);
    }
  };

  // 📤 загрузка своей картинки (png/jpg)
  const onUploadFile = async (file: File) => {
    if (!file) return;
    const ok = /image\/(png|jpeg|jpg|webp)/i.test(file.type);
    if (!ok) {
      alert("Please upload PNG/JPG/WEBP image");
      return;
    }
    const url = await fileToDataUrl(file);
    setSelectedImage(url);
    pushToGallery(url);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void onUploadFile(file);
    // reset input so the same file can be re-picked
    e.currentTarget.value = "";
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white flex flex-col items-center p-6">
      <div className="w-full max-w-6xl">
        {/* header */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold">🤖 GAD AI Mint</h1>
            <p className="text-white/70 text-sm">
              Generate or upload an image, then mint it as an NFT on BNB Chain.
            </p>
          </div>
          <AiMintClient />
        </div>

        {/* main grid */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Studio (tabs: Generate / Upload) */}
          <section className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-5">
            <Tabs tab={tab} onTab={(t) => setTab(t)} />

            {tab === "generate" ? (
              <div className="mt-4 space-y-4">
                <textarea
                  className="w-full rounded-xl bg-black/30 border border-white/10 px-3 py-3 outline-none"
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the image you want to generate (e.g. 'A golden coin with soft glow, dark tech background, premium look')."
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-black/30 border border-white/10 rounded-xl p-3">
                    <label className="block text-xs text-white/60 mb-1">Size</label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 outline-none"
                      value={size}
                      onChange={(e) => setSize(e.target.value as GenSize)}
                    >
                      <option value="512">512×512</option>
                      <option value="768">768×768</option>
                      <option value="1024">1024×1024</option>
                    </select>
                  </div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-3">
                    <label className="block text-xs text-white/60 mb-1">Seed (optional)</label>
                    <input
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-2 outline-none"
                      placeholder="random by default"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={generate}
                      disabled={generating}
                      className="w-full px-4 py-3 rounded-xl bg-[#FFD166] text-[#0B0F17] font-semibold hover:opacity-90 disabled:opacity-60"
                    >
                      {generating ? "Generating…" : "Generate"}
                    </button>
                  </div>
                </div>

                {/* gallery */}
                {gallery.length > 0 && (
                  <div className="pt-2">
                    <div className="text-sm text-white/60 mb-2">Recent results</div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                      {gallery.map((g, i) => (
                        <button
                          key={i}
                          className={`relative aspect-square rounded-lg overflow-hidden border ${
                            selectedImage === g ? "border-[#FFD166]" : "border-white/10"
                          }`}
                          onClick={() => setSelectedImage(g)}
                          title="Use this image"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={g} alt={`preview-${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div className="rounded-xl border border-dashed border-white/20 bg-black/30 p-6 text-center">
                  <div className="text-white/80 mb-3">Upload your image (PNG/JPG/WEBP)</div>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={onPickFile}
                    className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FFD166] file:text-[#0B0F17] hover:file:opacity-90"
                  />
                  <div className="text-xs text-white/50 mt-2">Max ~10MB recommended</div>
                </div>
              </div>
            )}
          </section>

          {/* RIGHT: Preview & Mint */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="rounded-xl overflow-hidden border border-white/10 aspect-square bg-black/30 flex items-center justify-center">
              {selectedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selectedImage} alt="selected" className="w-full h-full object-cover" />
              ) : (
                <div className="text-white/50 text-sm px-4 text-center">
                  No image yet. Generate or upload on the left.
                </div>
              )}
            </div>

            <div className="mt-4">
              <MintDialog
                image={selectedImage || ""}
                onMintedAction={(tokenId) => setMintedToken(tokenId)}
              />
            </div>

            {mintedToken && (
              <div className="mt-3 text-xs text-white/70">
                Minted token: <b>{mintedToken}</b>
              </div>
            )}

            <div className="mt-6 text-xs text-white/50">
              Powered by GAD Family · BNB Chain
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

// ===== helpers =====

// плавный табпереключатель без внешних зависимостей
function Tabs({
  tab,
  onTab,
}: {
  tab: "generate" | "upload";
  onTab: (t: "generate" | "upload") => void;
}) {
  return (
    <div className="inline-flex bg-black/30 border border-white/10 rounded-xl overflow-hidden">
      <button
        onClick={() => onTab("generate")}
        className={`px-4 py-2 text-sm ${
          tab === "generate" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
        }`}
      >
        Generate
      </button>
      <button
        onClick={() => onTab("upload")}
        className={`px-4 py-2 text-sm ${
          tab === "upload" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"
        }`}
      >
        Upload
      </button>
    </div>
  );
}

async function fileToDataUrl(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const blob = new Blob([buf], { type: file.type || "image/png" });
  return await new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsDataURL(blob);
  });
}

// простая заглушка-генератор, если API ещё не подключён
async function drawPlaceholder(text: string, size: GenSize): Promise<string> {
  const s = Number(size);
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d")!;
  // фон
  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, "#0E0E12");
  g.addColorStop(0.6, "#1C2025");
  g.addColorStop(1, "#23262B");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  // «coin» диск
  const r = s * 0.28;
  const cx = s * 0.5, cy = s * 0.5;
  const rg = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  rg.addColorStop(0, "rgba(212,175,55,0.85)");
  rg.addColorStop(1, "rgba(212,175,55,0.15)");
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // титр
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `${Math.max(16, s * 0.04)}px ui-sans-serif, system-ui, -apple-system`;
  const lines = wrapText(text, s * 0.7, ctx);
  lines.forEach((line, i) => {
    ctx.fillText(line, s * 0.15, s * 0.8 + i * (s * 0.05));
  });
  return canvas.toDataURL("image/png");
}

function wrapText(t: string, max: number, ctx: CanvasRenderingContext2D) {
  const words = t.split(/\s+/);
  const out: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > max) {
      if (line) out.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) out.push(line);
  return out.slice(0, 3);
}
