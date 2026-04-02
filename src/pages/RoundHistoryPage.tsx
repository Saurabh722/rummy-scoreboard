import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { openEditRound } from '../features/ui/uiSlice';
import { RoundEntryModal } from '../components/game/RoundEntryModal';
import { Button } from '../components/common/Button';
import type { Game } from '../types';

// ── Per-player cell metadata ─────────────────────────────────────────────────
interface PlayerMeta {
  runningTotals: number[];
  elimRoundIdx: number | null;        // first elimination round index
  rejoinAfterIdx: number | null;      // last round index BEFORE re-join (-1 = before round 0)
  secondElimRoundIdx: number | null;  // second elimination index (after re-join)
}

function buildPlayerMeta(game: Game): PlayerMeta[] {
  const elimLimit: number | null =
    game.type === 'pool' ? (game.poolLimit ?? 101)
    : game.type === 'points' ? (game.pointsLimit ?? 250)
    : null;

  return game.players.map((player) => {
    let running = player.startingPoints ?? 0;
    const runningTotals = game.rounds.map((round) => {
      const rs = round.scores.find((s) => s.playerId === player.id);
      running += rs?.score ?? 0;
      return running;
    });

    let elimRoundIdx: number | null = null;
    let rejoinAfterIdx: number | null = null;
    let secondElimRoundIdx: number | null = null;

    if (elimLimit !== null) {
      elimRoundIdx = runningTotals.findIndex((t) => t >= elimLimit);

      if (player.rejoinBaseScore !== undefined) {
        const rejoinBase = player.rejoinBaseScore;
        // Find last round that was played before the re-join
        // (last round whose cumulative total is <= rejoinBase)
        let lastBefore = -1;
        for (let i = 0; i < runningTotals.length; i++) {
          if (runningTotals[i] <= rejoinBase) lastBefore = i;
        }
        rejoinAfterIdx = lastBefore;

        // Second elimination: first round after rejoin where effective score >= limit
        for (let i = rejoinAfterIdx + 1; i < runningTotals.length; i++) {
          if (runningTotals[i] - rejoinBase >= elimLimit) {
            secondElimRoundIdx = i;
            break;
          }
        }
      }
    }

    return { runningTotals, elimRoundIdx, rejoinAfterIdx, secondElimRoundIdx };
  });
}

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

  const playerMeta = buildPlayerMeta(game);

  const elimLimit: number | null =
    game.type === 'pool' ? (game.poolLimit ?? 101)
    : game.type === 'points' ? (game.pointsLimit ?? 250)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/game/${id}`)}>
          ← Back
        </Button>
        <h1 className="text-xl font-bold text-white">Round History</h1>
      </div>

      {/* Legend for re-join players */}
      {game.players.some((p) => p.rejoinBaseScore !== undefined) && (
        <div className="flex flex-wrap gap-3 text-xs text-white/50">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-red-700/60" /> Eliminated
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-700/40" /> Re-Joined
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-sm bg-white/10" /> Post-elim (inactive)
          </span>
        </div>
      )}

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
                  <th key={p.id} className="px-3 py-3 text-center font-semibold">
                    <div className={p.isEliminated ? 'text-red-400/70 line-through' : 'text-white/70'}>
                      {p.name}
                    </div>
                    {p.rejoinBaseScore !== undefined && (
                      <div className="text-[10px] text-blue-300/60 font-normal">↩ re-joined</div>
                    )}
                  </th>
                ))}
                {game.status === 'active' && (
                  <th className="px-3 py-3 text-white/50 font-semibold">Edit</th>
                )}
              </tr>
            </thead>
            <tbody>
              {game.rounds.map((round, roundIdx) => (
                <tr
                  key={round.id}
                  className={`border-b border-card-border ${roundIdx % 2 === 0 ? 'bg-card-bg' : 'bg-card-surface/30'}`}
                >
                  <td className="px-4 py-3 font-semibold text-white/70">#{round.roundNumber}</td>

                  {game.players.map((p, pIdx) => {
                    const rs = round.scores.find((s) => s.playerId === p.id);
                    const score = rs?.score;
                    const isWinner = round.winnerId === p.id;
                    const meta = playerMeta[pIdx];

                    const isFirstElim = meta.elimRoundIdx === roundIdx;
                    const isSecondElim = meta.secondElimRoundIdx === roundIdx;
                    const isRejoinStart = meta.rejoinAfterIdx !== null && roundIdx === meta.rejoinAfterIdx + 1;

                    // Dimmed "inactive" range: after first elim, before re-join round
                    const isPostElimInactive =
                      meta.elimRoundIdx !== null &&
                      roundIdx > meta.elimRoundIdx &&
                      meta.rejoinAfterIdx !== null &&
                      roundIdx <= meta.rejoinAfterIdx;

                    let cellBg = '';
                    if (isFirstElim || isSecondElim) cellBg = 'bg-red-900/40';
                    else if (isRejoinStart) cellBg = 'bg-blue-900/30';
                    else if (isPostElimInactive) cellBg = 'bg-white/5';

                    return (
                      <td key={p.id} className={`px-3 py-2 text-center relative ${cellBg}`}>
                        {/* Re-join indicator at top of first active round */}
                        {isRejoinStart && (
                          <div className="text-[9px] text-blue-300 font-bold mb-0.5 leading-none">
                            ↩ rejoined
                          </div>
                        )}

                        {isPostElimInactive ? (
                          <span className="text-white/20 text-xs">–</span>
                        ) : score === undefined ? (
                          <span className="text-white/20 text-xs">–</span>
                        ) : (
                          <span
                            className={`font-bold text-sm ${
                              isFirstElim || isSecondElim
                                ? 'text-red-300'
                                : isWinner
                                ? 'text-emerald-400'
                                : 'text-white/80'
                            }`}
                          >
                            {isWinner ? '0 ✓' : score}
                          </span>
                        )}

                        {/* OUT badge on elimination cell */}
                        {(isFirstElim || isSecondElim) && (
                          <div className="text-[9px] text-red-400 font-extrabold mt-0.5 leading-none uppercase tracking-wide">
                            out
                          </div>
                        )}

                        {/* Running total hint below score */}
                        {elimLimit && !isPostElimInactive && score !== undefined && (
                          <div className="text-[9px] text-white/25 leading-none mt-0.5">
                            {meta.runningTotals[roundIdx]}
                            {p.rejoinBaseScore !== undefined && roundIdx > (meta.rejoinAfterIdx ?? -1) && (
                              <span className="text-blue-400/40">
                                {' '}(+{meta.runningTotals[roundIdx] - p.rejoinBaseScore})
                              </span>
                            )}
                          </div>
                        )}
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
                    {p.rejoinBaseScore !== undefined && (
                      <div className="text-[10px] text-blue-300/50 mt-0.5">
                        +{p.totalScore - p.rejoinBaseScore} since rejoin
                      </div>
                    )}
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

