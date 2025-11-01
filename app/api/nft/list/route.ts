// app/api/nft/list/route.ts
import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import { ADDR } from "../../../lib/nft/config";
import { marketplaceAbi } from "../../../lib/nft/abis/marketplace";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 20)));
    const cursor = Number(url.searchParams.get("cursor") || 0); // от какого блока идём назад

    const rpc = process.env.BSC_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL!;
    const provider = new ethers.JsonRpcProvider(rpc, 56);

    const iface = new ethers.Interface(marketplaceAbi);
    // Чтобы не ловить несовместимости версий ethers — вычисляем topic напрямую по сигнатуре
    const topicListed = ethers.id("Listed(address,uint256,address,address,uint256)");

    const latest = await provider.getBlockNumber();
    const toBlock = cursor && cursor > 0 ? cursor : latest;
    const fromBlock = Math.max(toBlock - 250_000, 1);

    const logs = await provider.getLogs({
      address: ADDR.MARKETPLACE,
      fromBlock,
      toBlock,
      topics: [topicListed],
    });

    // последние limit (с конца) → reverse для «свежие сверху»
    const slice = logs.slice(-limit).reverse();

    const listings = slice.map((log) => {
      const parsed = iface.parseLog(log);
      return {
        nft: String(parsed.args.nft),
        tokenId: parsed.args.tokenId.toString(),
        seller: String(parsed.args.seller),
        currency: String(parsed.args.currency).toLowerCase() === ethers.ZeroAddress.toLowerCase() ? "BNB" : "USDT",
        priceWei: parsed.args.price.toString(),
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
      };
    });

    const nextCursor = fromBlock > 1 ? fromBlock - 1 : 0;

    return NextResponse.json({ ok: true, listings, nextCursor });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
