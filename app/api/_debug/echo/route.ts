// app/api/_debug/echo/route.ts
import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";

async function readText(req: NextRequest) {
  try { return await req.text(); } catch { return ""; }
}

export async function POST(req: NextRequest) {
  const txt = await readText(req);
  return NextResponse.json({
    ok: true,
    method: "POST",
    headers: Object.fromEntries(req.headers),
    body: txt,
  });
}
export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, method: "GET" });
}
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS, HEAD",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  }});
}
export async function HEAD() { return new Response(null, { status: 204 }); }
