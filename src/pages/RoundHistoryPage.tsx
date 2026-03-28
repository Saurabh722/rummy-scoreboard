import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { openEditRound } from '../features/ui/uiSlice';
import { RoundEntryModal } from '../components/game/RoundEntryModal';
import { Button } from '../components/common/Button';

export function RoundHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const game = useAppSelector((s) => s.games.games.find((g) => g.id === id));

  if (!game) {
    return (
      <div className="text-center py-12 text-white/40">
        <p>Game not found</p>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-white">Round History</h1>

      {game.rounds.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <p className="text-3xl mb-2">📋</p>
          <p>No rounds played yet</p>
        </div>
      )}

      {/* Scrollable table */}
      {game.rounds.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-card-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card-surface border-b border-card-border">
                <th className="text-left px-4 py-3 text-white/50 font-semibold">Round</th>
                {game.players.map((p) => (
                  <th key={p.id} className="px-3 py-3 text-center text-white/70 font-semibold">
                    {p.name}
                  </th>
                ))}
                {game.status === 'active' && (
                  <th className="px-3 py-3 text-white/50 font-semibold">Edit</th>
                )}
              </tr>
            </thead>
            <tbody>
              {game.rounds.map((round, idx) => (
                <tr
                  key={round.id}
                  className={`border-b border-card-border ${idx % 2 === 0 ? 'bg-card-bg' : 'bg-card-surface/30'}`}
                >
                  <td className="px-4 py-3 font-semibold text-white/70">#{round.roundNumber}</td>
                  {game.players.map((p) => {
                    const rs = round.scores.find((s) => s.playerId === p.id);
                    const score = rs?.score ?? '–';
                    const isWinner = round.winnerId === p.id;
                    return (
                      <td key={p.id} className="px-3 py-3 text-center">
                        <span
                          className={`font-bold ${
                            isWinner ? 'text-emerald-400' : 'text-white/80'
                          }`}
                        >
                          {isWinner ? '0 ✓' : score}
                        </span>
                      </td>
                    );
                  })}
                  {game.status === 'active' && (
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => dispatch(openEditRound(round.id))}
                        className="text-xs text-white/40 hover:text-gold transition-colors px-2 py-1 rounded"
                      >
                        ✏️
                      </button>
                    </td>
                  )}
                </tr>
              ))}

              {/* Running totals row */}
              <tr className="bg-gold/10 border-t-2 border-gold/30 font-bold">
                <td className="px-4 py-3 text-gold text-xs uppercase tracking-wide">Total</td>
                {game.players.map((p) => (
                  <td key={p.id} className="px-3 py-3 text-center">
                    <span
                      className={`font-bold text-base ${
                        p.isEliminated ? 'text-red-400' : 'text-gold'
                      }`}
                    >
                      {p.totalScore}
                    </span>
                  </td>
                ))}
                {game.status === 'active' && <td />}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <RoundEntryModal gameId={game.id} />
    </div>
  );
}
