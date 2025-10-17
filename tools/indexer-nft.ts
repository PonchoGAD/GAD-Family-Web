/**
 * GAD Indexer — tracks NFT721 + Marketplace events in real time
 * Run: npx tsx tools/indexer-nft.ts
 */
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { nft721Abi } from "../app/lib/nft/abis/nft721";
import { marketplaceAbi } from "../app/lib/nft/abis/marketplace";
import { ADDR } from "../app/lib/nft/config";

const provider = new ethers.WebSocketProvider(process.env.BSC_WSS_URL!);

const nft = new ethers.Contract(ADDR.NFT721, nft721Abi, provider);
const mkt = new ethers.Contract(ADDR.MARKETPLACE, marketplaceAbi, provider);

const DB_FILE = path.resolve("./data/nft-events.json");

type Record = {
  type: string;
  tx: string;
  block: number;
  from?: string;
  to?: string;
  tokenId?: string;
  price?: string;
  currency?: string;
  timestamp?: number;
};

function save(record: Record) {
  let data: Record[] = [];
  try {
    if (fs.existsSync(DB_FILE)) {
      data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
    }
  } catch {}
  data.unshift(record);
  fs.writeFileSync(DB_FILE, JSON.stringify(data.slice(0, 1000), null, 2));
  console.log("✅", record.type, record.tokenId || "", record.tx.slice(0, 10));
}

/* --- NFT Mint --- */
nft.on("Transfer", async (from, to, tokenId, ev) => {
  if (from === ethers.ZeroAddress) {
    const block = await ev.getBlock();
    save({
      type: "MINT",
      tx: ev.transactionHash,
      block: ev.blockNumber,
      from,
      to,
      tokenId: tokenId.toString(),
      timestamp: Number(block.timestamp) * 1000,
    });
  }
});

/* --- Marketplace events --- */
mkt.on("Listed", async (nftAddr, tokenId, seller, currency, price, ev) => {
  const block = await ev.getBlock();
  save({
    type: "LISTED",
    tx: ev.transactionHash,
    block: ev.blockNumber,
    from: seller,
    tokenId: tokenId.toString(),
    price: ethers.formatEther(price),
    currency: currency === ethers.ZeroAddress ? "BNB" : "USDT",
    timestamp: Number(block.timestamp) * 1000,
  });
});

mkt.on("Cancelled", async (nftAddr, tokenId, seller, ev) => {
  const block = await ev.getBlock();
  save({
    type: "CANCELLED",
    tx: ev.transactionHash,
    block: ev.blockNumber,
    from: seller,
    tokenId: tokenId.toString(),
    timestamp: Number(block.timestamp) * 1000,
  });
});

mkt.on("Bought", async (nftAddr, tokenId, buyer, seller, currency, price, ev) => {
  const block = await ev.getBlock();
  save({
    type: "SOLD",
    tx: ev.transactionHash,
    block: ev.blockNumber,
    from: seller,
    to: buyer,
    tokenId: tokenId.toString(),
    price: ethers.formatEther(price),
    currency: currency === ethers.ZeroAddress ? "BNB" : "USDT",
    timestamp: Number(block.timestamp) * 1000,
  });
});

console.log("👁 Indexer started... Watching contracts...");
