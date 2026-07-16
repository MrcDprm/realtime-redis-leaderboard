import { Link } from 'react-router-dom';
import { LogOut, Radio } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <header className="relative z-20 border-b border-silver-400/15 bg-gunmetal-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-neon-blue/40 bg-gunmetal-800 shadow-glow">
            <Radio className="h-5 w-5 text-neon-blue" />
          </span>
          <div>
            <p className="font-display text-lg font-bold tracking-[0.18em] text-silver-300 transition group-hover:text-neon-blue">
              NEXUS
            </p>
            <p className="font-display text-[10px] tracking-[0.35em] text-neon-purple">RANK</p>
          </div>
        </Link>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="section-label">Operator</p>
              <p className="font-display text-sm text-silver-300">{user?.username}</p>
            </div>
            <button type="button" onClick={logout} className="btn-ghost">
              <LogOut className="h-4 w-4" />
              Exit
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
