/**
 * Проверяет, остались ли дубли / старые вызовы NFT API
 * Запуск: npx tsx tools/check-nft-duplicates.ts
 */
import fs from "fs";
import path from "path";

const ROOT = path.resolve("./app");

const patterns = [
  "nft721Abi",
  "mintWithFee(",
  "/api/nft/mint",
  "/nft/api/mint",
  "UploadMintWidget",
  "pinJSON",
  "pin-file",
];

function walk(dir: string, list: string[] = []) {
  for (const file of fs.readdirSync(dir)) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) walk(full, list);
    else if (/\.(tsx?|jsx?)$/.test(file)) list.push(full);
  }
  return list;
}

const files = walk(ROOT);
const results: Record<string, string[]> = {};

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  for (const pattern of patterns) {
    if (text.includes(pattern)) {
      if (!results[pattern]) results[pattern] = [];
      results[pattern].push(file);
    }
  }
}

console.log("🔍 NFT file duplicates scan result:\n");
for (const [pattern, files] of Object.entries(results)) {
  console.log(`\n▶ ${pattern} (${files.length})`);
  files.forEach(f => console.log("  -", f));
}
console.log("\n✅ Scan complete.");
