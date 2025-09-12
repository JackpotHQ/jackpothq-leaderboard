// app/api/affiliate-stats/route.ts
import { NextRequest, NextResponse } from "next/server";

const BASE = process.env.ROOBET_AFFILIATE_BASE || "https://roobetconnect.com";
const TOKEN = process.env.ROOBET_AFFILIATE_API_TOKEN;
const DEFAULT_UID = process.env.ROOBET_AFFILIATE_UID;

export async function GET(req: NextRequest) {
  try {
    if (!TOKEN) {
      return NextResponse.json({ error: "Missing ROOBET_AFFILIATE_API_TOKEN" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || DEFAULT_UID;
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const upstream = new URL("/affiliate/v2/stats", BASE);
    upstream.searchParams.set("userId", userId);

    for (const key of ["startDate", "endDate", "categories", "gameIdentifiers", "providers"]) {
      const v = searchParams.get(key);
      if (v) upstream.searchParams.set(key, v);
    }

    const res = await fetch(upstream.toString(), {
      headers: { Authorization: `Bearer ${TOKEN}` },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Upstream error", status: res.status, body: truncate(text) },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log(data)
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Unknown error" }, { status: 500 });
  }
}

function truncate(s: string, n = 2000) {
  return s.length > n ? s.slice(0, n) + "…(truncated)" : s;
}
