import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../hooks/useAppStore';
import { deleteGame } from '../features/games/gamesSlice';
import { Button } from '../components/common/Button';
import { GAME_TYPE_LABELS } from '../constants/gameRules';
import type { Game } from '../types';

function GameCard({ game, onDelete }: { game: Game; onDelete: (id: string) => void }) {
  const navigate = useNavigate();
  const leaderId = game.players.length
    ? [...game.players].sort((a, b) => a.totalScore - b.totalScore)[0]?.id
    : null;
  const leader = game.players.find((p) => p.id === leaderId);

  const statusColor =
    game.status === 'finished'
      ? 'text-gold'
      : game.status === 'active'
      ? 'text-emerald-400'
      : 'text-white/50';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete game "${GAME_TYPE_LABELS[game.type]}"? This cannot be undone.`)) {
      onDelete(game.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card cursor-pointer hover:border-gold/50 transition-colors"
      onClick={() =>
        navigate(game.status === 'finished' ? `/game/${game.id}/over` : `/game/${game.id}`)
      }
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{GAME_TYPE_LABELS[game.type]}</span>
            {game.type === 'pool' && game.poolLimit && (
              <span className="text-xs text-white/50 bg-card-surface px-2 py-0.5 rounded-full">
                {game.poolLimit}
              </span>
            )}
            {game.type === 'deals' && game.totalDeals && (
              <span className="text-xs text-white/50 bg-card-surface px-2 py-0.5 rounded-full">
                {game.rounds.length}/{game.totalDeals} deals
              </span>
            )}
          </div>
          <div className="text-sm text-white/50 mt-1">
            {game.players.map((p) => p.name).join(', ')}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${statusColor}`}>
            {game.status === 'finished' ? '🏆 Done' : game.status === 'active' ? '● Live' : 'Setup'}
          </span>
          <button
            onClick={handleDelete}
            className="text-white/30 hover:text-red-400 transition-colors text-lg"
          >
            ×
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-card-border">
        <div className="text-sm text-white/60">
          Round {game.currentRound - 1} · {game.players.length} players
        </div>
        {leader && (
          <div className="text-sm">
            <span className="text-gold font-semibold">👑 {leader.name}</span>
            <span className="text-white/50 ml-1">{leader.totalScore} pts</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const games = useAppSelector((s) => s.games.games);

  const activeGames = games.filter((g) => g.status === 'active');
  const finishedGames = games.filter((g) => g.status === 'finished');

  const handleDelete = (id: string) => dispatch(deleteGame(id));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-4">
        <div className="text-5xl mb-2">🃏</div>
        <h1 className="text-3xl font-bold text-gold">Rummy Scoreboard</h1>
        <p className="text-white/50 mt-1 text-sm">Track every round, every game</p>
      </div>

      {/* New Game CTA */}
      <Button fullWidth size="lg" onClick={() => navigate('/setup')}>
        + New Game
      </Button>

      {/* Active games */}
      {activeGames.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Active Games
          </h2>
          <div className="space-y-3">
            {activeGames.map((g) => (
              <GameCard key={g.id} game={g} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}

      {/* No games state */}
      {games.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <div className="text-4xl mb-3">🎴</div>
          <p className="font-medium">No games yet</p>
          <p className="text-sm mt-1">Tap New Game to get started</p>
        </div>
      )}

      {/* Finished games */}
      {finishedGames.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">
            Completed Games
          </h2>
          <div className="space-y-3">
            {finishedGames.map((g) => (
              <GameCard key={g.id} game={g} onDelete={handleDelete} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
