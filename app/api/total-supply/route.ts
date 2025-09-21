import { NextResponse } from 'next/server';

const TOTAL_SUPPLY = 10_000_000_000_000; // 10T GAD (в токенах, не в wei)

export async function GET() {
  return new NextResponse(String(TOTAL_SUPPLY), {
    headers: { 'Content-Type': 'text/plain' },
  });
}
