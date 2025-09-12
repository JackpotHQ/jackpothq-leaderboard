'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchAffiliateStats } from '@/lib/affiliate';
import { computeVip } from '@/lib/vip';

type VIPModalProps = {
  open: boolean;
  onClose: () => void;
};

const USE_SLOTS_AND_HOUSE_ONLY = true; // categories=slots,provably fair

export default function VIPModal({ open, onClose }: VIPModalProps) {
  const [usernameInput, setUsernameInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // fetched row
  const [player, setPlayer] = useState<{
    username: string;
    weightedWagered: number;
    wagered: number;
    favoriteGameTitle?: string;
  } | null>(null);

  // derive VIP from lifetime weighted (no date range sent => all-time)
  const vip = useMemo(() => {
    if (!player) return null;
    return computeVip(Number(player.weightedWagered || 0));
  }, [player]);

  useEffect(() => {
    if (!open) {
      // reset on close
      setUsernameInput('');
      setPlayer(null);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  async function onLookup(e?: React.FormEvent) {
    e?.preventDefault();
    const uq = usernameInput.trim();
    if (!uq) return;
    try {
      setLoading(true);
      setError(null);
      // All-time; limit to slots + house (dice excluded)
      const data = await fetchAffiliateStats({
        categories: USE_SLOTS_AND_HOUSE_ONLY ? 'slots,provably fair' : undefined,
      });
      // find the user in the returned list (case-insensitive)
      const row = data.find(r => (r.username || '').toLowerCase() === uq.toLowerCase());
      if (!row) {
        setPlayer(null);
        setError('No stats found for that username.');
      } else {
        setPlayer({
          username: row.username,
          weightedWagered: Number(row.weightedWagered ?? 0),
          wagered: Number(row.wagered ?? 0),
          favoriteGameTitle: row.favoriteGameTitle,
        });
      }
    } catch (err: any) {
      setError('Could not fetch stats right now.');
      setPlayer(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-[rgba(20,20,28,0.98)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">VIP Status</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/60 hover:text-white focus:outline-none"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M18.3 5.7L12 12l6.3 6.3l-1.4 1.4L10.6 13.4L4.3 19.7L2.9 18.3L9.2 12L2.9 5.7L4.3 4.3l6.3 6.3l6.3-6.3z"/>
            </svg>
          </button>
        </div>

        {/* step 1: ask for username */}
        {!player && (
          <form onSubmit={onLookup} className="space-y-3">
            <p className="text-sm text-white/70">
              Enter your <span className="font-semibold text-white">Roobet username</span> to view your VIP tier.
            </p>
            <input
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[var(--accent)]"
              placeholder="e.g. RooLegend42"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              disabled={loading}
            />
            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-xs text-red-200">
                {error}
              </div>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !usernameInput.trim()}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 font-bold text-black hover:brightness-110 disabled:opacity-50"
              >
                {loading ? 'Checking…' : 'Check VIP'}
              </button>
            </div>
          </form>
        )}

        {/* step 2: show VIP results */}
        {player && vip && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-white/60">Roobet Username</div>
                  <div className="text-white font-semibold">{player.username}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/60">Lifetime Points</div>
                  <div className="text-white font-extrabold">{Math.round(player.weightedWagered).toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 p-4 bg-[rgba(255,255,255,0.03)]">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm text-white/70">Your Tier</div>
                <div className="text-lg font-extrabold text-white">{vip.tierName}</div>
              </div>

              {/* progress bar */}
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${vip.progress0to1 * 100}%`,
                    background:
                      'linear-gradient(90deg, rgba(255,213,74,1) 0%, rgba(242,179,32,1) 100%)',
                  }}
                />
              </div>

              <div className="mt-2 flex items-center justify-between text-xs text-white/60">
                <div>Tier Start: {vip.currentAt.toLocaleString()} pts</div>
                <div>
                  {vip.nextAt > vip.currentAt
                    ? <>Next ({vip.nextAt.toLocaleString()} pts)</>
                    : <>Max Tier</>}
                </div>
              </div>
            </div>

            {/* small details row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Raw Wagered (all-time)</div>
                <div className="text-white font-semibold">{Math.round(player.wagered).toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="text-xs text-white/60">Favorite Game</div>
                <div className="text-white font-semibold">{player.favoriteGameTitle || '—'}</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => { setPlayer(null); setError(null); setUsernameInput(''); }}
                className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white hover:bg-white/10"
              >
                Check another
              </button>
              <button
                onClick={onClose}
                className="rounded-lg bg-[var(--accent)] px-4 py-2 font-bold text-black hover:brightness-110"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
