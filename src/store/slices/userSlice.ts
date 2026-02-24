import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  id: number;
  totalXP: number;
  streakCount: number;
  hearts: number;
  lastActiveAt: string | null;
  hasOnboarded: boolean;
  knowledgeLevel: string | null;
  timeCommitment: number | null;
}

const initialState: UserState = {
  id: 1,
  totalXP: 0,
  streakCount: 0,
  hearts: 5,
  lastActiveAt: null,
  hasOnboarded: false,
  knowledgeLevel: null,
  timeCommitment: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserStats: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    addXP: (state, action: PayloadAction<number>) => {
      state.totalXP += action.payload;
    },
    deductHeart: (state) => {
      if (state.hearts > 0) {
        state.hearts -= 1;
      }
    },
    refillHearts: (state, action: PayloadAction<number>) => {
      state.hearts = action.payload;
    },
    updateStreak: (state, action: PayloadAction<{ count: number; date: string }>) => {
      state.streakCount = action.payload.count;
      state.lastActiveAt = action.payload.date;
    },
    completeOnboarding: (state, action: PayloadAction<{ knowledgeLevel: string; timeCommitment: number }>) => {
      state.hasOnboarded = true;
      state.knowledgeLevel = action.payload.knowledgeLevel;
      state.timeCommitment = action.payload.timeCommitment;
    }
  },
});

export const { setUserStats, addXP, deductHeart, refillHearts, updateStreak, completeOnboarding } = userSlice.actions;
export default userSlice.reducer;
