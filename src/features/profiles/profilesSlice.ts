import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';
import type { PlayerProfile, PlayerGroup } from '../../types';

interface ProfilesState {
  profiles: PlayerProfile[];
  groups: PlayerGroup[];
}

const initialState: ProfilesState = {
  profiles: [],
  groups: [],
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

    // ── Groups ────────────────────────────────────────────────────────────────
    addGroup(state, action: PayloadAction<string>) {
      const name = action.payload.trim();
      if (!name) return;
      state.groups.push({ id: uuidv4(), name, memberIds: [], createdAt: Date.now() });
    },

    editGroup(state, action: PayloadAction<{ id: string; name: string }>) {
      const group = state.groups.find((g) => g.id === action.payload.id);
      if (group) group.name = action.payload.name.trim();
    },

    deleteGroup(state, action: PayloadAction<string>) {
      state.groups = state.groups.filter((g) => g.id !== action.payload);
    },

    addMemberToGroup(state, action: PayloadAction<{ groupId: string; profileId: string }>) {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group && !group.memberIds.includes(action.payload.profileId)) {
        group.memberIds.push(action.payload.profileId);
      }
    },

    removeMemberFromGroup(state, action: PayloadAction<{ groupId: string; profileId: string }>) {
      const group = state.groups.find((g) => g.id === action.payload.groupId);
      if (group) {
        group.memberIds = group.memberIds.filter((id) => id !== action.payload.profileId);
      }
    },
  },
});

export const {
  addProfile,
  editProfile,
  deleteProfile,
  incrementStats,
  addGroup,
  editGroup,
  deleteGroup,
  addMemberToGroup,
  removeMemberFromGroup,
} = profilesSlice.actions;
export default profilesSlice.reducer;
