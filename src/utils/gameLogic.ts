import type { Game, Player, Round, RoundScore } from '../types';
import { INVALID_DECLARATION_PENALTY } from '../constants/gameRules';

/**
 * Recalculate every player's totalScore and isEliminated based on rounds[].
 */
export function recalculatePlayers(game: Game): Player[] {
  return game.players.map((player) => {
    const scores = game.rounds.map((round) => {
      const rs = round.scores.find((s) => s.playerId === player.id);
      return rs ? rs.score : 0;
    });

    const totalScore = scores.reduce((sum, s) => sum + s, 0);

    let isEliminated = false;
    if (game.type === 'pool' && game.poolLimit) {
      isEliminated = totalScore >= game.poolLimit;
    } else if (game.type === 'points' && game.pointsLimit) {
      isEliminated = totalScore >= game.pointsLimit;
    }

    return { ...player, scores, totalScore, isEliminated };
  });
}

/**
 * Detect the game winner after a round is added.
 * Returns playerId of the winner or undefined if game is not yet over.
 */
export function detectWinner(game: Game): string | undefined {
  const activePlayers = game.players.filter((p) => !p.isEliminated);

  if (game.type === 'pool' || game.type === 'points') {
    // Winner is the last remaining non-eliminated player
    if (activePlayers.length === 1) {
      return activePlayers[0].id;
    }
    // Edge case: all eliminated simultaneously
    if (activePlayers.length === 0 && game.players.length > 0) {
      const minScore = Math.min(...game.players.map((p) => p.totalScore));
      return game.players.find((p) => p.totalScore === minScore)?.id;
    }
  }

  if (game.type === 'deals' && game.totalDeals !== undefined) {
    if (game.rounds.length >= game.totalDeals) {
      // Lowest score wins
      const minScore = Math.min(...game.players.map((p) => p.totalScore));
      return game.players.find((p) => p.totalScore === minScore)?.id;
    }
  }

  return undefined;
}

/**
 * Validate round scores before accepting them.
 * Returns an error message or null if valid.
 */
export function validateRoundScores(
  scores: RoundScore[],
  winnerId: string,
): string | null {
  if (!winnerId) return 'Please select a round winner.';

  for (const rs of scores) {
    if (rs.playerId === winnerId) {
      if (rs.score !== 0) return 'Winner score must be 0.';
      continue;
    }
    if (rs.score < 0) return 'Scores cannot be negative.';
    if (rs.score > INVALID_DECLARATION_PENALTY) {
      return `Score ${rs.score} exceeds maximum allowed (${INVALID_DECLARATION_PENALTY}).`;
    }
  }

  return null;
}

/**
 * Build a human-readable text summary of the current scoreboard.
 */
export function buildScoreboardText(game: Game, gameLabel: string): string {
  const header = `🃏 Rummy Scoreboard – ${gameLabel} (Round ${game.currentRound})`;
  const rows = [...game.players]
    .sort((a, b) => a.totalScore - b.totalScore)
    .map((p, i) => {
      const status = p.isEliminated ? '❌' : i === 0 ? '👑' : `${i + 1}.`;
      return `${status} ${p.name}: ${p.totalScore} pts`;
    })
    .join('\n');

  return `${header}\n\n${rows}`;
}

/**
 * Apply invalid declaration penalty to a player.
 * Returns the penalty score to be recorded for that player.
 */
export function getInvalidDeclarationPenalty(): number {
  return INVALID_DECLARATION_PENALTY;
}

/**
 * Given existing rounds, compute cumulative scores per player up to a given round index.
 */
export function getCumulativeScores(
  players: Player[],
  rounds: Round[],
  upToRoundIndex: number,
): Record<string, number> {
  const result: Record<string, number> = {};
  players.forEach((p) => (result[p.id] = 0));

  for (let i = 0; i <= upToRoundIndex && i < rounds.length; i++) {
    rounds[i].scores.forEach((rs) => {
      if (result[rs.playerId] !== undefined) {
        result[rs.playerId] += rs.score;
      }
    });
  }

  return result;
}
