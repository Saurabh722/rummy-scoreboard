import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  roundEntryModalOpen: boolean;
  editingRoundId: string | null;
  gameOverModalOpen: boolean;
}

const initialState: UIState = {
  roundEntryModalOpen: false,
  editingRoundId: null,
  gameOverModalOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openRoundEntry(state) {
      state.roundEntryModalOpen = true;
      state.editingRoundId = null;
    },
    openEditRound(state, action: PayloadAction<string>) {
      state.roundEntryModalOpen = true;
      state.editingRoundId = action.payload;
    },
    closeRoundEntry(state) {
      state.roundEntryModalOpen = false;
      state.editingRoundId = null;
    },
    openGameOver(state) {
      state.gameOverModalOpen = true;
    },
    closeGameOver(state) {
      state.gameOverModalOpen = false;
    },
  },
});

export const { openRoundEntry, openEditRound, closeRoundEntry, openGameOver, closeGameOver } =
  uiSlice.actions;
export default uiSlice.reducer;
