import { Activity, Hash, Zap } from 'lucide-react';

export default function PersonalPanel({ rank, bestScore, username }) {
  return (
    <section className="glass-panel animate-fade-up p-5 sm:p-6">
      <p className="section-label">Personal Panel</p>
      <h2 className="mt-1 font-display text-xl font-bold tracking-wide text-silver-300">
        Your Standing
      </h2>
      <p className="mt-1 font-body text-sm text-silver-400">
        Rank pulled live from Redis <code className="text-neon-cyan">ZREVRANK</code>
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-silver-400/20 bg-gunmetal-950/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-neon-purple">
            <Hash className="h-4 w-4" />
            <span className="font-display text-[10px] uppercase tracking-widest">Exact Rank</span>
          </div>
          <p className="font-display text-3xl font-bold text-silver-300">
            {rank != null ? `#${rank}` : '—'}
          </p>
        </div>

        <div className="rounded-xl border border-silver-400/20 bg-gunmetal-950/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-neon-blue">
            <Zap className="h-4 w-4" />
            <span className="font-display text-[10px] uppercase tracking-widest">Best Score</span>
          </div>
          <p className="font-display text-3xl font-bold tabular-nums text-neon-blue">
            {bestScore != null ? bestScore.toLocaleString() : '—'}
          </p>
        </div>

        <div className="rounded-xl border border-silver-400/20 bg-gunmetal-950/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-neon-cyan">
            <Activity className="h-4 w-4" />
            <span className="font-display text-[10px] uppercase tracking-widest">Operator</span>
          </div>
          <p className="truncate font-display text-2xl font-bold text-neon-cyan">{username}</p>
        </div>
      </div>
    </section>
  );
}
