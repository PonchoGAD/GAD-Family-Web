import { NextRequest, NextResponse } from "next/server";
import { getReadProvider } from "../../../lib/nft/eth";
import { nft721Abi } from "../../../lib/nft/abis/nft721";
import { ADDR } from "../../../lib/nft/config";
import { ethers } from "ethers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get("address");
    if (!address) {
      return NextResponse.json({ ok: false, error: "address is required" }, { status: 400 });
    }

    const provider = await getReadProvider();
    const latest = await provider.getBlockNumber();
    const fromBlock = Math.max(latest - 200_000, 1);
    const topicTransfer = ethers.id("Transfer(address,address,uint256)");

    const logs = await provider.getLogs({
      address: ADDR.NFT721,
      fromBlock,
      toBlock: latest,
      topics: [topicTransfer],
    });

    const iface = new ethers.Interface(nft721Abi);

    const owned = logs
      .map((lg) => {
        try {
          const parsed = iface.parseLog(lg);
          const to = String(parsed.args[1]);
          const tokenId = parsed.args[2].toString();
          return to.toLowerCase() === address.toLowerCase() ? tokenId : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return NextResponse.json({ ok: true, owned });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("NFT me error:", msg);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
