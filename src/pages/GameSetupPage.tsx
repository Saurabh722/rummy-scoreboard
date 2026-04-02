import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../hooks/useAppStore';
import { createGame } from '../features/games/gamesSlice';
import { Button } from '../components/common/Button';
import { Stepper } from '../components/common/Stepper';
import type { GameType, PoolLimit } from '../types';
import {
  MIN_PLAYERS,
  MAX_PLAYERS,
  POOL_LIMITS,
  DEALS_MIN,
  DEALS_MAX,
  POINTS_DEFAULT_LIMIT,
  POINTS_LIMIT_MIN,
  POINTS_LIMIT_MAX,
  FIRST_DROP_DEFAULT,
  FIRST_DROP_MIN,
  FIRST_DROP_MAX,
  MAX_POINTS_DEFAULT,
  MAX_POINTS_MIN,
  MAX_POINTS_MAX,
  GAME_TYPE_LABELS,
  GAME_TYPE_DESCRIPTIONS,
} from '../constants/gameRules';

// Game type step is hidden for now — Points Rummy is the default.
// To re-enable, restore 'Game Type' as the first entry in STEPS.
const STEPS = ['Players', 'Review'];

// ─── Step 1: Game Type ──────────────────────────────────────────────────────
function StepGameType({
  gameType,
  setGameType,
  poolLimit,
  setPoolLimit,
  pointsLimit,
  setPointsLimit,
  firstDrop,
  setFirstDrop,
  maxPoints,
  setMaxPoints,
  totalDeals,
  setTotalDeals,
}: {
  gameType: GameType;
  setGameType: (t: GameType) => void;
  poolLimit: PoolLimit;
  setPoolLimit: (l: PoolLimit) => void;
  pointsLimit: number;
  setPointsLimit: (n: number) => void;
  firstDrop: number;
  setFirstDrop: (n: number) => void;
  maxPoints: number;
  setMaxPoints: (n: number) => void;
  totalDeals: number;
  setTotalDeals: (n: number) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Choose Game Type</h2>

      {(['points', 'pool', 'deals'] as GameType[]).map((type) => (
        <div
          key={type}
          onClick={() => setGameType(type)}
          className={`card cursor-pointer transition-all ${
            gameType === type ? 'border-gold bg-card-surface' : 'hover:border-card-border/80'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
                gameType === type ? 'border-gold bg-gold' : 'border-white/30'
              }`}
            >
              {gameType === type && <span className="w-2 h-2 rounded-full bg-felt-darker block" />}
            </div>
            <div>
              <div className="font-bold text-white">{GAME_TYPE_LABELS[type]}</div>
              <div className="text-sm text-white/50 mt-0.5">{GAME_TYPE_DESCRIPTIONS[type]}</div>
            </div>
          </div>

          {/* Points limit sub-option */}
          {type === 'points' && gameType === 'points' && (
            <div className="mt-4 pl-8 space-y-4">
              {/* Elimination Limit */}
              <div>
                <label className="text-sm text-white/60 mb-1 block">Elimination Limit (pts)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setPointsLimit(Math.max(POINTS_LIMIT_MIN, pointsLimit - 25)); }}
                    className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-gold w-14 text-center">{pointsLimit}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setPointsLimit(Math.min(POINTS_LIMIT_MAX, pointsLimit + 25)); }}
                    className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* First Drop */}
              <div>
                <label className="text-sm text-white/60 mb-1 block">First Drop (pts)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setFirstDrop(Math.max(FIRST_DROP_MIN, firstDrop - 5)); }}
                    className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-amber-300 w-14 text-center">{firstDrop}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFirstDrop(Math.min(FIRST_DROP_MAX, firstDrop + 5)); }}
                    className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              {/* Max Points */}
              <div>
                <label className="text-sm text-white/60 mb-1 block">Max Points (pts)</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMaxPoints(Math.max(MAX_POINTS_MIN, maxPoints - 5)); }}
                    className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
                  >
                    −
                  </button>
                  <span className="text-xl font-bold text-white w-14 text-center">{maxPoints}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setMaxPoints(Math.min(MAX_POINTS_MAX, maxPoints + 5)); }}
                    className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Pool limit sub-option */}
          {type === 'pool' && gameType === 'pool' && (
            <div className="flex gap-3 mt-4 pl-8">
              {POOL_LIMITS.map((limit) => (
                <button
                  key={limit}
                  onClick={(e) => { e.stopPropagation(); setPoolLimit(limit); }}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-all ${
                    poolLimit === limit
                      ? 'bg-gold text-felt-darker border-gold'
                      : 'bg-card-bg border-card-border text-white'
                  }`}
                >
                  {limit}
                </button>
              ))}
            </div>
          )}

          {/* Deals sub-option */}
          {type === 'deals' && gameType === 'deals' && (
            <div className="mt-4 pl-8">
              <label className="text-sm text-white/60 mb-1 block">Number of Deals</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setTotalDeals(Math.max(DEALS_MIN, totalDeals - 1)); }}
                  className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-xl font-bold text-gold w-8 text-center">{totalDeals}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); setTotalDeals(Math.min(DEALS_MAX, totalDeals + 1)); }}
                  className="w-10 h-10 rounded-xl bg-card-bg border border-card-border text-white font-bold text-xl flex items-center justify-center"
                >
                  +
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Step 2: Players ─────────────────────────────────────────────────────────
function StepPlayers({
  players,
  setPlayers,
}: {
  players: string[];
  setPlayers: (p: string[]) => void;
}) {
  const profiles = useAppSelector((s) => s.profiles.profiles);
  const [inputValue, setInputValue] = useState('');

  const addPlayer = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed || players.length >= MAX_PLAYERS) return;
    if (players.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return;
    setPlayers([...players, trimmed]);
    setInputValue('');
  };

  const removePlayer = (idx: number) => {
    setPlayers(players.filter((_, i) => i !== idx));
  };

  const unusedProfiles = profiles.filter(
    (p) => !players.some((name) => name.toLowerCase() === p.name.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">Add Players</h2>
      <p className="text-sm text-white/50">
        {players.length}/{MAX_PLAYERS} players added · Minimum {MIN_PLAYERS}
      </p>

      {/* Manual add */}
      <div className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Enter player name"
          value={inputValue}
          maxLength={20}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addPlayer(inputValue); }}
        />
        <Button
          variant="secondary"
          disabled={!inputValue.trim() || players.length >= MAX_PLAYERS}
          onClick={() => addPlayer(inputValue)}
        >
          Add
        </Button>
      </div>

      {/* Player chips */}
      {players.length > 0 && (
        <div className="space-y-2">
          {players.map((name, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 bg-card-surface rounded-xl px-4 py-3 border border-card-border"
            >
              <span className="w-7 h-7 rounded-full bg-gold/20 text-gold text-sm font-bold flex items-center justify-center">
                {idx + 1}
              </span>
              <span className="flex-1 font-medium text-white">{name}</span>
              <button
                onClick={() => removePlayer(idx)}
                className="text-white/30 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Saved profiles */}
      {unusedProfiles.length > 0 && players.length < MAX_PLAYERS && (
        <div>
          <div className="text-sm text-white/50 mb-2">Quick add from profiles:</div>
          <div className="flex flex-wrap gap-2">
            {unusedProfiles.map((p) => (
              <button
                key={p.id}
                onClick={() => addPlayer(p.name)}
                className="bg-card-bg border border-card-border text-white/70 text-sm px-3 py-1.5 rounded-full hover:border-gold/50 hover:text-gold transition-all"
              >
                + {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Review ──────────────────────────────────────────────────────────
function StepReview({
  gameType,
  players,
  poolLimit,
  pointsLimit,
  firstDrop,
  maxPoints,
  totalDeals,
}: {
  gameType: GameType;
  players: string[];
  poolLimit: PoolLimit;
  pointsLimit: number;
  firstDrop: number;
  maxPoints: number;
  totalDeals: number;
}) {
  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-white">Review &amp; Start</h2>

      <div className="card space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Game Type</span>
          <span className="font-bold text-gold">{GAME_TYPE_LABELS[gameType]}</span>
        </div>
        {gameType === 'points' && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Elimination Limit</span>
              <span className="font-bold text-white">{pointsLimit} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">First Drop</span>
              <span className="font-bold text-amber-300">{firstDrop} pts</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/60">Max Points</span>
              <span className="font-bold text-white">{maxPoints} pts</span>
            </div>
          </>
        )}
        {gameType === 'pool' && (
          <div className="flex justify-between items-center">
            <span className="text-white/60">Pool Limit</span>
            <span className="font-bold text-white">{poolLimit} pts</span>
          </div>
        )}
        {gameType === 'deals' && (
          <div className="flex justify-between items-center">
            <span className="text-white/60">Total Deals</span>
            <span className="font-bold text-white">{totalDeals}</span>
          </div>
        )}
        <div className="flex justify-between items-start">
          <span className="text-white/60">Players</span>
          <div className="text-right">
            {players.map((p, i) => (
              <div key={i} className="font-medium text-white">{p}</div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-sm text-white/40 text-center">
        Ready to play? Hit Start Game below.
      </p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function GameSetupPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState(0);
  const [gameType, setGameType] = useState<GameType>('points');
  const [poolLimit, setPoolLimit] = useState<PoolLimit>(101);
  const [pointsLimit, setPointsLimit] = useState(POINTS_DEFAULT_LIMIT);
  const [firstDrop, setFirstDrop] = useState(FIRST_DROP_DEFAULT);
  const [maxPoints, setMaxPoints] = useState(MAX_POINTS_DEFAULT);
  const [totalDeals, setTotalDeals] = useState(3);
  const [players, setPlayers] = useState<string[]>([]);

  const canProceed = () => {
    if (step === 0) return players.length >= MIN_PLAYERS; // Players step
    return true; // Review step
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      const gameId = uuidv4();
      dispatch(
        createGame({
          id: gameId,
          type: gameType,
          playerNames: players,
          poolLimit: gameType === 'pool' ? poolLimit : undefined,
          pointsLimit: gameType === 'points' ? pointsLimit : undefined,
          firstDrop: gameType === 'points' ? firstDrop : undefined,
          maxPoints: gameType === 'points' ? maxPoints : undefined,
          totalDeals: gameType === 'deals' ? totalDeals : undefined,
        }),
      );
      navigate(`/game/${gameId}`);
    }
  };

  return (
    <div className="space-y-6">
      <Stepper steps={STEPS} current={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && <StepPlayers players={players} setPlayers={setPlayers} />}
          {step === 1 && (
            <StepReview
              gameType={gameType}
              players={players}
              poolLimit={poolLimit}
              pointsLimit={pointsLimit}
              firstDrop={firstDrop}
              maxPoints={maxPoints}
              totalDeals={totalDeals}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3 pt-2">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
            Back
          </Button>
        )}
        <Button
          fullWidth={step === 0}
          onClick={handleNext}
          disabled={!canProceed()}
          className="flex-1"
        >
          {step === STEPS.length - 1 ? '🃏 Start Game' : 'Next →'}
        </Button>
      </div>
    </div>
  );
}
