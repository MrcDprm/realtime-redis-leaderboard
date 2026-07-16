import { useEffect, useRef, useState } from 'react';
import { Crown, Medal, Trophy } from 'lucide-react';

function RankIcon({ rank }) {
  if (rank === 1) return <Crown className="h-5 w-5 text-neon-cyan" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-silver-300" />;
  if (rank === 3) return <Trophy className="h-5 w-5 text-neon-purple" />;
  return (
    <span className="font-display text-sm text-silver-500">
      {String(rank).padStart(2, '0')}
    </span>
  );
}

export default function Leaderboard({ entries = [], highlightUserId }) {
  const prevMapRef = useRef(new Map());
  const [glowIds, setGlowIds] = useState(() => new Set());

  useEffect(() => {
    const prev = prevMapRef.current;
    const changed = new Set();

    for (const entry of entries) {
      const prior = prev.get(entry.userId);
      if (!prior || prior.score !== entry.score || prior.rank !== entry.rank) {
        if (prev.size > 0) {
          changed.add(entry.userId);
        }
      }
    }

    prevMapRef.current = new Map(entries.map((e) => [e.userId, { score: e.score, rank: e.rank }]));

    if (changed.size === 0) return undefined;

    setGlowIds(changed);
    const timer = setTimeout(() => setGlowIds(new Set()), 1200);
    return () => clearTimeout(timer);
  }, [entries]);

  return (
    <section className="glass-panel animate-fade-up p-5 sm:p-7">
      <div className="relative mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="section-label">Live Feed</p>
          <h2 className="mt-1 font-display text-2xl font-bold tracking-wide text-silver-300 sm:text-3xl">
            Global Leaderboard
          </h2>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-3 py-1">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-blue opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-blue" />
          </span>
          <span className="font-display text-[10px] uppercase tracking-widest text-neon-blue">Realtime</span>
        </div>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-silver-400/25 bg-gunmetal-950/50 px-6 py-16 text-center">
          <p className="font-display text-sm tracking-widest text-silver-500">No scores yet</p>
          <p className="mt-2 font-body text-silver-400">Submit a score to claim the first rank.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {entries.map((entry) => {
            const isSelf = entry.userId === highlightUserId;
            const isGlowing = glowIds.has(entry.userId);
            const podium =
              entry.rank === 1
                ? 'border-neon-cyan/40 shadow-glow-cyan'
                : entry.rank === 2
                  ? 'border-silver-300/35'
                  : entry.rank === 3
                    ? 'border-neon-purple/40 shadow-glow-purple'
                    : 'border-silver-400/15';

            return (
              <li
                key={entry.userId}
                className={[
                  'relative flex items-center gap-4 overflow-hidden rounded-xl border bg-gunmetal-900/70 px-4 py-3 transition',
                  podium,
                  isSelf ? 'ring-1 ring-neon-blue/50' : '',
                  isGlowing ? 'animate-glow-pulse animate-rank-shift' : '',
                ].join(' ')}
              >
                <div className="flex w-10 shrink-0 items-center justify-center">
                  <RankIcon rank={entry.rank} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base font-semibold tracking-wide text-silver-300">
                    {entry.username}
                    {isSelf && (
                      <span className="ml-2 font-body text-xs font-medium text-neon-blue">YOU</span>
                    )}
                  </p>
                  <p className="font-body text-xs uppercase tracking-widest text-silver-500">
                    Rank #{entry.rank}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-xl font-bold tabular-nums text-neon-blue">
                    {entry.score.toLocaleString()}
                  </p>
                  <p className="font-body text-[10px] uppercase tracking-widest text-silver-500">pts</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
