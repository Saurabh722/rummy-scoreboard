import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/useAppStore';
import { addRound, editRound } from '../../features/games/gamesSlice';
import { closeRoundEntry } from '../../features/ui/uiSlice';
import { validateRoundScores } from '../../utils/gameLogic';
import type { RoundScore } from '../../types';

interface RoundEntryModalProps {
  gameId: string;
}

export function RoundEntryModal({ gameId }: RoundEntryModalProps) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((s) => s.ui.roundEntryModalOpen);
  const editingRoundId = useAppSelector((s) => s.ui.editingRoundId);
  const game = useAppSelector((s) => s.games.games.find((g) => g.id === gameId));

  // Build initial score entries
  const getInitialScores = () => {
    if (!game) return [];

    // Compute elimination limit for this game type
    const limit: number | null =
      game.type === 'pool' ? (game.poolLimit ?? 101)
      : game.type === 'points' ? (game.pointsLimit ?? 250)
      : null;

    if (editingRoundId) {
      const round = game.rounds.find((r) => r.id === editingRoundId);
      if (round) {
        return game.players
          .filter((p) => !p.isEliminated || round.scores.some((s) => s.playerId === p.id))
          .map((p) => {
            const rs = round.scores.find((s) => s.playerId === p.id);
            return {
              playerId: p.id,
              playerName: p.name,
              score: rs ? String(rs.score) : '0',
              isWinner: p.id === round.winnerId,
            };
          });
      }
    }
    return (game.players || [])
      .filter((p) => !p.isEliminated && (limit === null || p.totalScore < limit))
      .map((p) => ({
        playerId: p.id,
        playerName: p.name,
        score: '',
        isWinner: false,
      }));
  };

  const [entries, setEntries] = useState(getInitialScores);
  const [error, setError] = useState<string | null>(null);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setEntries(getInitialScores());
      setError(null);
    }
  }, [isOpen, editingRoundId]);

  if (!game) return null;

  // Compute elimination limit (null = no cap for Deals Rummy)
  const elimLimit: number | null =
    game.type === 'pool' ? (game.poolLimit ?? 101)
    : game.type === 'points' ? (game.pointsLimit ?? 250)
    : null;

  const winnerId = entries.find((e) => e.isWinner)?.playerId ?? '';

  const handleWinnerToggle = (playerId: string) => {
    setEntries((prev) =>
      prev.map((e) => ({
        ...e,
        isWinner: e.playerId === playerId,
        score: e.playerId === playerId ? '0' : e.score,
      })),
    );
  };

  const handleScoreChange = (playerId: string, value: string) => {
    // Allow only digits, no clamping — player can exceed limit this round and will be eliminated after save
    const cleaned = value.replace(/[^0-9]/g, '');
    setEntries((prev) =>
      prev.map((e) => (e.playerId === playerId ? { ...e, score: cleaned } : e)),
    );
  };

  const handleSave = () => {
    const scores: RoundScore[] = entries.map((e) => ({
      playerId: e.playerId,
      score: e.isWinner ? 0 : parseInt(e.score || '0', 10),
    }));

    const validationError = validateRoundScores(scores, winnerId);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (editingRoundId) {
      dispatch(editRound({ gameId, roundId: editingRoundId, scores, winnerId }));
    } else {
      dispatch(addRound({ gameId, scores, winnerId }));
    }
    dispatch(closeRoundEntry());
  };

  const roundNumber = editingRoundId
    ? game.rounds.find((r) => r.id === editingRoundId)?.roundNumber ?? game.currentRound
    : game.currentRound;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeRoundEntry())}
      title={editingRoundId ? `Edit Round ${roundNumber}` : `Round ${roundNumber} Scores`}
      maxWidth="max-w-lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-white/50">
          Tap a player to mark as <span className="text-gold font-medium">winner</span> (auto-zero). Enter card points for others.
        </p>

        <div className="space-y-3">
          {entries.map((entry) => {
            const player = game.players.find((p) => p.id === entry.playerId);
            const currentTotal = player?.totalScore ?? 0;
            const enteredScore = entry.isWinner ? 0 : parseInt(entry.score || '0', 10);
            const projectedTotal = currentTotal + enteredScore;
            const willBeEliminated = elimLimit !== null && projectedTotal >= elimLimit;
            return (
            <div key={entry.playerId} className="flex items-center gap-3">
              {/* Winner toggle */}
              <button
                onClick={() => handleWinnerToggle(entry.playerId)}
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                  entry.isWinner
                    ? 'bg-gold border-gold text-felt-darker text-sm font-bold'
                    : 'border-card-border text-white/30 hover:border-gold/50'
                }`}
                title="Mark as round winner"
              >
                {entry.isWinner ? '👑' : '○'}
              </button>

              {/* Player name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${entry.isWinner ? 'text-gold' : willBeEliminated ? 'text-red-400' : 'text-white'}`}
                  >
                    {entry.playerName}
                  </span>
                  {willBeEliminated && !entry.isWinner && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600/80 text-white tracking-wide">
                      OUT
                    </span>
                  )}
                </div>
                {elimLimit !== null && !entry.isWinner && willBeEliminated && (
                  <div className="text-[10px] text-red-400 font-bold">
                    Will be OUT ({projectedTotal}/{elimLimit})
                  </div>
                )}
                {elimLimit !== null && !entry.isWinner && !willBeEliminated && (
                  <div className="text-[10px] text-white/30">
                    {currentTotal} / {elimLimit}
                  </div>
                )}
              </div>

              {/* Quick-fill buttons + Score input */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {!entry.isWinner && (
                  <>
                    <button
                      onClick={() => handleScoreChange(entry.playerId, String(game.firstDrop ?? 25))}
                      className="text-[10px] font-bold px-1.5 py-1 rounded-lg bg-amber-700/40 border border-amber-600/40 text-amber-300 hover:bg-amber-700/70 transition-colors leading-none"
                      title={`First Drop (${game.firstDrop ?? 25} pts)`}
                    >
                      1st
                    </button>
                    <button
                      onClick={() => handleScoreChange(entry.playerId, String(game.maxPoints ?? 80))}
                      className="text-[10px] font-bold px-1.5 py-1 rounded-lg bg-card-bg border border-card-border text-white/60 hover:text-white hover:border-white/40 transition-colors leading-none"
                      title={`Max points (${game.maxPoints ?? 80} pts)`}
                    >
                      Max
                    </button>
                  </>
                )}
                <input
                  type="number"
                  inputMode="numeric"
                  className={`w-20 input text-center text-lg font-bold ${
                    entry.isWinner ? 'bg-gold/10 border-gold/40 text-gold'
                    : willBeEliminated ? 'border-red-500/60 text-red-400'
                    : ''
                  }`}
                  value={entry.isWinner ? '0' : entry.score}
                  readOnly={entry.isWinner}
                  onChange={(e) => handleScoreChange(entry.playerId, e.target.value)}
                  placeholder="pts"
                  min={0}
                />
              </div>
            </div>
            );
          })}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" onClick={() => dispatch(closeRoundEntry())} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            {editingRoundId ? 'Update Round' : 'Save Round'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
