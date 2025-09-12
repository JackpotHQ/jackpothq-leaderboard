// lib/botrix.ts
export type ShopItem = {
  id: string | number;
  name: string;
  price: number;        // in points
  image?: string;       // optional
  badge?: string;       // optional
  [k: string]: any;
};

export async function getShopItems(): Promise<ShopItem[]> {
  const res = await fetch("/api/botrix/items", { cache: "no-store" });
  if (!res.ok) throw new Error(`Items ${res.status}`);
  const data = await res.json();
  // Normalize a bit
  const items: ShopItem[] = (Array.isArray(data) ? data : data?.items || []).map((it: any) => ({
    id: it?.id ?? it?._id ?? cryptoRandomId(),
    name: it?.name ?? it?.title ?? "Item",
    price: Number(it?.price ?? it?.points ?? 0),
    image: it?.image ?? it?.img ?? "/logo.png",
    badge: it?.badge ?? undefined,
    ...it,
  }));
  return items;
}

export async function getUserPoints(username?: string): Promise<number> {
  const qs = username ? `?search=${encodeURIComponent(username)}` : "";
  const res = await fetch(`/api/botrix/points${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Points ${res.status}`);
  const data = await res.json();
  return Number(data?.points ?? 0);
}

export async function redeem(uid: string, points: number): Promise<boolean> {
  const res = await fetch("/api/botrix/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, points }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data?.ok);
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

