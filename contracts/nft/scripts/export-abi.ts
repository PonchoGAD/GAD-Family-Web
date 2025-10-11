// contracts/nft/scripts/export-abi.ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// __dirname в ESM:
const __filename = fileURLToPath(import.meta.url);
const __dirname2 = dirname(__filename);

// пути
const projectRoot = join(__dirname2, "..");                     // contracts/nft
const artifacts   = join(projectRoot, "artifacts", "src");
const outDir      = join(projectRoot, "..", "..", "app", "lib", "nft", "abis");

type Item = { src: string; name: string; outJson: string; outTs: string };

const items: Item[] = [
  { src: "Marketplace.sol",    name: "Marketplace",    outJson: "Marketplace.json",    outTs: "marketplace.ts" },
  { src: "NFT721.sol",         name: "NFT721",         outJson: "NFT721.json",         outTs: "nft721.ts" },
  { src: "LiquidityVault.sol", name: "LiquidityVault", outJson: "LiquidityVault.json", outTs: "liquidityVault.ts" },
];

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}

function run() {
  ensureDir(outDir);

  for (const it of items) {
    const artifactPath = join(artifacts, it.src, `${it.name}.json`);
    const raw = JSON.parse(readFileSync(artifactPath, "utf8"));

    const abi = raw.abi ?? [];
    const jsonTarget = join(outDir, it.outJson);
    const tsTarget   = join(outDir, it.outTs);

    writeFileSync(jsonTarget, JSON.stringify(abi, null, 2), "utf8");

    const ts = `export const abi = ${JSON.stringify(abi, null, 2)} as const;
export default abi;`;
    writeFileSync(tsTarget, ts, "utf8");

    console.log("ABI exported:", it.name);
  }
}

run();
