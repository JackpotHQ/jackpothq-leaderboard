'use client';

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { getShopItems, getUserPoints, type ShopItem } from "@/lib/botrix";
import { useKickUser } from "@/components/useKickUser"; // <-- named import matches your hook
import Modal from '@/components/Modal';

export default function StorePage() {
  const { authed, user, isLoading } = useKickUser();
  const [modal, setModal] = useState<
    | null
    | {
        kind: 'success' | 'error';
        itemName?: string;
        pointsSpent?: number;
        newBalance?: number | null;
        message?: string;
      }
  >(null);

  // try to normalize the fields we need
  const kickId = useMemo(() => {
    // Kick often uses numeric ids; stringify for safety
    // !authed || !kickId || !canBuy(it) || busy === String(it.id)
    return user?.user_id != null ? String(user.user_id) : undefined;
  }, [user]);


  const kickUsername = useMemo(() => {
    // Prefer the real username/handle; fall back to common fields just in case
    return (
      user?.username ||
      user?.login ||
      user?.name ||
      user?.displayName ||
      undefined
    );
  }, [user]);

  const [items, setItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<number | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch items
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await getShopItems();
        setItems(data);
        setError(null);
      } catch {
        setError("Store is unavailable right now.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch user points once we have a username AND are authed
  useEffect(() => {
    (async () => {
      if (!authed || !kickUsername) {
        setPoints(null);
        return;
      }
      try {
        const p = await getUserPoints(kickUsername);
        setPoints(p);
      } catch {
        setPoints(null);
      }
    })();
  }, [authed, kickUsername]);

  const canBuy = (it: ShopItem) =>
    typeof points === "number" && Number.isFinite(points) && points >= (it.price || 0);

  async function onRedeem(it: ShopItem) {
  if (!authed || !kickId) {
    setModal({ kind: 'error', message: 'Please sign in with Kick to redeem.' });
    return;
  }
  if (!canBuy(it)) {
    setModal({ kind: 'error', message: 'Not enough points.' });
    return;
  }
  try {
    setBusy(String(it.id));
    const res = await fetch('/api/botrix/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: kickId,
        points: Number(it.price || 0),
        username: kickUsername,
        itemId: it.id,
        itemName: it.name,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data?.ok !== true) {
      setModal({
        kind: 'error',
        message:
          data?.reason ||
          'Redemption failed. Please try again or contact support.',
      });
      return;
    }

    // Refresh points to show updated balance
    let updated: number | null = null;
    if (kickUsername) {
      try {
        updated = await getUserPoints(kickUsername);
        setPoints(updated);
      } catch {
        // ignore
      }
    }

    setModal({
      kind: 'success',
      itemName: it.name,
      pointsSpent: Number(it.price || 0),
      newBalance: updated,
    });
  } finally {
    setBusy(null);
  }
}

  return (
    <section className="pb-20">
      <div className="mb-6">
        <h1
          className="text-[46px] font-extrabold tracking-wide"
          style={{ fontFamily: 'Orbitron, sans-serif', color: 'var(--accent)' }}
        >
          Store
        </h1>
        <p className="text-[color:var(--muted)]">Spend your Botrix points on exclusive rewards.</p>
        <div className="h-px bg-white/10 mt-4" />
      </div>

      {/* Balance / Auth state */}
      <div className="mb-4 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3 flex items-center justify-between">
        <div className="text-white/80 text-sm">
          {isLoading ? (
            <span className="text-white/60">Checking login…</span>
          ) : authed && kickUsername ? (
            <>Signed in as <span className="font-semibold">{kickUsername}</span></>
          ) : (
            <span className="text-white/60">Sign in with Kick to view your points and redeem items.</span>
          )}
        </div>
        <div className="text-white text-sm font-semibold">
          Points:&nbsp;
          <span className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 px-2 py-1">
            {authed && kickUsername ? (points ?? "—") : "—"}
          </span>
        </div>
      </div>

      {/* Errors / Loading */}
      {loading && <div className="text-center text-white/70 mb-4">Loading store…</div>}
      {error && (
        <div className="text-center text-red-200 bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
          {error}
        </div>
      )}

      {/* Items Grid */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <div
              key={String(it.id)}
              className="rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.02)] p-4 backdrop-blur"
            >
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                  <Image
                    src={it.image || "/logo.png"}
                    alt={it.name}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{it.name}</h3>
                    {it.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent)] text-black font-extrabold">
                        {it.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-white/70 text-xs">Points Item</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold">{Number(it.price || 0).toLocaleString()} pts</div>
                  <button
                    className="mt-2 text-sm px-3 py-1.5 rounded-lg bg-white text-black font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => onRedeem(it)}
                    disabled={!authed || !kickId || !canBuy(it) || busy === String(it.id)}
                    aria-busy={busy === String(it.id)}
                  >
                    {busy === String(it.id) ? "Processing…" : "Redeem"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchase Result Modal */}
<Modal
  open={!!modal}
  onClose={() => setModal(null)}
  title={modal?.kind === 'success' ? 'Purchase Complete' : 'Purchase Failed'}
  footer={
    <>
      {modal?.kind === 'success' && (
        <button
          onClick={() => setModal(null)}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 font-bold text-black hover:brightness-110"
        >
          Nice!
        </button>
      )}
      {modal?.kind === 'error' && (
        <button
          onClick={() => setModal(null)}
          className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10"
        >
          Close
        </button>
      )}
    </>
  }
>
  {modal?.kind === 'success' ? (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-emerald-400">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
        </svg>
        <span className="font-semibold">Redemption successful</span>
      </div>
      <div className="text-sm text-white/80">
        {modal.itemName ? (
          <>You redeemed <span className="font-semibold text-white">{modal.itemName}</span></>
        ) : (
          <>Your item was redeemed</>
        )}
        {typeof modal.pointsSpent === 'number' && (
          <> for <span className="font-semibold text-white">{modal.pointsSpent.toLocaleString()} pts</span>.</>
        )}
      </div>
      {typeof modal.newBalance === 'number' && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
          New balance:&nbsp;<span className="font-bold text-emerald-300">{modal.newBalance.toLocaleString()} pts</span>
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-red-300">
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="currentColor" d="M12 2a10 10 0 1010 10A10.011 10.011 0 0012 2Zm1 14h-2v-2h2Zm0-4h-2V6h2Z"/>
        </svg>
        <span className="font-semibold">Something went wrong</span>
      </div>
      <div className="text-sm text-white/80">
        {modal?.message || 'The purchase could not be completed.'}
      </div>
    </div>
  )}
</Modal>

    </section>
  );
}
