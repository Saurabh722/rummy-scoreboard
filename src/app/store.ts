import { configureStore } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit';
import gamesReducer from '../features/games/gamesSlice';
import profilesReducer from '../features/profiles/profilesSlice';
import uiReducer from '../features/ui/uiSlice';

const STORAGE_KEY = 'rummy_scoreboard_state';

// Load persisted state from localStorage
function loadState() {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return undefined;
    const parsed = JSON.parse(serialized) as { games?: unknown; profiles?: unknown };
    // Migration: ensure groups array exists for older persisted states
    if (parsed.profiles && typeof parsed.profiles === 'object') {
      const p = parsed.profiles as Record<string, unknown>;
      if (!Array.isArray(p.groups)) p.groups = [];
    }
    return parsed;
  } catch {
    return undefined;
  }
}

// Middleware that saves state to localStorage after every action
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const localStorageMiddleware: Middleware<Record<string, never>, any> =
  (storeAPI) => (next) => (action) => {
    const result = next(action);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const state = storeAPI.getState() as any;
      const toPersist = { games: state.games, profiles: state.profiles };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toPersist));
    } catch {
      // Ignore storage errors (e.g. private mode quota)
    }
    return result;
  };

const persisted = loadState();

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    profiles: profilesReducer,
    ui: uiReducer,
  },
  preloadedState: persisted
    ? { games: persisted.games as never, profiles: persisted.profiles as never }
    : undefined,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
