// app/api/botrix/redeem/route.ts
import { NextRequest, NextResponse } from "next/server";

const PUB_BASE = process.env.NEXT_PUBLIC_BOTRIX_PUBLIC_BASE || "https://botrix.live";
const PLATFORM = process.env.NEXT_PUBLIC_BOTRIX_PLATFORM || "kick";
const BID = process.env.BOTRIX_BID_SECRET;
const WEBHOOK = process.env.REDEEM_WEBHOOK_URL;
const INCLUDE_BAL = (process.env.REDEEM_INCLUDE_BALANCE_AFTER || "false").toLowerCase() === "true";

// we’ll reuse our public leaderboard endpoint via our own points proxy to fetch post-balance
async function fetchPointsForUsername(username: string) {
  try {
    const base = process.env.NEXT_PUBLIC_SITE_ORIGIN || ""; // optional override
    const origin = base || (typeof window === "undefined" ? "http://localhost" : window.location.origin);
    const res = await fetch(`${origin}/api/botrix/points?search=${encodeURIComponent(username)}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    return Number(data?.points ?? 0);
  } catch {
    return null;
  }
}

type Body = {
  uid: string;              // Kick user id (from your OAuth)
  points: number;           // Item price in points
  username?: string;        // Kick username (for nicer webhook text)
  itemId?: string | number; // optional, for the receipt
  itemName?: string;        // optional, for the receipt title
};

export async function POST(req: NextRequest) {
  try {
    if (!BID) {
      return NextResponse.json({ error: "Missing BOTRIX_BID_SECRET" }, { status: 500 });
    }

    const body = (await req.json()) as Body;
    if (!body?.uid || !Number.isFinite(body?.points)) {
      return NextResponse.json({ error: "uid and points are required" }, { status: 400 });
    }

    // 1) Perform the Botrix subtraction
    const url = `${PUB_BASE}/api/extension/substractPoints?uid=${encodeURIComponent(
      body.uid
    )}&platform=${encodeURIComponent(PLATFORM)}&points=${encodeURIComponent(body.points)}&bid=${encodeURIComponent(BID)}`;
    console.log(url)
    const res = await fetch(url, { method: "GET", cache: "no-store" });
    const text = await res.text();
    if (!res.ok) {
      // notify failure (optional)
      await postWebhook({
        title: "Redeem Failed",
        color: 0xff5555,
        fields: [
          { name: "Username", value: body.username || "unknown", inline: true },
          { name: "Kick UID", value: body.uid, inline: true },
          { name: "Item", value: body.itemName ? `${body.itemName}` : "(n/a)", inline: true },
          { name: "Points", value: `${body.points}`, inline: true },
          { name: "Upstream Status", value: `${res.status}`, inline: true },
        ],
        footer: "Botrix redeem",
      });
      return NextResponse.json({ ok: false, status: res.status, body: text }, { status: res.status });
    }

    // 2) (optional) fetch updated balance to include in the receipt
    let newBalance: number | null = null;
    if (INCLUDE_BAL && body.username) {
      newBalance = await fetchPointsForUsername(body.username);
    }

    // 3) Post a success webhook
    await postWebhook({
      title: "Redeem Success",
      color: 0x57f287, // Discord green
      fields: [
        { name: "Username", value: body.username || "unknown", inline: true },
        { name: "Kick UID", value: body.uid, inline: true },
        { name: "Item", value: body.itemName ? `${body.itemName}` : "(n/a)", inline: true },
        { name: "Points Spent", value: `${body.points}`, inline: true },
        ...(newBalance != null ? [{ name: "New Balance", value: `${newBalance} pts`, inline: true }] : []),
      ],
      footer: "Botrix redeem",
    });

    return NextResponse.json({ ok: true, body: text, newBalance });
  } catch (e: any) {
    // notify exception (optional)
    await postWebhook({
      title: "Redeem Error",
      color: 0xffa500,
      fields: [{ name: "Error", value: e?.message || "Unknown error" }],
      footer: "Botrix redeem",
    });
    return NextResponse.json({ error: e?.message || "Unknown error" }, { status: 500 });
  }
}

async function postWebhook(opts: {
  title: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: string;
}) {
  console.log(  {
            title: opts.title,
            color: opts.color ?? 0x5865f2,
            fields: opts.fields,
            timestamp: new Date().toISOString(),
            footer: opts.footer ? { text: opts.footer } : undefined,
          },)
  if (!WEBHOOK) return;
  try {
    // Discord-style embed; Slack will still show a readable JSON fallback
    await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: opts.title,
            color: opts.color ?? 0x5865f2,
            fields: opts.fields,
            timestamp: new Date().toISOString(),
            footer: opts.footer ? { text: opts.footer } : undefined,
          },
        ],
      }),
    });
  } catch {
    // swallow webhook errors—don’t fail the redeem if notifications break
  }
}
