// lib/vip.ts
export function getVipThresholds(): number[] {
  const raw = process.env.NEXT_PUBLIC_VIP_THRESHOLDS?.trim();
  if (!raw) return [0, 2500, 10000, 50000]; // Bronze, Silver, Gold, Diamond
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) return arr.map(Number).filter(n => Number.isFinite(n)).sort((a,b)=>a-b);
  } catch {}
  return raw.split(/[,\s]+/).map(s=>Number(s)).filter(n=>Number.isFinite(n)).sort((a,b)=>a-b);
}

export function getVipNames(): string[] {
  const raw = process.env.NEXT_PUBLIC_VIP_TIER_NAMES?.trim();
  if (!raw) return ["Bronze","Silver","Gold","Diamond"];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length) return arr.map(String);
  } catch {}
  const parts = raw.split(/[,\s]+/).map(s=>s.trim()).filter(Boolean);
  return parts.length ? parts : ["Bronze","Silver","Gold","Diamond"];
}

/** Given lifetime weighted points (number), return {tierIndex, tierName, nextAt, progress0to1} */
export function computeVip(lifetime: number) {
  const thresholds = getVipThresholds();
  const names = getVipNames();
  // find highest threshold <= lifetime
  let idx = 0;
  for (let i=0;i<thresholds.length;i++) {
    if (lifetime >= thresholds[i]) idx = i;
  }
  const name = names[idx] ?? `Tier ${idx+1}`;
  const currAt = thresholds[idx] ?? 0;
  const nextIdx = Math.min(idx+1, thresholds.length-1);
  const nextAt = thresholds[nextIdx] ?? currAt;
  const span = Math.max(1, nextAt - currAt); // avoid divide-by-zero at max tier
  const prog = Math.max(0, Math.min(1, (lifetime - currAt) / span));
  return { tierIndex: idx, tierName: name, currentAt: currAt, nextAt, progress0to1: prog, thresholds, names };
}
