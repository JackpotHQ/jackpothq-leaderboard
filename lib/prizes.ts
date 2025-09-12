// lib/prizes.ts
export function getPrizes(): number[] {
  const raw = process.env.NEXT_PUBLIC_LEADERBOARD_PRIZES?.trim();
  if (!raw) return [];
  // Try JSON first
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.map(toNumberClean);
  } catch {}
  // Fallback: comma/space separated, allow $ and commas
  return raw.split(/[,\s]+/).filter(Boolean).map(toNumberClean);
}

function toNumberClean(x: unknown): number {
  if (typeof x === "number") return x;
  if (typeof x === "string") {
    const n = Number(x.replace(/[$,]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export function prizeForPlace(place: number, prizes: number[]): number {
  return prizes[place - 1] ?? 0;
}

export function totalPrize(prizes: number[]): number {
  return prizes.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
}
