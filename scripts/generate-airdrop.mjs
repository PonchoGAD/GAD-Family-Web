// scripts/generate-airdrop.mjs
// Usage: node scripts/generate-airdrop.mjs
// Input: data/base.csv, data/bonus.csv (одна колонка с адресами, заголовки игнорим)
// Output: app/api/airdrop-proof/{base,bonus}/index.json (map) + roots.json

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'data');
const OUT  = path.join(ROOT, 'app', 'api', 'airdrop-proof');

function isAddr(s) {
  return /^0x[0-9a-fA-F]{40}$/.test((s||'').trim());
}
function norm(s) { return s.trim().toLowerCase(); }

// --- простейшее построение меркл-дерева (sorted pairs)
function keccak(buf) {
  return '0x' + crypto.createHash('keccak256' in crypto ? 'keccak256' : 'sha3-256') // Node 20 часто sha3-256
    .update(Buffer.isBuffer(buf) ? buf : Buffer.from(buf.replace(/^0x/,''), 'hex'))
    .digest('hex');
}
// совместим 2 варианта: если нет keccak256, используем sha3-256
function keccakPacked(a, b) {
  const A = Buffer.from(a.replace(/^0x/,'') || '', 'hex');
  const B = Buffer.from(b.replace(/^0x/,'') || '', 'hex');
  const concat = Buffer.concat([A,B]);
  const h = crypto.createHash('sha3-256');
  h.update(concat);
  return '0x' + h.digest('hex');
}

function leafFromAddress(addr) {
  // leaf = keccak256(abi.encodePacked(address)) => 20 байт адрес
  const raw = Buffer.from(addr.replace(/^0x/,'').toLowerCase(),'hex');
  const h = crypto.createHash('sha3-256'); h.update(raw);
  return '0x' + h.digest('hex');
}

function buildTree(leaves) {
  if (leaves.length === 0) return { root: '0x'+''.padStart(64,'0'), layers: [ [] ] };
  let layers = [leaves.slice()];
  while (layers[layers.length - 1].length > 1) {
    const prev = layers[layers.length - 1];
    const next = [];
    for (let i=0; i<prev.length; i+=2) {
      if (i+1 === prev.length) { next.push(prev[i]); }
      else {
        const a = prev[i].toLowerCase();
        const b = prev[i+1].toLowerCase();
        const [left, right] = a < b ? [a,b] : [b,a];
        next.push(keccakPacked(left, right));
      }
    }
    layers.push(next);
  }
  return { root: layers[layers.length - 1][0], layers };
}

function getProof(addr, leaves, layers) {
  // стандартный proof: сосед на каждом уровне
  let leaf = leafFromAddress(addr);
  let idx = leaves.findIndex(x => x.toLowerCase() === leaf.toLowerCase());
  if (idx === -1) return [];
  const proof = [];
  for (let l=0; l<layers.length - 1; l++) {
    const layer = layers[l];
    const isRight = idx % 2 === 1;
    const pairIdx = isRight ? idx - 1 : idx + 1;
    if (pairIdx < layer.length) {
      proof.push(layer[pairIdx]);
    }
    idx = Math.floor(idx / 2);
  }
  return proof;
}

function readAddresses(csvPath) {
  if (!fs.existsSync(csvPath)) return [];
  const raw = fs.readFileSync(csvPath,'utf8');
  return raw.split(/\r?\n/)
    .map(l => l.split(',')[0].trim())
    .filter(a => isAddr(a))
    .map(norm);
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(obj,null,2));
}

function runOne(kind) {
  const csv = path.join(DATA, `${kind}.csv`); // data/base.csv, data/bonus.csv
  const addrs = readAddresses(csv);
  if (addrs.length === 0) { console.log(`[${kind}] no addresses`); return null; }

  const leaves = addrs.map(leafFromAddress);
  const { root, layers } = buildTree(leaves);

  // соберём map: { [address]: { proof: string[] } }
  const map = {};
  for (const a of addrs) {
    map[a] = { proof: getProof(a, leaves, layers) };
  }
  writeJson(path.join(OUT, kind, 'index.json'), { root, count: addrs.length, map });

  console.log(`[${kind}] root: ${root} count: ${addrs.length}`);
  return { kind, root, count: addrs.length };
}

const base = runOne('base');   // ожидает data/base.csv
const bonus = runOne('bonus'); // ожидает data/bonus.csv
writeJson(path.join(OUT, 'roots.json'), { base, bonus });
console.log('Done.');
