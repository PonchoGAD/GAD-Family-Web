"use client";

import React from "react";
import AiMintClient from "./AiMintClient";
import { ethers, Contract, BrowserProvider } from "ethers";
import { ADDR } from "../../lib/nft/config";
import { nft721Abi } from "../../lib/nft/abis/nft721";

// ⚙️ Если подключите реальный AI endpoint — пропишите NEXT_PUBLIC_AI_ENDPOINT в .env
const AI_ENDPOINT = (process.env.NEXT_PUBLIC_AI_ENDPOINT || "/nft/api/ai").trim();

type GenSize = "512" | "768" | "1024";

type PinFileResp = { ok: boolean; cid?: string; uri?: string; gateway?: string; error?: string };
type PinJsonResp = { ok: boolean; cid?: string; uri?: string; gateway?: string; error?: string };

type Nft721Read = {
  mintFeeWei: () => Promise<bigint>;
  paused: () => Promise<boolean>;
  vault: () => Promise<string>;
};
type Nft721Write = {
  mintWithFee: (
    to: string,
    uri: string,
    overrides: { value: bigint; gasLimit?: bigint }
  ) => Promise<ethers.TransactionResponse>;
};

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

  // статус минта
  const [mintedToken, setMintedToken] = React.useState<string | null>(null);

  const pushToGallery = (url: string) => {
    setGallery((prev) => [url, ...prev].slice(0, 6));
  };

  // 🔮 генерация через API; если не вернул — fallback canvas
  const generate = async () => {
    try {
      setGenerating(true);
      const res = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, size, seed: seed || undefined }),
        cache: "no-store",
      });

      if (res.ok) {
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
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

  // 📤 загрузка своей картинки (png/jpg/webp)
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
                      type="button"
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
                          type="button"
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
              <MintBox image={selectedImage} onMinted={(token) => setMintedToken(token)} />
            </div>

            {mintedToken && (
              <div className="mt-3 text-xs text-white/70">
                Minted token: <b>{mintedToken}</b>
              </div>
            )}

            <div className="mt-6 text-xs text-white/50">Powered by GAD Family · BNB Chain</div>
          </section>
        </div>
      </div>
    </main>
  );
}

/* ====================== MintBox ====================== */

