import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { getReadProvider } from "../../../lib/nft/eth";
import { ADDR, START_BLOCK } from "../../../lib/nft/constants";
import type { ApiListingsResponse, ListingRow } from "../../../lib/nft/types";
import mAbi from "../../../lib/nft/abis/Marketplace.json";

export const dynamic = "force-dynamic";

function getMarketplace(provider: ethers.Provider) {
  return new ethers.Contract(ADDR.MARKETPLACE, mAbi, provider);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.max(10, Math.min(500, Number(searchParams.get("limit") || 200)));
    const cursor = Number(searchParams.get("cursor") || 0);

    const provider = getReadProvider();
    const mkt = getMarketplace(provider);

    const latest = await provider.getBlockNumber();
    const windowBlocks = 2_000;
    let toBlock = cursor && cursor > 0 ? cursor : latest;
    const fromBlock = Math.max(START_BLOCK || 0, toBlock - windowBlocks);

    const filter = mkt.filters.Listed();

    let rawLogs: ethers.Log[] = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        rawLogs = await mkt.queryFilter(filter, fromBlock, toBlock);
        break;
      } catch (e: any) {
        const msg = String(e?.shortMessage || e?.message || "");
        if (msg.includes("rate limit") || e?.code === "BAD_DATA") {
          await sleep(700 * (attempt + 1));
          toBlock = Math.max(fromBlock, toBlock - 500);
          continue;
        }
        throw e;
      }
    }

    const last = rawLogs.slice(-limit);

    const items: ListingRow[] = await Promise.all(
      last.map(async (log: any) => {
        const a = (log && (log.args ?? {})) as any;
        const nft      = String(a?.nft      ?? a?.[0] ?? "");
        const tokenId  = String(a?.tokenId  ?? a?.[1] ?? "");
        const seller   = String(a?.seller   ?? a?.[2] ?? "");
        const currency = String(a?.currency ?? a?.[3] ?? "");
        const price    = String(a?.price    ?? a?.[4] ?? "");

        let ts = 0;
        try {
          const b = await provider.getBlock(log.blockNumber);
          ts = Number(b?.timestamp || 0);
        } catch {}

        return {
          txHash: String(log.transactionHash),
          nft, tokenId, seller, currency, price,
          block: Number(log.blockNumber),
          time: ts,
        };
      })
    );

    const nextCursor = fromBlock > 1 ? fromBlock - 1 : null;
    const body: ApiListingsResponse = { items: items.reverse(), nextCursor, latest };

    return new NextResponse(JSON.stringify(body), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store, no-cache, must-revalidate",
        "access-control-allow-origin": "*",
      },
      status: 200,
    });
  } catch (e: any) {
    const err = e?.shortMessage || e?.message || "failed";
    return new NextResponse(JSON.stringify({ error: err }), { status: 500 });
  }
}
