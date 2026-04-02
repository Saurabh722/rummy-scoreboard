import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { undoLastRound, endGame, updateGameSettings, joinGame } from '../features/games/gamesSlice';
import { openRoundEntry } from '../features/ui/uiSlice';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { RoundEntryModal } from '../components/game/RoundEntryModal';
import {
  GAME_TYPE_LABELS,
  POINTS_LIMIT_MIN, POINTS_LIMIT_MAX,
  FIRST_DROP_MIN, FIRST_DROP_MAX,
  MAX_POINTS_MIN, MAX_POINTS_MAX,
  MAX_PLAYERS,
} from '../constants/gameRules';
import type { Game, Player } from '../types';

function PlayerCard({
  player,
  rank,
  isLeader,
  game,
}: {
  player: Player;
  rank: number;
  isLeader: boolean;
  game: Game;
}) {
  const elimLimit = game.type === 'pool' ? (game.poolLimit ?? 101)
    : game.type === 'points' ? (game.pointsLimit ?? 250)
    : null;
  const progressPct = elimLimit ? Math.min(100, (player.totalScore / elimLimit) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`card relative overflow-hidden transition-all ${
        player.isEliminated
          ? 'border-red-700/60 bg-red-950/30'
          : isLeader
          ? 'border-gold/60 animate-pulse-gold'
          : ''
      }`}
    >
      {/* Leader glow */}
      {isLeader && !player.isEliminated && (
        <div className="absolute inset-0 bg-gold/5 pointer-events-none rounded-2xl" />
      )}

      {/* Eliminated overlay banner */}
      {player.isEliminated && (
        <div className="absolute top-0 right-0 bg-red-700 text-white text-[10px] font-extrabold tracking-widest uppercase px-3 py-0.5 rounded-bl-xl rounded-tr-xl">
          OUT
        </div>
      )}

      {/* ── Header row ── */}
      <div className="flex items-center gap-3">
        {/* Rank / status icon */}
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
            player.isEliminated
              ? 'bg-red-900/60 text-red-400'
              : isLeader
              ? 'bg-gold text-felt-darker'
              : 'bg-card-surface text-white/70'
          }`}
        >
          {player.isEliminated ? '✕' : isLeader ? '👑' : rank}
        </div>

        {/* Name + badge */}
        <div className="flex-1 min-w-0">
          <div
            className={`font-bold text-base truncate ${
              player.isEliminated
                ? 'line-through text-white/30'
                : isLeader
                ? 'text-gold'
                : 'text-white'
            }`}
          >
            {player.name}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {player.isEliminated ? (
              <span className="badge-eliminated">Eliminated</span>
            ) : isLeader ? (
              <span className="badge-winner">Leading</span>
            ) : (
              <span className="badge-active">Active</span>
            )}
            {player.joinedAtRound && player.joinedAtRound > 1 && !player.isEliminated && (
              <span className="text-[10px] bg-blue-900/40 border border-blue-700/40 text-blue-300 px-1.5 py-0.5 rounded-full font-semibold">
                Joined R{player.joinedAtRound}
              </span>
            )}
          </div>
        </div>

        {/* Total score */}
        <div className="text-right flex-shrink-0">
          <div
            className={`text-2xl font-bold ${
              player.isEliminated ? 'text-red-400' : isLeader ? 'text-gold' : 'text-white'
            }`}
          >
            {player.totalScore}
          </div>
          {elimLimit && (
            <div className="text-xs text-white/40">/ {elimLimit}</div>
          )}
          {!elimLimit && <div className="text-xs text-white/40">pts</div>}
          {player.startingPoints !== undefined && player.startingPoints > 0 && (
            <div className="text-[10px] text-blue-400/60 mt-0.5">
              +{player.startingPoints} carry
            </div>
          )}
        </div>
      </div>

      {/* ── Progress bar (Pool & Points) ── */}
      {elimLimit && (
        <div className="mt-3">
          <div className="w-full bg-card-surface rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-1.5 rounded-full transition-all duration-500 ${
                player.isEliminated
                  ? 'bg-red-600'
                  : progressPct >= 80
                  ? 'bg-orange-400'
                  : progressPct >= 60
                  ? 'bg-yellow-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Per-round scores (all rounds, scrollable) ── */}
      {player.scores.length > 0 && (
        <div className="mt-3 border-t border-card-border/60 pt-3">
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: 'none' }}
          >
            {player.scores.map((s, i) => (
              <div key={i} className="flex flex-col items-center flex-shrink-0 min-w-[36px]">
                <span className="text-[10px] text-white/30 font-medium mb-0.5">R{i + 1}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-lg font-bold ${
                    s === 0
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : player.isEliminated && i === player.scores.length - 1
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-card-surface text-white/70'
                  }`}
                >
                  {s === 0 ? '✓' : s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Join Game Modal ──────────────────────────────────────────────────────────
function JoinGameModal({
  game,
  isOpen,
  onClose,
}: {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const profiles = useAppSelector((s) => s.profiles.profiles);
  const [name, setName] = useState('');
  const [points, setPoints] = useState(0);

  const existingNames = game.players.map((p) => p.name.toLowerCase());
  const availableProfiles = profiles.filter(
    (p) => !existingNames.includes(p.name.toLowerCase()),
  );

  const handleJoin = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch(joinGame({ gameId: game.id, playerName: trimmed, startingPoints: points }));
    setName('');
    setPoints(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Player">
      <div className="space-y-5">
        <p className="text-sm text-white/40">
          Player will join from the next round. Set starting points to match their handicap (default 0).
        </p>

        {/* Name input */}
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">Player Name</label>
          <input
            className="input w-full"
            placeholder="Enter name"
            value={name}
            maxLength={20}
            autoFocus
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleJoin(); }}
          />
          {existingNames.includes(name.trim().toLowerCase()) && name.trim() && (
            <p className="text-xs text-red-400 mt-1">This player is already in the game.</p>
          )}
        </div>

        {/* Saved profiles quick-pick */}
        {availableProfiles.length > 0 && (
          <div>
            <div className="text-xs text-white/50 mb-2 font-semibold uppercase tracking-wide">
              Saved Players
            </div>
            <div className="flex flex-wrap gap-2">
              {availableProfiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setName(p.name)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    name === p.name
                      ? 'bg-gold text-felt-darker border-gold'
                      : 'bg-card-bg border-card-border text-white/70 hover:border-gold/50 hover:text-gold'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Starting points stepper */}
        <div>
          <label className="text-sm text-white/60 mb-1.5 block">
            Starting Points <span className="text-white/30">(carry-in handicap)</span>
          </label>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPoints((v) => Math.max(0, v - 5))}
              className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
            >
              −
            </button>
            <span className="text-2xl font-bold text-gold w-16 text-center">{points}</span>
            <button
              onClick={() => setPoints((v) => v + 5)}
              className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
            >
              +
            </button>
            {points > 0 && (
              <button
                onClick={() => setPoints(0)}
                className="text-xs text-white/40 hover:text-white/70 underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleJoin}
            className="flex-1"
            disabled={!name.trim() || existingNames.includes(name.trim().toLowerCase())}
          >
            Add to Game
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Points Table Settings Modal ─────────────────────────────────────────────
function SettingsModal({
  game,
  isOpen,
  onClose,
}: {
  game: Game;
  isOpen: boolean;
  onClose: () => void;
}) {
  const dispatch = useAppDispatch();
  const [pointsLimit, setPointsLimit] = useState(game.pointsLimit ?? 250);
  const [firstDrop, setFirstDrop] = useState(game.firstDrop ?? 25);
  const [maxPoints, setMaxPoints] = useState(game.maxPoints ?? 80);

  const handleSave = () => {
    dispatch(updateGameSettings({ gameId: game.id, pointsLimit, firstDrop, maxPoints }));
    onClose();
  };

  const Row = ({
    label,
    value,
    onDec,
    onInc,
    color = 'text-white',
  }: {
    label: string;
    value: number;
    onDec: () => void;
    onInc: () => void;
    color?: string;
  }) => (
    <div className="flex items-center justify-between gap-4">
      <span className="text-white/60 text-sm flex-1">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={onDec}
          className="w-9 h-9 rounded-xl bg-card-bg border border-card-border text-white font-bold text-lg flex items-center justify-center"
        >
          −
        </button>
        <span className={`w-12 text-center text-lg font-bold ${color}`}>{value}</span>
        <button
          onClick={onInc}
          className="w-9 h-9 rounded-xl bg-card-bg border border-card-border text-white font-bold text-lg flex items-center justify-center"
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Points Table">
      <div className="space-y-5">
        <p className="text-sm text-white/40">
          Changes apply from the next round onwards.
        </p>

        <div className="card space-y-4">
          <Row
            label="Elimination Limit"
            value={pointsLimit}
            color="text-gold"
            onDec={() => setPointsLimit((v) => Math.max(POINTS_LIMIT_MIN, v - 25))}
            onInc={() => setPointsLimit((v) => Math.min(POINTS_LIMIT_MAX, v + 25))}
          />
          <div className="border-t border-card-border" />
          <Row
            label="First Drop"
            value={firstDrop}
            color="text-amber-300"
            onDec={() => setFirstDrop((v) => Math.max(FIRST_DROP_MIN, v - 5))}
            onInc={() => setFirstDrop((v) => Math.min(FIRST_DROP_MAX, v + 5))}
          />
          <div className="border-t border-card-border" />
          <Row
            label="Max Points"
            value={maxPoints}
            onDec={() => setMaxPoints((v) => Math.max(MAX_POINTS_MIN, v - 5))}
            onInc={() => setMaxPoints((v) => Math.min(MAX_POINTS_MAX, v + 5))}
          />
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export function ScoreboardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const game = useAppSelector((s) => s.games.games.find((g) => g.id === id));

  if (!game) {
    return (
      <div className="text-center py-12 text-white/40">
        <p className="text-2xl mb-2">🃏</p>
        <p>Game not found</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Go Home
        </Button>
      </div>
    );
  }

  if (game.status === 'finished') {
    navigate(`/game/${id}/over`, { replace: true });
    return null;
  }

  // Sort players: active first (by score ASC), eliminated last
  const sortedPlayers = [...game.players].sort((a, b) => {
    if (a.isEliminated !== b.isEliminated) return a.isEliminated ? 1 : -1;
    return a.totalScore - b.totalScore;
  });

  const leaderId = sortedPlayers.find((p) => !p.isEliminated)?.id;

  const handleUndo = () => {
    if (game.rounds.length === 0) return;
    if (window.confirm('Undo the last round? This cannot be redone.')) {
      dispatch(undoLastRound(game.id));
    }
  };

  const handleEndGame = () => {
    if (window.confirm('End this game now?')) {
      dispatch(endGame(game.id));
      navigate(`/game/${id}/over`);
    }
  };

  const activeCount = game.players.filter((p) => !p.isEliminated).length;
  const gameLabel = GAME_TYPE_LABELS[game.type];

  return (
    <div className="space-y-4">
      {/* Header info */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">{gameLabel}</h1>
          <p className="text-sm text-white/50">
            Round {game.currentRound - 1 > 0 ? game.currentRound - 1 : 0} played ·{' '}
            {activeCount} active
            {game.type === 'pool' && ` · Limit: ${game.poolLimit}`}
            {game.type === 'points' && game.pointsLimit && ` · Limit: ${game.pointsLimit}`}
            {game.type === 'deals' && ` · ${game.rounds.length}/${game.totalDeals} deals`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {game.type === 'points' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="text-white/60"
            >
              ⚙ Table
            </Button>
          )}
          {game.players.length < MAX_PLAYERS && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setJoinOpen(true)}
              className="text-white/60"
            >
              + Player
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/game/${id}/history`)}
            className="text-white/60"
          >
            History
          </Button>
        </div>
      </div>

      {/* Player cards */}
      <div className="space-y-3">
        {sortedPlayers.map((player, idx) => (
          <PlayerCard
            key={player.id}
            player={player}
            rank={idx + 1}
            isLeader={player.id === leaderId}
            game={game}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        {game.rounds.length > 0 && (
          <Button variant="secondary" onClick={handleUndo} className="flex-1">
            ↩ Undo
          </Button>
        )}
        <Button
          onClick={() => dispatch(openRoundEntry())}
          className="flex-1"
          disabled={activeCount < 2}
        >
          + Add Round
        </Button>
      </div>

      <Button variant="danger" fullWidth onClick={handleEndGame} size="sm">
        End Game
      </Button>

      {/* Round entry modal */}
      <RoundEntryModal gameId={game.id} />

      {/* Join game modal */}
      <JoinGameModal
        game={game}
        isOpen={joinOpen}
        onClose={() => setJoinOpen(false)}
      />

      {/* Points table settings modal */}
      {game.type === 'points' && (
        <SettingsModal
          game={game}
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
