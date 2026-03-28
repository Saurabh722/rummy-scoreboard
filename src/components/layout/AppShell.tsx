import { useNavigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-full flex flex-col max-w-2xl mx-auto">
      {/* Top nav */}
      <header className="flex items-center gap-3 px-4 py-3 bg-felt-dark border-b border-card-border sticky top-0 z-40">
        {!isHome && (
          <button
            onClick={() => navigate(-1)}
            className="text-white/70 hover:text-gold transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-card-surface"
          >
            ←
          </button>
        )}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 flex-1">
          <span className="text-2xl">🃏</span>
          <span className="font-bold text-gold text-lg tracking-wide">Rummy Scoreboard</span>
        </button>
        <button
          onClick={() => navigate('/profiles')}
          className="text-white/60 hover:text-gold transition-colors text-sm font-medium"
          title="Player Profiles"
        >
          👤
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
