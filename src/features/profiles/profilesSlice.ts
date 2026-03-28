import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { PlayerProfile } from '../../types';

interface ProfilesState {
  profiles: PlayerProfile[];
}

const initialState: ProfilesState = {
  profiles: [],
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState,
  reducers: {
    addProfile(state, action: PayloadAction<string>) {
      const name = action.payload.trim();
      if (!name) return;
      state.profiles.push({
        id: uuidv4(),
        name,
        gamesPlayed: 0,
        wins: 0,
        createdAt: Date.now(),
      });
    },

    editProfile(state, action: PayloadAction<{ id: string; name: string }>) {
      const profile = state.profiles.find((p) => p.id === action.payload.id);
      if (profile) profile.name = action.payload.name.trim();
    },

    deleteProfile(state, action: PayloadAction<string>) {
      state.profiles = state.profiles.filter((p) => p.id !== action.payload);
    },

    incrementStats(state, action: PayloadAction<{ winnerId: string; playerIds: string[] }>) {
      const { winnerId, playerIds } = action.payload;
      playerIds.forEach((id) => {
        const profile = state.profiles.find((p) => p.id === id);
        if (profile) {
          profile.gamesPlayed += 1;
          if (profile.id === winnerId) profile.wins += 1;
        }
      });
    },
  },
});

export const { addProfile, editProfile, deleteProfile, incrementStats } = profilesSlice.actions;
export default profilesSlice.reducer;
