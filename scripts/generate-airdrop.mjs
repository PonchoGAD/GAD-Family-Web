// scripts/generate-airdrop.mjs
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---- PATHS ----
const DECIMALS = 18; // GAD
const CSV_BASE  = resolve(__dirname, "../data/airdrop/base.csv");
const CSV_BONUS = resolve(__dirname, "../data/airdrop/bonus.csv");

const OUT_ROOTS = resolve(__dirname, "../app/api/airdrop-proof/roots.json");
const OUT_BASE  = resolve(__dirname, "../app/api/airdrop-proof/base/index.json");
const OUT_BONUS = resolve(__dirname, "../app/api/airdrop-proof/bonus/index.json");

// ---- HELPERS ----
function cleanCsvText(raw) {
  if (!raw) return "";
  // remove BOM
  return raw.replace(/^\uFEFF/, "");
}

function detectSep(sampleLine) {
  if (!sampleLine) return ",";
  const c = (ch) => (sampleLine.split(ch).length - 1);
  const cand = [
    { sep: ",", n: c(",") },
    { sep: ";", n: c(";") },
    { sep: "\t", n: c("\t") },
  ];
  cand.sort((a, b) => b.n - a.n);
  return cand[0].n > 0 ? cand[0].sep : ",";
}

function splitLine(line, sep) {
  // простой сплит с удалением кавычек вокруг значений
  return line.split(sep).map(s => s.trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1"));
}

function parseCsv(path) {
  let text;
  try { text = cleanCsvText(readFileSync(path, "utf8")); }
  catch { return []; }

  const rows = text.split(/\r?\n/).map(r => r.trim()).filter(Boolean);
  if (rows.length === 0) return [];

  const sep = detectSep(rows[0]);
  const header = splitLine(rows[0], sep).map(x => x.toLowerCase());
  let startIdx = 0;

  // есть ли заголовок?
  const hasHeader = header.includes("address") && header.some(h => h.includes("amount"));
  if (hasHeader) startIdx = 1;

  const out = [];
  for (let i = startIdx; i < rows.length; i++) {
    const cols = splitLine(rows[i], sep);
    if (cols.length < 2) continue;

    // support any order if header present; otherwise assume address,amount
    let address = cols[0];
    let amount  = cols[1];
    if (hasHeader) {
      const aIdx = header.indexOf("address");
      const mIdx = header.findIndex(h => h.includes("amount"));
      address = cols[aIdx];
      amount  = cols[mIdx];
    }

    if (!address || !amount) continue;

    address = address.trim();
    // Excel может сохранить адрес в верхнем регистре — норм
    if (!ethers.isAddress(address)) continue;

    // нормализуем amount: убираем пробелы/неразр. пробелы, _; запятая -> точка
    amount = String(amount).replace(/\s| |_/g, "").replace(",", ".");
    if (!/^\d+(\.\d+)?$/.test(amount)) continue;

    out.push({ address: ethers.getAddress(address), amount });
  }
  return out;
}

function leafHash(address, amountWei) {
  return ethers.solidityPackedKeccak256(["address", "uint256"], [address, amountWei]);
}

function buildMerkle(leaves) {
  if (leaves.length === 0) return { root: ethers.ZeroHash, layers: [[]] };
  let layer = leaves.map(x => x.hash);
  const layers = [layer];

  while (layer.length > 1) {
    const next = [];
    for (let i = 0; i < layer.length; i += 2) {
      const L = layer[i];
      const R = (i + 1 < layer.length) ? layer[i + 1] : L;
      const [a, b] = [L, R].sort();
      next.push(ethers.keccak256(ethers.concat([a, b])));
    }
    layer = next;
    layers.push(layer);
  }
  return { root: layer[0], layers };
}

function getProof(layers, idx) {
  const proof = [];
  for (let level = 0; level < layers.length - 1; level++) {
    const layer = layers[level];
    const sibIdx = idx ^ 1;
    const sibling = layer[sibIdx] ?? layer[idx];
    proof.push(sibling);
    idx = Math.floor(idx / 2);
  }
  return proof;
}

function writeJson(path, obj) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(obj, null, 2));
}

function packSet(items) {
  // суммируем дубликаты адресов (если вдруг есть)
  const merged = new Map();
  for (const { address, amount } of items) {
    const prev = merged.get(address) || "0";
    const sum = (Number(prev) + Number(amount)).toString();
    merged.set(address, sum);
  }

  const entries = Array.from(merged.entries()).map(([address, amount]) => {
    const amountWei = ethers.parseUnits(amount, DECIMALS);
    const hash = leafHash(address, amountWei);
    return { address, amount, amountWei: amountWei.toString(), hash };
  });

  entries.sort((a, b) => (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0));

  const { root, layers } = buildMerkle(entries);
  const map = {};
  entries.forEach((e, i) => {
    map[e.address.toLowerCase()] = {
      amount: e.amount,
      amountWei: e.amountWei,
      proof: getProof(layers, i),
    };
  });

  return { root, count: entries.length, map };
}

function main() {
  const baseList  = parseCsv(CSV_BASE);
  const bonusList = parseCsv(CSV_BONUS);

  console.log(`[base] ${baseList.length} addresses`);
  console.log(`[bonus] ${bonusList.length} addresses`);

  const basePack  = packSet(baseList);
  const bonusPack = packSet(bonusList);

  writeJson(OUT_ROOTS, {
    base:  { root: basePack.root,  count: basePack.count },
    bonus: { root: bonusPack.root, count: bonusPack.count }
  });
  writeJson(OUT_BASE,  { root: basePack.root,  count: basePack.count,  map: basePack.map  });
  writeJson(OUT_BONUS, { root: bonusPack.root, count: bonusPack.count, map: bonusPack.map });

  console.log("Done. Files written:");
  console.log(" -", OUT_ROOTS);
  console.log(" -", OUT_BASE);
  console.log(" -", OUT_BONUS);
}

main();
