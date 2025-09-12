'use client';

import { useEffect, useMemo, useState } from "react";
import MedalCards from "@/components/MedalCards";
import LeaderboardTable from "@/components/LeaderboardTable";
import { fetchAffiliateStats, currentWeekWindowUtc } from "@/lib/affiliate";
import { getPrizes, prizeForPlace, totalPrize } from "@/lib/prizes";

const RAINBET_URL = process.env.NEXT_PUBLIC_RAINBET_CODE_URL || "#";

// Table row shape your component expects
type Row = { place: number; user: string; wagered: number; reward: number };

const USE_SLOTS_AND_HOUSE_ONLY = true; // "slots,provably fair" per rules

// Live countdown to an ISO end time (UTC)
function useCountdown(endIso: string) {
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const end = useMemo(() => new Date(endIso), [endIso]);
  const ms = Math.max(0, end.getTime() - now.getTime());
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const compact = days > 0
    ? `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return { label: compact };
}

export default function LeaderboardsPage() {
  const [showRules, setShowRules] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Weekly UTC window
  const { start, end } = currentWeekWindowUtc();
  const { label: countdownLabel } = useCountdown(end);

  // Prizes from env
  const prizes = useMemo(() => getPrizes(), []);
  const prizePool = useMemo(() => totalPrize(prizes), [prizes]);

  // Fetch live affiliate stats (no mock fallback)
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const aff = await fetchAffiliateStats({
          startDate: start,
          endDate: end,
          categories: USE_SLOTS_AND_HOUSE_ONLY ? "slots,provably fair" : undefined,
        });

        const sorted = [...aff].sort(
          (a, b) => (b.weightedWagered ?? 0) - (a.weightedWagered ?? 0)
        );

        const mapped: Row[] = sorted.map((r, i) => ({
          place: i + 1,
          user: r.username || r.uid.slice(0, 6),
          // show weighted amount per rules
          wagered: Math.round((r.weightedWagered ?? 0) * 100) / 100,
          // reward from prizes env, 0 if not provided for that place
          reward: prizeForPlace(i + 1, prizes),
        }));

        setRows(mapped);
        setError(null);
      } catch (e) {
        console.error(e);
        setError("Leaderboard is temporarily unavailable. Please try again later.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [start, end, prizes]);

  // Top 3 for MedalCards (only when data is present)
  const top3 = rows.slice(0, 3).map((r, i) => ({
    rank: (i + 1) as 1 | 2 | 3,
    label: 'WAGERED',
    user: r.user,
    wagered: r.wagered,
  }));

  return (
    <section className="pb-20">
      {/* Header with CODE button + RULES toggle (exact structure preserved) */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-4">
          {/* CODE: JACKPOTHQ */}
          <a
            href={RAINBET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2 font-extrabold
                       text-white border border-[var(--accent)]/80
                       bg-black/60 hover:bg-black/70 transition
                       shadow-[0_0_0_2px_rgba(139,59,255,0.15)_inset,0_8px_32px_rgba(109,43,255,0.18)]"
          >
            CODE: JACKPOTHQ
          </a>

          {/* RULES */}
          <button
            onClick={() => setShowRules(v => !v)}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2 font-extrabold
                       text-black bg-gradient-to-b from-[#ffd54a] to-[#f2b320]
                       shadow-[0_10px_24px_rgba(242,179,32,0.35)]
                       hover:brightness-110 transition"
            aria-expanded={showRules}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.2"/>
              <path d="M12 8.25h.01M11 11h2v6h-2z" stroke="currentColor" strokeWidth="2" />
            </svg>
            RULES
          </button>
        </div>
      </div>

      {/* Collapsible rules card (content updated to your latest rules) */}
      {showRules && (
        <div
          className="mb-8 mx-auto max-w-2xl rounded-2xl border border-white/10 p-5
                     bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.012))]
                     shadow-[0_20px_60px_rgba(5,3,10,0.6)]"
        >
          <h3 className="font-extrabold text-lg mb-3" style={{ color: "var(--accent)" }}>
            Wager Race — Rules
          </h3>
          <ul className="space-y-2 text-sm text-white/80 text-left">
            <li><span className="text-white font-semibold">1.</span> Wager abuse to gain an unfair advantage will lead to your account being removed from the leaderboard.</li>
            <li><span className="text-white font-semibold">2.</span> All prizes are paid out within <strong>24–48 hours</strong> after the competition ends.</li>
            <li><span className="text-white font-semibold">3.</span> Prizes are awarded as an instantly withdrawable <strong>Tip</strong> on Roobet.</li>
            <li><span className="text-white font-semibold">4.</span> Affiliate code <strong>JACKPOTHQ</strong> is counting towards the leaderboard.</li>
            <li>
              <span className="text-white font-semibold">5.</span> Your wagers on Roobet will count towards the leaderboard at the following weights based on game RTP:
              <ul className="mt-1 ml-6 list-disc space-y-1 text-white/70">
                <li>RTP ≤ <strong>97%</strong> → <strong>100%</strong> of wagered counts</li>
                <li>RTP &gt; <strong>97%</strong> → <strong>50%</strong> of wagered counts</li>
                <li>RTP ≥ <strong>98%</strong> → <strong>10%</strong> of wagered counts</li>
              </ul>
            </li>
            <li><span className="text-white font-semibold">6.</span> Only <strong>Slots</strong> and <strong>House Games</strong> count (<strong>Dice excluded</strong>).</li>
          </ul>
        </div>
      )}

      {/* Medal cards from live data */}
      {rows.length > 0 && <MedalCards cards={top3} />}

      {/* Prize Pool / Payouts / Countdown bar — now BELOW the MedalCards */}
     

      {/* Leaderboard table (only real data, no mock) */}
      {loading && <div className="mb-4 text-center text-white/70">Loading leaderboard…</div>}
      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-100 p-3 text-sm text-center">
          {error}
        </div>
      )}
      {!loading && !error && rows.length === 0 && (
        <div className="mb-4 text-center text-white/60">No leaderboard data for this week.</div>
      )}
      {rows.length > 0 && <LeaderboardTable rows={rows} />}

       {/* Prize Pool / Payouts / Countdown bar — below the MedalCards */}
      {!loading && !error && (
        <div className="mt-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[rgba(255,255,255,0.04)] p-3">
          {/* Countdown on the left */}
          <div className="text-white text-sm font-semibold whitespace-nowrap">
            Resets in:&nbsp;
            <span
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1"
              title={`Week window (UTC): ${new Date(start).toUTCString()} → ${new Date(end).toUTCString()}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" className="opacity-80" aria-hidden="true">
                <path fill="currentColor" d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1Zm0 20a9 9 0 1 1 9-9a9.01 9.01 0 0 1-9 9Zm.5-14h-1v6l5 3l.5-.866l-4.5-2.7Z"/>
              </svg>
              {countdownLabel}
            </span>
          </div>

          {/* Prize pool + payouts on the right */}
          <div className="flex flex-col items-end text-right gap-1">
            <div className="text-white/80 text-sm">
              Prize Pool:&nbsp;
              <span className="font-extrabold">${prizePool.toLocaleString()}</span>
            </div>
            <div className="text-white/60 text-xs flex flex-wrap justify-end">
              Payouts:&nbsp;
              {prizes.length > 0
                ? prizes.map((p, idx) => (
                    <span key={idx} className="ml-2 whitespace-nowrap">
                      #{idx + 1}: ${p.toLocaleString()}
                    </span>
                  ))
                : <span className="italic ml-1">No prizes configured</span>}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
