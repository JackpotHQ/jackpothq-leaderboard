// app/api/botrix/points/route.ts
import { NextRequest, NextResponse } from "next/server";

const PUB_BASE = process.env.NEXT_PUBLIC_BOTRIX_PUBLIC_BASE || "https://botrix.live";
const PLATFORM = process.env.NEXT_PUBLIC_BOTRIX_PLATFORM || "kick";
const USER = process.env.NEXT_PUBLIC_BOTRIX_USER;

export async function GET(req: NextRequest) {
  try {
    if (!USER) return NextResponse.json({ error: "Missing NEXT_PUBLIC_BOTRIX_USER" }, { status: 500 });
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || ""; // kick username
    // If no search param, return top list (can be useful for debugging/preview)
    const url = search
      ? `${PUB_BASE}/api/public/leaderboard?platform=${encodeURIComponent(PLATFORM)}&user=${encodeURIComponent(USER)}&search=${encodeURIComponent(search)}`
      : `${PUB_BASE}/api/public/leaderboard?platform=${encodeURIComponent(PLATFORM)}&user=${encodeURIComponent(USER)}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json({ error: "Upstream error", status: res.status, body }, { status: res.status });
    }
    const data = await res.json();

    // Try to find a single entry for the user and surface { points, username, position }
    const all: any[] = Array.isArray(data) ? data : (Array.isArray(data?.entries) ? data.entries : []);
    const entry =
      (search
        ? all.find(e =>
            (e?.username || e?.name || "").toString().toLowerCase() === search.toLowerCase()
          ) || all[0]
        : all[0]) || null;

    const points = Number(
      entry?.points ?? entry?.balance ?? entry?.score ?? 0
    );

    return NextResponse.json({ points, entry, raw: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}
