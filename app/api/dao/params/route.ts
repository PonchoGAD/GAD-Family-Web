import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { ADDR } from "../../../lib/nft/config";
import { governorAbi } from "../../../lib/dao/abis/governor";

// GET /api/dao/params
export async function GET() {
  try {
    const rpc =
      process.env.BSC_RPC_URL ||
      process.env.NEXT_PUBLIC_RPC_URL ||
      "https://bsc-dataseed1.binance.org";
    const provider = new ethers.JsonRpcProvider(rpc);
    const gov = new ethers.Contract(ADDR.GOVERNOR, governorAbi, provider);

    // Некоторые поля могут отсутствовать в конкретной реализации — оборачиваем в try/catch
    const name = await gov.name().catch(() => "Governor");
    const votingDelay = await gov.votingDelay().then((v: bigint) => v.toString()).catch(() => "0");
    const votingPeriod = await gov.votingPeriod().then((v: bigint) => v.toString()).catch(() => "0");
    const threshold = await gov.proposalThreshold().then((v: bigint) => v.toString()).catch(() => "0");
    const clock = await gov.clock().then((v: bigint) => v.toString()).catch(() => "0");
    const clockMode = await gov.CLOCK_MODE?.().catch?.(() => "mode=blocknumber") ?? "mode=blocknumber";

    // кворум обычно зависит от clock (blockNumber/timestamp)
    const quorum = await gov.quorum(clock).then((v: bigint) => v.toString()).catch(() => "0");

    return NextResponse.json({
      name,
      threshold,
      votingDelay,
      votingPeriod,
      quorum,
      clock,
      clockMode,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
