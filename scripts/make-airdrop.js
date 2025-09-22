// scripts/make-airdrop.js
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// mini keccak256 (Node 18+ без внешних зависимостей нет keccak)
// Возьмём sha256 как хеш для совместимости с нашим контрактом? НЕТ!
// В контракте мы используем keccak256. Значит, простой способ — хешировать так же,
// как on-chain: keccak256(abi.encodePacked(address)). Для оффчейна возьмём пакет keccak.
// Установим: npm i keccak
import keccak from 'keccak';

function keccak256(buf) {
  return keccak('keccak256').update(buf).digest();
}

// читаем CSV: одна колонка с адресами
function readAddresses(csvPath) {
  const raw = fs.readFileSync(csvPath, 'utf8');
  return raw
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => s.toLowerCase());
}

// строим меркл (сортированные пары, как в контракте)
function makeLeaves(addresses) {
  return addresses.map(a => keccak256(Buffer.from(a.replace(/^0x/, ''), 'hex')));
}
function pairHash(a, b) {
  // сортируем по байтам
  return Buffer.compare(a, b) < 0
    ? keccak256(Buffer.concat([a, b]))
    : keccak256(Buffer.concat([b, a]));
}
function makeTree(leaves) {
  if (leaves.length === 0) return { root: Buffer.alloc(32, 0), layers: [ [] ] };
  let layers = [ leaves ];
  while (layers[layers.length - 1].length > 1) {
    const prev = layers[layers.length - 1];
    const next = [];
    for (let i = 0; i < prev.length; i += 2) {
      if (i + 1 === prev.length) {
        // одиночный — поднимаем наверх как есть
        next.push(prev[i]);
      } else {
        next.push(pairHash(prev[i], prev[i + 1]));
      }
    }
    layers.push(next);
  }
  return { root: layers[layers.length - 1][0], layers };
}

function getProof(leaf, layers) {
  const proof = [];
  let idx = layers[0].findIndex(x => x.equals(leaf));
  if (idx === -1) return proof; // не найден
  for (let level = 0; level < layers.length - 1; level++) {
    const layer = layers[level];
    const pairIndex = idx ^ 1; // сосед
    if (pairIndex < layer.length) proof.push(layer[pairIndex]);
    idx = Math.floor(idx / 2);
  }
  return proof;
}

function toHex(buf) { return '0x' + buf.toString('hex'); }

function buildMerkle(csvPath) {
  const addrs = readAddresses(csvPath);
  const leaves = makeLeaves(addrs);
  const { root, layers } = makeTree(leaves);
  const proofs = {};
  addrs.forEach((a, i) => {
    const leaf = leaves[i];
    proofs[a] = getProof(leaf, layers).map(toHex);
  });
  return { root: toHex(root), list: addrs, proofs };
}

// === RUN ===
const baseCsv  = process.argv[2];  // ./data/base.csv
const bonusCsv = process.argv[3];  // ./data/bonus.csv
if (!baseCsv || !bonusCsv) {
  console.error('Usage: node scripts/make-airdrop.js ./data/base.csv ./data/bonus.csv');
  process.exit(1);
}

const base  = buildMerkle(baseCsv);
const bonus = buildMerkle(bonusCsv);

const out = {
  baseRoot:  base.root,
  bonusRoot: bonus.root,
  baseProofs:  base.proofs,
  bonusProofs: bonus.proofs,
};

const outDir = path.join(__dirname, '..', 'public', 'airdrop');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'airdrop-proofs.json'), JSON.stringify(out, null, 2));

console.log('baseRoot :', base.root);
console.log('bonusRoot:', bonus.root);
console.log('Saved -> public/airdrop/airdrop-proofs.json');
