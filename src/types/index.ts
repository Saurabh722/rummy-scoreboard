export type GameType = 'points' | 'pool' | 'deals';
export type GameStatus = 'setup' | 'active' | 'finished';
export type PoolLimit = 101 | 201;

export interface RoundScore {
  playerId: string;
  score: number;
}

export interface Round {
  id: string;
  roundNumber: number;
  scores: RoundScore[];
  winnerId: string;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  totalScore: number;
  isEliminated: boolean;
  scores: number[]; // per-round score array (parallel to game.rounds)
}

export interface Game {
  id: string;
  type: GameType;
  poolLimit?: PoolLimit;
  pointsLimit?: number; // elimination threshold for Points Rummy (default 250)
  firstDrop?: number;   // quick-fill: first drop value (default 25)
  maxPoints?: number;   // quick-fill: max points value (default 80)
  totalDeals?: number;
  players: Player[];
  rounds: Round[];
  currentRound: number;
  status: GameStatus;
  winnerId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface PlayerProfile {
  id: string;
  name: string;
  gamesPlayed: number;
  wins: number;
  createdAt: number;
}

export interface PlayerGroup {
  id: string;
  name: string;
  memberIds: string[]; // profile IDs
  createdAt: number;
}

// For score entry form
export interface RoundScoreEntry {
  playerId: string;
  playerName: string;
  score: string; // string for form input
  isWinner: boolean;
}
