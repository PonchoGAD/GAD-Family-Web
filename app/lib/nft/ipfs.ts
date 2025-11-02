// app/lib/nft/ipfs.ts
// Универсальный модуль для загрузки JSON и файлов в IPFS через /api/nft/*

export type PinJsonResp = {
  ok: boolean;
  cid?: string;
  uri?: string;
  gateway?: string;
  error?: string;
};

export type PinFileResp = {
  ok: boolean;
  cid?: string;
  uri?: string;
  gateway?: string;
  error?: string;
};

/**
 * 📦 pinJson — загружает JSON-метаданные на IPFS
 * @param meta объект метаданных (например { name, description, image })
 */
export async function pinJson(meta: Record<string, unknown>): Promise<PinJsonResp> {
  const r = await fetch("/api/nft/pin-json", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(meta),
    cache: "no-store",
  });
  const j = (await r.json()) as PinJsonResp;
  if (!r.ok || !j.ok || !j.cid)
    throw new Error(j.error || `pin-json failed: ${r.status}`);
  return j;
}

/**
 * 🖼 pinFile — загружает файл (FormData) на IPFS
 * @param fd FormData с файлом {file, name?}
 */
export async function pinFile(fd: FormData): Promise<PinFileResp> {
  const r = await fetch("/api/nft/pin-file", {
    method: "POST",
    body: fd,
    cache: "no-store",
  });
  const j = (await r.json()) as PinFileResp;
  if (!r.ok || !j.ok || !j.cid)
    throw new Error(j.error || `pin-file failed: ${r.status}`);
  return j;
}
