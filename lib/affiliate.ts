// lib/affiliate.ts
export type AffiliateRow = {
  uid: string;
  username: string;
  wagered: number;
  weightedWagered: number; // authoritative for leaderboard
  favoriteGameId?: string;
  favoriteGameTitle?: string;
};

export type GetAffiliateStatsResponse = AffiliateRow[];

export type AffiliateQuery = {
  userId?: string;
  startDate?: string;      // ISO UTC
  endDate?: string;        // ISO UTC
  categories?: string;     // e.g. "slots,provably fair"
  gameIdentifiers?: string;
  providers?: string;
};

/**
 * Compute the current weekly window in UTC using LEADERBOARD_WEEK_END_DAY:
 *  - "saturday": week ends Sat 23:59:59Z (boundary = Sun 00:00:00Z)
 *  - "sunday":   week ends Sun 23:59:59Z (boundary = Mon 00:00:00Z)
 *
 * Returns { start, end } where start is the last boundary (inclusive),
 * and end is the next boundary (exclusive).
 */
export function currentWeekWindowUtc(now = new Date()): { start: string; end: string } {
  const endDayEnv = (process.env.NEXT_PUBLIC_LEADERBOARD_WEEK_END_DAY || process.env.LEADERBOARD_WEEK_END_DAY || "saturday")
    .toLowerCase()
    .trim();

  // boundary weekday: day at 00:00:00Z when a new week begins
  // saturday end → boundary = Sunday (0), sunday end → boundary = Monday (1)
  const boundaryWeekday = endDayEnv === "sunday" ? 1 : 0; // default "saturday" → 0 (Sunday)

  // build a UTC "now"
  const nowUtc = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds(),
    now.getUTCMilliseconds()
  ));

  // find last boundary at 00:00:00Z for boundaryWeekday
  const lastBoundary = new Date(nowUtc);
  // set time to midnight UTC
  lastBoundary.setUTCHours(0, 0, 0, 0);

  // Go back day-by-day until we hit the boundary weekday and ensure it's <= now
  while (lastBoundary.getUTCDay() !== boundaryWeekday || lastBoundary > nowUtc) {
    lastBoundary.setUTCDate(lastBoundary.getUTCDate() - 1);
    lastBoundary.setUTCHours(0, 0, 0, 0);
  }

  // next boundary is +7 days from last boundary
  const nextBoundary = new Date(lastBoundary);
  nextBoundary.setUTCDate(nextBoundary.getUTCDate() + 7);

  return { start: lastBoundary.toISOString(), end: nextBoundary.toISOString() };
}

export async function fetchAffiliateStats(q: AffiliateQuery = {}): Promise<GetAffiliateStatsResponse> {
  const base = typeof window === "undefined" ? "http://localhost" : window.location.origin;
  const url = new URL("/api/affiliate-stats", base);
  for (const [k, v] of Object.entries(q)) {
    if (v) url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) throw new Error(`Affiliate API ${res.status}`);
  return res.json();
}
