export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 6;
export const POOL_LIMITS = [101, 201] as const;
export const POINTS_DEFAULT_LIMIT = 250; // default elimination threshold for Points Rummy
export const POINTS_LIMIT_MIN = 100;
export const POINTS_LIMIT_MAX = 1000;
export const FIRST_DROP_DEFAULT = 25;
export const FIRST_DROP_MIN = 5;
export const FIRST_DROP_MAX = 40;
export const MAX_POINTS_DEFAULT = 80;
export const MAX_POINTS_MIN = 40;
export const MAX_POINTS_MAX = 160;
export const INVALID_DECLARATION_PENALTY = 80;
export const DEALS_MIN = 1;
export const DEALS_MAX = 10;

export const GAME_TYPE_LABELS: Record<string, string> = {
  points: 'Points Rummy',
  pool: 'Pool Rummy',
  deals: 'Deals Rummy',
};

export const GAME_TYPE_DESCRIPTIONS: Record<string, string> = {
  points: 'Players eliminated when their total hits the limit. Last player standing wins.',
  pool: 'Players eliminated when their total hits pool limit (101 or 201). Last player standing wins.',
  deals: 'Fixed number of deals. Lowest total score after all deals wins.',
};