function MintBox({ image, onMinted }: { image: string | null; onMinted: (tokenId: string) => void }) {
  const [name, setName] = React.useState("My AI NFT");
  const [description, setDescription] = React.useState("Generated by GAD AI Studio");
  const [busy, setBusy] = React.useState(false);
  const [status, setStatus] = React.useState<string>("");

  const canMint = Boolean(image && name.trim());

  const doMint = async () => {
    if (!image) {
      alert("Select or generate an image first");
      return;
    }
    try {
      setBusy(true);
      setStatus("Uploading image to IPFS…");

      // 1) dataURL -> File
      const file = await dataUrlToFile(image, "image.png");

      // 2) pin-file
      const fd = new FormData();
      fd.append("file", file);
      fd.append("name", name || "GAD NFT Image");
      const r1 = await fetch("/api/nft/pin-file", { method: "POST", body: fd, cache: "no-store" });
      const j1 = (await r1.json()) as PinFileResp;
      if (!r1.ok || !j1.ok || !j1.uri) throw new Error(j1.error || "pin-file failed");
      const imageUri = j1.uri; // ipfs://...

      // 3) pin-json
      setStatus("Writing metadata (pin-json) …");
      const meta = { name, description, image: imageUri, attributes: [] as Array<Record<string, unknown>> };
      const r2 = await fetch("/api/nft/pin-json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta),
        cache: "no-store",
      });
      const j2 = (await r2.json()) as PinJsonResp;
      if (!r2.ok || !j2.ok || !j2.uri) throw new Error(j2.error || "pin-json failed");
      const tokenUri = j2.uri;

      // 4) mint
      setStatus("Preparing wallet…");
      const eth = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum;
      if (!eth) throw new Error("No wallet (window.ethereum) found");
      const provider = new BrowserProvider(eth);
      const signer = await provider.getSigner();
      const to = await signer.getAddress();

      const cBase = new Contract(ADDR.NFT721, nft721Abi, signer);
      const cRead = cBase as unknown as Nft721Read;
      const cWrite = cBase as unknown as Nft721Write;

      // soft-checks
      try {
        const p = await cRead.paused();
        if (p) throw new Error("Contract is paused");
      } catch {
        /* if no paused() — ignore */
      }
      try {
        const v = await cRead.vault();
        if (v === ethers.ZeroAddress) throw new Error("NFT vault is zero; admin must setVault()");
      } catch {
        /* ignore if absent */
      }

      const fee: bigint = await (async () => {
        try {
          return await cRead.mintFeeWei();
        } catch {
          return ethers.parseEther("0.01"); // fallback
        }
      })();

      setStatus(`Sending mint tx (fee ${ethers.formatEther(fee)} BNB)…`);
      const overrides = { value: fee, gasLimit: 300000n };
      const tx = await cWrite.mintWithFee(to, tokenUri, overrides);
      const receipt = await tx.wait();

      // Пытаемся достать tokenId из события Transfer(address(0) -> to, tokenId)
      let mintedTokenId: string | null = null;
      try {
        const iface = new ethers.Interface(nft721Abi);
        for (const log of receipt.logs) {
          try {
            const parsed = iface.parseLog(log);
            if (parsed?.name === "Transfer") {
              const from = String(parsed.args[0]);
              const toAddr = String(parsed.args[1]);
              const tk = parsed.args[2] as bigint;
              if (from.toLowerCase() === ethers.ZeroAddress && toAddr.toLowerCase() === to.toLowerCase()) {
                mintedTokenId = tk.toString();
                break;
              }
            }
          } catch {
            // не наш лог — пропускаем
          }
        }
      } catch {
        // парсинг не критичен
      }

      setStatus("Minted ✅");
      onMinted(mintedTokenId ?? "new");
      alert(`NFT minted!${mintedTokenId ? ` Token #${mintedTokenId}` : ""}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Mint failed";
      setStatus(msg);
      alert(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="border rounded-xl p-4 bg-[#0E0E12]/80 text-white space-y-3">
      <div className="font-semibold text-lg">Mint Generated NFT</div>
      <input
        className="border rounded px-3 py-2 w-full bg-transparent"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
      />
      <textarea
        className="border rounded px-3 py-2 w-full bg-transparent"
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
      />
      <button
        type="button"
        onClick={doMint}
        disabled={!canMint || busy}
        className="border border-[#FFD166] text-[#FFD166] rounded px-4 py-2 hover:bg-[#FFD166] hover:text-black transition w-full disabled:opacity-60"
      >
        {busy ? "Minting…" : "Mint to Wallet"}
      </button>
      {status && <div className="text-xs text-white/70">{status}</div>}
    </div>
  );
}

/* ====================== helpers ====================== */

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
        type="button"
        onClick={() => onTab("generate")}
        className={`px-4 py-2 text-sm ${tab === "generate" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"}`}
      >
        Generate
      </button>
      <button
        type="button"
        onClick={() => onTab("upload")}
        className={`px-4 py-2 text-sm ${tab === "upload" ? "bg-white/10 text-white" : "text-white/70 hover:text-white"}`}
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

async function drawPlaceholder(text: string, size: GenSize): Promise<string> {
  const s = Number(size);
  const canvas = document.createElement("canvas");
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext("2d")!;
  // background
  const g = ctx.createLinearGradient(0, 0, s, s);
  g.addColorStop(0, "#0E0E12");
  g.addColorStop(0.6, "#1C2025");
  g.addColorStop(1, "#23262B");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  // coin-like disk
  const r = s * 0.28;
  const cx = s * 0.5;
  const cy = s * 0.5;
  const rg = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
  rg.addColorStop(0, "rgba(212,175,55,0.85)");
  rg.addColorStop(1, "rgba(212,175,55,0.15)");
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // caption
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

async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) throw new Error("Invalid data URL");
  const mime = m[1];
  const b64 = m[2];
  const bin = atob(b64);
  const len = bin.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  const blob = new Blob([u8], { type: mime || "image/png" });
  return new File([blob], filename, { type: mime || "image/png" });
}
