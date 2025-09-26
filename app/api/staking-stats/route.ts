// app/api/staking-stats/route.ts
import { NextResponse } from "next/server";
import { ethers } from "ethers";

// ==== НАСТРОЙКА ====
// Адрес вашего single-staking контракта
const STAKING_ADDRESS = "0x0271167c2b1b1513434ECe38f024434654781594";
// RPC для BNB Chain
const BSC_RPC = process.env.BSC_RPC || "https://bsc-dataseed.binance.org/";
// Ключ BscScan (создайте и положите в .env.local как BSC_API_KEY=xxx)
const BSC_API_KEY = process.env.BSC_API_KEY || "";

// ВАЖНО: укажите точную сигнатуру события депозита/стейка из вашего контракта.
// Посмотреть можно на BscScan во вкладке "Events" контракта.
// Примеры (оставьте один, который реально есть у вас):
// const DEPOSIT_SIG = "Deposit(address,uint256,uint256)";
// const DEPOSIT_SIG = "Staked(address,uint256,uint256)";
// Предположим у вас: Deposit(address indexed user, uint256 pid, uint256 amount)
const DEPOSIT_SIG = "Deposit(address,uint256,uint256)";

// Минимальный ABI: poolLength() и pools(pid) -> totalStaked
const STAKING_ABI = [
  "function poolLength() view returns (uint256)",
  "function pools(uint256) view returns (uint256 lockPeriod,uint256 multiplierBps,uint256 totalStaked,uint256 rewardPerTokenStored,uint256 lastUpdate,bool active,uint256 maxPerWallet)"
];

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1) On-chain TVL по пулам
    const provider = new ethers.JsonRpcProvider(BSC_RPC);
    const staking = new ethers.Contract(STAKING_ADDRESS, STAKING_ABI, provider);

    const poolLen: bigint = await staking.poolLength();
    const pools: { pid: number; totalStaked: string }[] = [];

    for (let i = 0; i < Number(poolLen); i++) {
      const p = await staking.pools(i);
      const totalStaked: bigint = p[2]; // totalStaked
      pools.push({ pid: i, totalStaked: totalStaked.toString() });
    }

    // 2) Уникальные стейкеры по событиям (BscScan API)
    // Сигнатура события -> topic0
    const topic0 = ethers.id(DEPOSIT_SIG); // keccak256("Deposit(address,uint256,uint256)")

    // Вызов BscScan logs API
    // Документация: https://docs.bscscan.com/api-endpoints/logs
    // fromBlock можно сузить (например, блок деплоя), сейчас берём с 1.
    const url = new URL("https://api.bscscan.com/api");
    url.searchParams.set("module", "logs");
    url.searchParams.set("action", "getLogs");
    url.searchParams.set("fromBlock", "1");
    url.searchParams.set("toBlock", "latest");
    url.searchParams.set("address", STAKING_ADDRESS);
    url.searchParams.set("topic0", topic0);
    if (BSC_API_KEY) url.searchParams.set("apikey", BSC_API_KEY);

    const resp = await fetch(url.toString(), { cache: "no-store" });
    const data = await resp.json();

    let uniqueStakers = 0;
    if (data?.status === "1" && Array.isArray(data.result)) {
      // По сигнатуре Deposit(address,uint256,uint256) первый topic1 = indexed user?
      // Если user НЕ indexed в вашем событии, достаньте из data (input) через decode.
      // В нашем предположении user indexed -> topics[1]
      const set = new Set<string>();
      for (const log of data.result) {
        // topic1 — это адрес в виде 32-байт хекса, последние 20 байт — адрес
        if (Array.isArray(log.topics) && log.topics.length >= 2) {
          const t1: string = log.topics[1]; // 0x000...<20 bytes address>
          const addr = "0x" + t1.slice(-40);
          set.add(ethers.getAddress(addr));
        } else {
          // если не индексирован, придётся декодить log.data:
          // const iface = new ethers.Interface([`event ${DEPOSIT_SIG}`]);
          // const decoded = iface.decodeEventLog(DEPOSIT_SIG, log.data, log.topics);
          // set.add(ethers.getAddress(decoded.user));
        }
      }
      uniqueStakers = set.size;
    }

    return NextResponse.json({
      uniqueStakers,
      pools,
      updatedAt: new Date().toISOString()
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "failed to load staking stats" },
      { status: 500 }
    );
  }
}
