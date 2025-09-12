// lib/vipMock.ts

export type VipTier = {
  id: number;
  name: string;
  color: string;       // hex or css var-friendly
  threshold: number;   // lifetime points needed to reach tier
  multiplier: number;  // wager → points multiplier
  benefits: string[];
};

export const VIP_TIERS: VipTier[] = [
  { id: 1, name: "Bronze",  color: "#b45309", threshold: 0,     multiplier: 1.00, benefits: [
    "Bronze chat flair",
    "Monthly rakeback eligible",
  ]},
  { id: 2, name: "Silver",  color: "#9ca3af", threshold: 5_000, multiplier: 1.05, benefits: [
    "Silver badge",
    "Higher rakeback cap",
  ]},
  { id: 3, name: "Gold",    color: "#f59e0b", threshold: 15_000, multiplier: 1.10, benefits: [
    "Gold badge",
    "Priority giveaways",
  ]},
  { id: 4, name: "Diamond", color: "#22d3ee", threshold: 40_000, multiplier: 1.15, benefits: [
    "Diamond badge",
    "Exclusive drops & support lane",
  ]},
];

// Mock user VIP (swap with real data later)
export type VipUser = {
  username: string;
  pointsLifetime: number;
  pointsThisMonth: number;
};

/**
 * Given a user's lifetime points, compute current tier, next tier, and progress ratio (0..1).
 */
export function computeVip(user: VipUser) {
  const tiers = VIP_TIERS.slice().sort((a,b) => a.threshold - b.threshold);
  const current = [...tiers].reverse().find(t => user.pointsLifetime >= t.threshold) ?? tiers[0];
  const currentIndex = tiers.findIndex(t => t.id === current.id);
  const next = tiers[currentIndex + 1] ?? null;

    const ceil = next?.threshold ?? current.threshold;
    const ratio = ceil === 0 ? 1 : Math.min(1, user.pointsLifetime / ceil);

    return {
    currentTier: current,
    nextTier: next,
    progressRatio: ratio,
    progressText: next
        ? `${user.pointsLifetime.toLocaleString()} / ${ceil.toLocaleString()} pts`
        : "Max tier reached",
    };

}
