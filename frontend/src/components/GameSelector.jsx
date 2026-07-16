import { useState } from 'react';
import { Gamepad2, Send } from 'lucide-react';

export default function GameSelector({
  games,
  selectedGameId,
  onSelectGame,
  onSubmitScore,
  submitting,
  error,
  success,
}) {
  const [manualScore, setManualScore] = useState('');

  const selected = games.find((g) => g.id === selectedGameId);

  const handleSimulate = () => {
    const score = Math.floor(Math.random() * 9000) + 1000;
    onSubmitScore(score);
  };

  const handleManual = (e) => {
    e.preventDefault();
    const score = Number(manualScore);
    if (!Number.isInteger(score) || score < 0) return;
    onSubmitScore(score);
  };

  return (
    <section className="glass-panel animate-fade-up p-5 sm:p-6">
      <p className="section-label">Mission Select</p>
      <h2 className="mt-1 font-display text-xl font-bold tracking-wide text-silver-300">
        Choose a Game
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {games.map((game) => {
          const active = game.id === selectedGameId;
          return (
            <button
              key={game.id}
              type="button"
              onClick={() => onSelectGame(game.id)}
              className={[
                'group relative overflow-hidden rounded-xl border text-left transition',
                active
                  ? 'border-neon-blue/50 shadow-glow'
                  : 'border-silver-400/20 hover:border-silver-300/40',
              ].join(' ')}
            >
              <div
                className="h-28 bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(10,11,13,0.95), rgba(10,11,13,0.35)), url(${game.coverImage})`,
                }}
              />
              <div className="bg-gunmetal-900/90 p-3">
                <p className="font-display text-sm font-semibold text-silver-300">{game.name}</p>
                <p className="mt-1 line-clamp-2 font-body text-xs text-silver-500">{game.description}</p>
              </div>
              {active && (
                <span className="absolute right-2 top-2 rounded bg-neon-blue/90 px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-wider text-void">
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-silver-400/20 bg-gunmetal-950/55 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Gamepad2 className="h-4 w-4 text-neon-purple" />
          <p className="font-display text-xs uppercase tracking-widest text-silver-400">
            Score Simulator {selected ? `— ${selected.name}` : ''}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            className="btn-neon flex-1"
            disabled={!selectedGameId || submitting}
            onClick={handleSimulate}
          >
            <Send className="h-4 w-4" />
            {submitting ? 'Transmitting…' : 'Simulate Score'}
          </button>

          <form onSubmit={handleManual} className="flex flex-1 gap-2">
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Manual score"
              className="metal-input"
              value={manualScore}
              onChange={(e) => setManualScore(e.target.value)}
              disabled={!selectedGameId || submitting}
            />
            <button
              type="submit"
              className="btn-ghost shrink-0"
              disabled={!selectedGameId || submitting || manualScore === ''}
            >
              Submit
            </button>
          </form>
        </div>

        {error && (
          <p className="mt-3 rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 font-body text-sm text-red-300">
            {error}
          </p>
        )}
        {success && (
          <p className="mt-3 rounded-lg border border-neon-cyan/30 bg-neon-cyan/10 px-3 py-2 font-body text-sm text-neon-cyan">
            {success}
          </p>
        )}
        <p className="mt-3 font-body text-xs text-silver-500">
          Anti-cheat: max 3 submissions per 10 seconds (Redis rate limit).
        </p>
      </div>
    </section>
  );
}
