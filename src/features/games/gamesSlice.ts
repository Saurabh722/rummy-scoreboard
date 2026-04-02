import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { Game, GameType, Player, PoolLimit, Round, RoundScore } from '../../types';
import { recalculatePlayers, detectWinner } from '../../utils/gameLogic';

interface GamesState {
  games: Game[];
}

const initialState: GamesState = {
  games: [],
};

interface CreateGamePayload {
  id: string;
  type: GameType;
  playerNames: string[];
  poolLimit?: PoolLimit;
  pointsLimit?: number;
  firstDrop?: number;
  maxPoints?: number;
  totalDeals?: number;
}

interface AddRoundPayload {
  gameId: string;
  scores: RoundScore[];
  winnerId: string;
}

interface EditRoundPayload {
  gameId: string;
  roundId: string;
  scores: RoundScore[];
  winnerId: string;
}

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    createGame(state, action: PayloadAction<CreateGamePayload>) {
      const { id, type, playerNames, poolLimit, pointsLimit, firstDrop, maxPoints, totalDeals } = action.payload;
      const players: Player[] = playerNames.map((name) => ({
        id: uuidv4(),
        name,
        totalScore: 0,
        isEliminated: false,
        scores: [],
      }));

      const game: Game = {
        id,
        type,
        poolLimit,
        pointsLimit,
        firstDrop,
        maxPoints,
        totalDeals,
        players,
        rounds: [],
        currentRound: 1,
        status: 'active',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      state.games.push(game);
    },

    addRound(state, action: PayloadAction<AddRoundPayload>) {
      const { gameId, scores, winnerId } = action.payload;
      const game = state.games.find((g) => g.id === gameId);
      if (!game || game.status !== 'active') return;

      const round: Round = {
        id: uuidv4(),
        roundNumber: game.currentRound,
        scores,
        winnerId,
        timestamp: Date.now(),
      };

      game.rounds.push(round);
      game.currentRound += 1;
      game.players = recalculatePlayers(game);
      game.updatedAt = Date.now();

      const winnerId2 = detectWinner(game);
      if (winnerId2) {
        game.winnerId = winnerId2;
        game.status = 'finished';
      }
    },

    editRound(state, action: PayloadAction<EditRoundPayload>) {
      const { gameId, roundId, scores, winnerId } = action.payload;
      const game = state.games.find((g) => g.id === gameId);
      if (!game) return;

      const roundIdx = game.rounds.findIndex((r) => r.id === roundId);
      if (roundIdx === -1) return;

      game.rounds[roundIdx] = { ...game.rounds[roundIdx], scores, winnerId };
      game.players = recalculatePlayers(game);
      game.updatedAt = Date.now();

      // Re-evaluate game status after edit
      if (game.status === 'finished') {
        const win = detectWinner(game);
        game.winnerId = win;
        game.status = win ? 'finished' : 'active';
      }
    },

    undoLastRound(state, action: PayloadAction<string>) {
      const game = state.games.find((g) => g.id === action.payload);
      if (!game || game.rounds.length === 0) return;

      game.rounds.pop();
      game.currentRound = Math.max(1, game.currentRound - 1);
      game.players = recalculatePlayers(game);
      game.winnerId = undefined;
      game.status = 'active';
      game.updatedAt = Date.now();
    },

    endGame(state, action: PayloadAction<string>) {
      const game = state.games.find((g) => g.id === action.payload);
      if (!game) return;

      // For Points/Deals with no auto-winner, pick lowest score
      if (!game.winnerId && game.players.length > 0) {
        const minScore = Math.min(...game.players.map((p) => p.totalScore));
        const winner = game.players.find((p) => p.totalScore === minScore);
        game.winnerId = winner?.id;
      }

      game.status = 'finished';
      game.updatedAt = Date.now();
    },

    deleteGame(state, action: PayloadAction<string>) {
      state.games = state.games.filter((g) => g.id !== action.payload);
    },

    updateGameSettings(
      state,
      action: PayloadAction<{
        gameId: string;
        pointsLimit?: number;
        firstDrop?: number;
        maxPoints?: number;
      }>,
    ) {
      const { gameId, pointsLimit, firstDrop, maxPoints } = action.payload;
      const game = state.games.find((g) => g.id === gameId);
      if (!game) return;
      if (pointsLimit !== undefined) game.pointsLimit = pointsLimit;
      if (firstDrop !== undefined) game.firstDrop = firstDrop;
      if (maxPoints !== undefined) game.maxPoints = maxPoints;
      game.updatedAt = Date.now();
    },
  },
});

export const { createGame, addRound, editRound, undoLastRound, endGame, deleteGame, updateGameSettings } =
  gamesSlice.actions;

export default gamesSlice.reducer;
