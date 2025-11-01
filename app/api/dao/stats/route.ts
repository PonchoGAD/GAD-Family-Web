import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { liquidityVaultAbi } from "../../../lib/nft/abis/liquidityVault";
import { ADDR } from "../../../lib/nft/config";

// GET /api/dao/stats
export async function GET() {
  try {
    const rpc =
      process.env.BSC_RPC_URL ||
      process.env.NEXT_PUBLIC_RPC_URL ||
      "https://bsc-dataseed1.binance.org";

    const provider = new ethers.JsonRpcProvider(rpc);
    const vault = new ethers.Contract(ADDR.VAULT, liquidityVaultAbi, provider);

    // универсальный метод, который ты добавлял в ABI:
    // function getVaultInfo() view returns (uint256 total, uint256 users)
    const [total, users] = await vault.getVaultInfo();

    const data = {
      totalBNB: ethers.formatEther(total),
      users: Number(users),
      fromVault: true,
      timestamp: Date.now(),
    };

    // В Next.js app router заголовки ставятся через NextResponse
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
