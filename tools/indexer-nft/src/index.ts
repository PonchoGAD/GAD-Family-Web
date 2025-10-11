// tools/indexer-nft/src/index.ts
import { writeFileSync, existsSync, readFileSync } from 'fs';
import { ethers, Interface } from 'ethers';
import 'dotenv/config';
import mAbi from '../../../app/lib/nft/abis/Marketplace.json'; // <— путь из /tools/indexer-nft/src

const RPC_URL = process.env.RPC_URL!;
const MARKET = process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS!;
const FROM = Number(process.env.START_BLOCK_MARKETPLACE || 0);

async function main() {
  const p = new ethers.JsonRpcProvider(RPC_URL);
  const iface = new Interface(mAbi as any);
  const topicListed = iface.getEvent('Listed').topicHash;

  const latest = await p.getBlockNumber();
  const out: any[] = [];

  for (let from = FROM; from <= latest; from += 20_000) {
    const to = Math.min(from + 20_000, latest);
    const logs = await p.getLogs({ address: MARKET, topics: [topicListed], fromBlock: from, toBlock: to });

    for (const log of logs) {
      const parsed = iface.parseLog({ topics: log.topics, data: log.data });
      const a = parsed.args as any;
      out.push({
        txHash: String(log.transactionHash),
        nft: String(a[0]),
        tokenId: String(a[1]),
        seller: String(a[2]),
        currency: String(a[3]),
        price: String(a[4]),
        block: Number(log.blockNumber),
        time: Number((await p.getBlock(log.blockNumber)).timestamp),
      });
    }
  }

  writeFileSync('data/listings.json', JSON.stringify(out, null, 2));
  console.log('saved to data/listings.json; total:', out.length);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
