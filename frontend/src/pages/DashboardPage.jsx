import { useCallback, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Leaderboard from '../components/Leaderboard';
import PersonalPanel from '../components/PersonalPanel';
import GameSelector from '../components/GameSelector';
import { useAuth } from '../context/AuthContext';
import {
  fetchGames,
  fetchLeaderboard,
  fetchMyRank,
  getErrorMessage,
  submitScore,
} from '../api/client';
import { connectSocket } from '../socket';

export default function DashboardPage() {
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState({ rank: null, bestScore: null });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const data = await fetchMyRank();
      setMyRank({ rank: data.rank, bestScore: data.bestScore });
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const [gamesData, board] = await Promise.all([fetchGames(), fetchLeaderboard()]);
        if (cancelled) return;
        setGames(gamesData);
        if (gamesData[0]) setSelectedGameId(gamesData[0].id);
        setLeaderboard(board);
        await refreshMe();
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [refreshMe]);

  useEffect(() => {
    const socket = connectSocket();

    const onUpdate = (payload) => {
      if (payload?.leaderboard) {
        setLeaderboard(payload.leaderboard);
        refreshMe();
      }
    };

    socket.on('leaderboard_update', onUpdate);

    return () => {
      socket.off('leaderboard_update', onUpdate);
    };
  }, [refreshMe]);

  const handleSubmitScore = async (score) => {
    if (!selectedGameId) return;
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const data = await submitScore({ gameId: selectedGameId, score });
      if (data.leaderboard) setLeaderboard(data.leaderboard);
      await refreshMe();
      setSuccess(
        data.highScoreUpdated
          ? `New personal best: ${data.bestScore.toLocaleString()} pts`
          : `Recorded ${score.toLocaleString()} pts (best remains ${data.bestScore.toLocaleString()})`
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="mb-8 animate-fade-up">
          <p className="section-label">Command Center</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-wide text-silver-300 sm:text-4xl">
            NEXUS <span className="bg-neon-gradient bg-clip-text text-transparent">RANK</span>
          </h1>
          <p className="mt-2 max-w-2xl font-body text-base text-silver-400">
            Postgres persists history. Redis owns the live board. Socket.io pushes every high-score
            shift instantly across all clients.
          </p>
        </div>

        {loading ? (
          <div className="glass-panel px-6 py-20 text-center">
            <p className="font-display text-sm tracking-widest text-silver-500">Initializing systems…</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="space-y-6 lg:col-span-3">
              <Leaderboard entries={leaderboard} highlightUserId={user?.id} />
              <PersonalPanel
                rank={myRank.rank}
                bestScore={myRank.bestScore}
                username={user?.username}
              />
            </div>
            <div className="lg:col-span-2">
              <GameSelector
                games={games}
                selectedGameId={selectedGameId}
                onSelectGame={setSelectedGameId}
                onSubmitScore={handleSubmitScore}
                submitting={submitting}
                error={error}
                success={success}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
