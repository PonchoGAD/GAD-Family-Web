import { NextResponse } from "next/server";
import { getReadProvider } from "../../../lib/nft/eth";
import { ADDR } from "../../../lib/nft/config";
import { marketplaceAbi } from "../../../lib/nft/abis/marketplace";
import { ethers } from "ethers";

export async function GET() {
  try {
    const provider = await getReadProvider();

    // Первый топик события "Listed"
    const topicListed = ethers.id(
      "Listed(address,uint256,address,address,uint256)"
    );

    const logs = await provider.getLogs({
      address: ADDR.MARKETPLACE,
      fromBlock: Math.max((await provider.getBlockNumber()) - 200_000, 1),
      toBlock: "latest",
      topics: [topicListed],
    });

    const iface = new ethers.Interface(marketplaceAbi);

    const listings = logs.map((log) => {
      const parsed = iface.parseLog(log);
      return {
        nft: parsed.args.nft as string,
        tokenId: parsed.args.tokenId.toString(),
        seller: parsed.args.seller as string,
        currency:
          (parsed.args.currency as string).toLowerCase() === ethers.ZeroAddress.toLowerCase()
            ? "BNB"
            : "USDT",
        priceWei: parsed.args.price.toString(),
      };
    });

    return NextResponse.json({ ok: true, listings });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("NFT list error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
