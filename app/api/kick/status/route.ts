import { NextResponse } from "next/server";

const FALLBACKS = (slug: string) => [
  `https://api.kick.com/public/v2/channels/${slug}`,
  `https://api.kick.com/public/v1/channels/${slug}`,
  `https://kick.com/api/v2/channels/${slug}`, // legacy
];

function pickIsLive(json: any): boolean | null {
  if (json?.data?.livestream?.is_live != null) return !!json.data.livestream.is_live;
  if (json?.data?.livestream === null) return false;
  if (json?.livestream?.is_live != null) return !!json.livestream.is_live;
  if (json?.is_live != null) return !!json.is_live;
  return null;
}

export async function GET() {
  const override = process.env.KICK_FORCE_ONLINE === "1";
  if (override) return NextResponse.json({ online: true, source: "override" });

  const slug = process.env.KICK_CHANNEL?.trim();

  // Fallback: channel detail endpoints by slug (don’t need auth)
  if (slug) {
    for (const url of FALLBACKS(slug)) {
      try {
        const r = await fetch(url, { cache: "no-store" });
        if (!r.ok) continue;
        const ct = r.headers.get("content-type") || "";
        // if (!ct.includes("application/json")) continue;
        const j = await r.json();
        const live = pickIsLive(j);
        if (live !== null) {
          return NextResponse.json({ online: live, source: url, checkedAt: new Date().toISOString() });
        }
      } catch {}
    }
  }

  // Last resort
  return NextResponse.json({ online: false, source: "unknown", checkedAt: new Date().toISOString() });
}
