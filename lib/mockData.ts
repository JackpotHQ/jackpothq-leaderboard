// lib/mockData.ts

// ===== Leaderboard mock rows =====
export const rows = [
  { place: 1, user: 'LuckyAce',   wagered: 12800, reward: 6400 },
  { place: 2, user: 'SpinKing',   wagered: 9400,  reward: 4700 },
  { place: 3, user: 'HighRoll',   wagered: 7300,  reward: 3650 },
  { place: 4, user: 'BetMaster',  wagered: 5200,  reward: 2600 },
  { place: 5, user: 'JackShot',   wagered: 4100,  reward: 2050 },
  { place: 6, user: 'CashLord',   wagered: 3300,  reward: 1650 },
  { place: 7, user: 'RiskTaker',  wagered: 2900,  reward: 1450 },
  { place: 8, user: 'ChipBank',   wagered: 2500,  reward: 1250 },
  { place: 9, user: 'SlotHero',   wagered: 2100,  reward: 1050 },
  { place: 10,user: 'DiceRoll',   wagered: 1800,  reward: 900  },
];

// ===== Store mock items =====
export type StoreItem = {
  id: number;
  name: string;
  price: string;        // display string (e.g., "$9.99" or "500 pts")
  image: string;        // path or URL (placeholder ok)
  type: "cash" | "points";
  badge?: string;       // e.g., "Popular", "New", "Best Value"
};

export const storeItems: StoreItem[] = [
  // point packs
  { id: 1, name: "100 Points Pack",   price: "100 pts",  image: "/logo.png", type: "points" },
  { id: 2, name: "250 Points Pack",   price: "250 pts",  image: "/logo.png", type: "points", badge: "Popular" },
  { id: 3, name: "500 Points Pack",   price: "500 pts",  image: "/logo.png", type: "points", badge: "Best Value" },
  { id: 4, name: "1,000 Points Pack", price: "1,000 pts",image: "/logo.png", type: "points" },
  { id: 5, name: "5,000 Points Pack", price: "5,000 pts",image: "/logo.png", type: "points", badge: "Limited" },

  // perks / cosmetic rewards
  { id: 6, name: "VIP Flair (30d)",   price: "750 pts",  image: "/logo.png", type: "points" },
  { id: 7, name: "Custom Chat Color", price: "1,200 pts",image: "/logo.png", type: "points" },
  { id: 8, name: "Profile Badge",     price: "2,500 pts",image: "/logo.png", type: "points" },

  // experiential / bigger rewards
  { id: 9,  name: "Monthly Raffle Entry", price: "3,000 pts", image: "/logo.png", type: "points" },
  { id: 10, name: "Exclusive Discord Role", price: "4,500 pts", image: "/logo.png", type: "points" },
  { id: 11, name: "Mystery Crate",    price: "7,500 pts", image: "/logo.png", type: "points", badge: "Hot" },
  { id: 12, name: "Lifetime VIP Upgrade", price: "25,000 pts", image: "/logo.png", type: "points", badge: "Legendary" },
];
