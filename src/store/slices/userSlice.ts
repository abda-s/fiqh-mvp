import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../../db/client';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

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

// Helper for DB updates
const updateProfileDb = async (updates: Partial<typeof schema.profiles.$inferInsert>) => {
  try {
    const db = SQLite.openDatabaseSync(DATABASE_NAME);
    const drizzleDb = drizzle(db, { schema });
    await drizzleDb.update(schema.profiles).set(updates).where(eq(schema.profiles.id, 1));
  } catch (e) {
    console.error("Failed to update profile in DB via Drizzle:", e);
  }
};

export const addXP = createAsyncThunk<number, number, { state: { user: UserState } }>(
  'user/addXP',
  async (xp, { getState }) => {
    const newXP = getState().user.totalXP + xp;
    await updateProfileDb({ totalXp: newXP });
    return xp;
  }
);

export const deductHeart = createAsyncThunk<void, void, { state: { user: UserState } }>(
  'user/deductHeart',
  async (_, { getState }) => {
    const currentHearts = getState().user.hearts;
    if (currentHearts > 0) {
      await updateProfileDb({ hearts: currentHearts - 1 });
    }
  }
);

export const refillHearts = createAsyncThunk<number, number>(
  'user/refillHearts',
  async (hearts) => {
    await updateProfileDb({ hearts });
    return hearts;
  }
);

export const updateStreak = createAsyncThunk<{ count: number; date: string }, { count: number; date: string }>(
  'user/updateStreak',
  async (payload) => {
    await updateProfileDb({ streakCount: payload.count, lastActiveAt: payload.date });
    return payload;
  }
);

export const completeOnboarding = createAsyncThunk<{ knowledgeLevel: string; timeCommitment: number }, { knowledgeLevel: string; timeCommitment: number }>(
  'user/completeOnboarding',
  async (payload) => {
    await updateProfileDb({
      hasOnboarded: 1,
      knowledgeLevel: payload.knowledgeLevel,
      timeCommitment: payload.timeCommitment
    });
    return payload;
  }
);

export const loadUserProfile = createAsyncThunk<Partial<UserState>, void>(
  'user/loadUserProfile',
  async () => {
    const db = SQLite.openDatabaseSync(DATABASE_NAME);
    const drizzleDb = drizzle(db, { schema });
    const profileResult = await drizzleDb.select().from(schema.profiles).where(eq(schema.profiles.id, 1)).limit(1);
    const profile = profileResult[0];

    if (!profile) return {};

    return {
      totalXP: profile.totalXp ?? 0,
      streakCount: profile.streakCount ?? 0,
      hearts: profile.hearts ?? 5,
      lastActiveAt: profile.lastActiveAt,
      hasOnboarded: profile.hasOnboarded === 1,
      knowledgeLevel: profile.knowledgeLevel,
      timeCommitment: profile.timeCommitment
    };
  }
);

export const setUserStats = createAsyncThunk<Partial<UserState>, Partial<UserState>>(
  'user/setUserStats',
  async (stats) => {
    const dbStats: any = {};
    if (stats.totalXP !== undefined) dbStats.totalXp = stats.totalXP;
    if (stats.streakCount !== undefined) dbStats.streakCount = stats.streakCount;
    if (stats.hearts !== undefined) dbStats.hearts = stats.hearts;
    if (stats.hasOnboarded !== undefined) dbStats.hasOnboarded = stats.hasOnboarded ? 1 : 0;
    if (stats.knowledgeLevel !== undefined) dbStats.knowledgeLevel = stats.knowledgeLevel;
    if (stats.timeCommitment !== undefined) dbStats.timeCommitment = stats.timeCommitment;
    if (stats.lastActiveAt !== undefined) dbStats.lastActiveAt = stats.lastActiveAt;

    if (Object.keys(dbStats).length > 0) {
      await updateProfileDb(dbStats);
    }
    return stats;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(addXP.fulfilled, (state, action) => {
      state.totalXP += action.payload;
    });
    builder.addCase(deductHeart.fulfilled, (state) => {
      if (state.hearts > 0) state.hearts -= 1;
    });
    builder.addCase(refillHearts.fulfilled, (state, action) => {
      state.hearts = action.payload;
    });
    builder.addCase(updateStreak.fulfilled, (state, action) => {
      state.streakCount = action.payload.count;
      state.lastActiveAt = action.payload.date;
    });
    builder.addCase(completeOnboarding.fulfilled, (state, action) => {
      state.hasOnboarded = true;
      state.knowledgeLevel = action.payload.knowledgeLevel;
      state.timeCommitment = action.payload.timeCommitment;
    });
    builder.addCase(setUserStats.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
    builder.addCase(loadUserProfile.fulfilled, (state, action) => {
      return { ...state, ...action.payload };
    });
  }
});

export default userSlice.reducer;
