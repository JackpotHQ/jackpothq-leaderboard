// app/api/botrix/items/route.ts
import { NextResponse } from "next/server";

const PUB_BASE = process.env.NEXT_PUBLIC_BOTRIX_PUBLIC_BASE || "https://botrix.live";
const PLATFORM = process.env.NEXT_PUBLIC_BOTRIX_PLATFORM || "kick";
const USER = process.env.NEXT_PUBLIC_BOTRIX_USER;

export async function GET() {
  try {
    if (!USER) return NextResponse.json({ error: "Missing NEXT_PUBLIC_BOTRIX_USER" }, { status: 500 });
    const url = `${PUB_BASE}/api/public/shop/items?u=${encodeURIComponent(USER)}&platform=${encodeURIComponent(PLATFORM)}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: "Upstream error", status: res.status, body }, { status: res.status });
    }
    const items = await res.json();
    return NextResponse.json(items);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
