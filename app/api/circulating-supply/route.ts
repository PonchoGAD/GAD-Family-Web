import { NextResponse } from 'next/server';

// ====== CONFIG ======
const CONTRACT = '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62'; // GAD (BEP-20)
const DECIMALS = 18;
const BSC_API = 'https://api.bscscan.com/api';

// ✅ Твои V2 пары (pair contracts):
const PAIRS = [
  '0xFf74Ed4c41743a2ff1Cf2e3869E8617143cceBf1', // USDT/GAD V2
  '0x85c6BAFce7880484a417cb5d7067FDE843328997', // GAD/BNB  V2
];
// =====================

type BscscanBalanceResp = {
  status?: string;
  message?: string;
  result?: string;
};

async function balanceOf(addr: string): Promise<bigint> {
  const url = `${BSC_API}?module=account&action=tokenbalance&contractaddress=${CONTRACT}&address=${addr}&tag=latest&apikey=${process.env.BSC_API_KEY || ''}`;
  const r = await fetch(url, { cache: 'no-store' });
  const data = (await r.json().catch(() => null)) as unknown as BscscanBalanceResp | null;
  if (!data || data.status !== '1' || typeof data.result !== 'string') return 0n;
  try {
    return BigInt(data.result);
  } catch {
    return 0n;
  }
}

export async function GET() {
  try {
    const rawBalances = await Promise.all(PAIRS.map(balanceOf));
    const totalRaw = rawBalances.reduce((a, b) => a + b, 0n); // сумма GAD в LP (в 10^18)
    const tokens = Number(totalRaw) / 10 ** DECIMALS;         // в GAD
    const result = Math.floor(tokens);                        // CMC просит целое число
    return new NextResponse(String(result), { headers: { 'Content-Type': 'text/plain' } });
  } catch {
    // Если BscScan недоступен — не ломаемся.
    return new NextResponse('0', { headers: { 'Content-Type': 'text/plain' } });
  }
}
