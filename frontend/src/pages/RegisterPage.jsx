import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/client';
import Navbar from '../components/Navbar';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ username, email, password });
      navigate('/', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
        <div className="glass-panel animate-fade-up p-8">
          <p className="section-label">Enrollment</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-wide text-silver-300">
            Register
          </h1>
          <p className="mt-2 font-body text-silver-400">
            Your username is cached in Redis for zero-latency leaderboard reads.
          </p>

          <form onSubmit={handleSubmit} className="relative mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block font-display text-[10px] uppercase tracking-widest text-silver-500">
                Username
              </label>
              <input
                type="text"
                required
                minLength={3}
                className="metal-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] uppercase tracking-widest text-silver-500">
                Email
              </label>
              <input
                type="email"
                required
                className="metal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="mb-1.5 block font-display text-[10px] uppercase tracking-widest text-silver-500">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                className="metal-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}

            <button type="submit" className="btn-neon w-full" disabled={loading}>
              {loading ? 'Provisioning…' : 'Join the Board'}
            </button>
          </form>

          <p className="mt-6 text-center font-body text-sm text-silver-500">
            Already enrolled?{' '}
            <Link to="/login" className="text-neon-blue hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
