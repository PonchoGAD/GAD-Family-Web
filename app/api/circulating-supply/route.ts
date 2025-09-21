import { NextResponse } from 'next/server';

/**
 * GAD (BEP-20) on BSC
 */
const CONTRACT = '0x858bab88A5b8D7F29a40380C5F2D8d0b8812FE62';
const DECIMALS = 18;
const BSC_API = 'https://api.bscscan.com/api';

/**
 * ВАЖНО: сюда добавляем ТОЛЬКО нециркулирующие адреса.
 * Пары Pancake V2 (GAD/BNB, GAD/USDT) сюда НЕ включаем — это обращение.
 */
const NON_CIRC_ADDRESSES: string[] = [
  '0x022cE9320Ea1AB7E03F14D8C0dBD14903A940F79', // airdrop v1
  '0x15Acdc7636FB0214aEfa755377CE5ab3a9Cc99BC', // airdrop v2 (подтверждён)
  '0x5C5c0b9eE66CC106f90D7b1a3727dc126C4eF188', // farming rewards
];

/**
 * Хелперы: безопасная работа с BigInt и конвертация в строку без потери точности
 */
function divBigIntToDecimalString(value: bigint, decimals: number): string {
  const base = BigInt(10) ** BigInt(decimals);
  const integer = value / base;       // целая часть
  // Возвращаем только целую часть, как требует CMC (plain numeric, без .)
  return integer.toString();
}

async function fetchJson(url: string) {
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function getTotalSupplyRaw(): Promise<bigint> {
  const url = `${BSC_API}?module=stats&action=tokensupply&contractaddress=${CONTRACT}&apikey=${process.env.BSC_API_KEY}`;
  const data = await fetchJson(url);
  if (data.status !== '1') throw new Error('BscScan tokensupply error');
  return BigInt(data.result); // в минимальных единицах
}

async function getBalanceRaw(addr: string): Promise<bigint> {
  const url = `${BSC_API}?module=account&action=tokenbalance&contractaddress=${CONTRACT}&address=${addr}&tag=latest&apikey=${process.env.BSC_API_KEY}`;
  const data = await fetchJson(url);
  if (data.status !== '1') return BigInt(0);
  return BigInt(data.result);
}

export async function GET() {
  try {
    // 1) общий supply (в минимальных единицах)
    const totalRaw = await getTotalSupplyRaw();

    // 2) сумма нециркулирующих остатков
    const nonCircBalances = await Promise.all(
      NON_CIRC_ADDRESSES.map(getBalanceRaw)
    );
    const nonCircRaw = nonCircBalances.reduce((a, b) => a + b, BigInt(0));

    // 3) circulating в минимальных единицах
    const circRaw = totalRaw - nonCircRaw;

    // 4) строка в токенах (целое число, без десятичных)
    const circTokensStr = divBigIntToDecimalString(circRaw, DECIMALS);

    return new NextResponse(circTokensStr, {
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (e) {
    // Fallback — отдаём 0, чтобы эндпоинт всегда отвечал числом
    return new NextResponse('0', { headers: { 'Content-Type': 'text/plain' } });
  }
}
