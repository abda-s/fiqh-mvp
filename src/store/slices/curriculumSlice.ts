import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../../db/client';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../../db/schema';
import { eq, asc, count, lte } from 'drizzle-orm';
import { setUserStats } from './userSlice';
import { getLocalYYYYMMDD } from '../../utils/sm2';

export interface Node {
    id: number;
    title: string;
    total_levels: number;
    completed_levels: number;
}

export interface Unit {
    id: number;
    title: string;
    description: string;
    nodes: Node[];
    totalUnitLevels: number;
    completedUnitLevels: number;
}

export interface RoadmapLevel {
    id: number;
    title: string;
    order_index: number;
    is_completed: number;
}

export interface CurriculumState {
    units: Unit[];
    roadmapLevels: RoadmapLevel[];
    pendingReviewCount: number;
    loadingHome: boolean;
    loadingRoadmap: boolean;
    loadingReviews: boolean;
    error: string | null;
}

const initialState: CurriculumState = {
    units: [],
    roadmapLevels: [],
    pendingReviewCount: 0,
    loadingHome: false,
    loadingRoadmap: false,
    loadingReviews: false,
    error: null,
};

export const fetchHomeData = createAsyncThunk(
    'curriculum/fetchHomeData',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            const drizzleDb = drizzle(db, { schema });

            const profileResult = await drizzleDb.select().from(schema.profiles).where(eq(schema.profiles.id, 1)).limit(1);
            const profile = profileResult[0];

            if (profile) {
                dispatch(setUserStats({
                    totalXP: profile.totalXp ?? 0,
                    streakCount: profile.streakCount ?? 0,
                    hearts: profile.hearts ?? 5,
                    lastActiveAt: profile.lastActiveAt,
                    hasOnboarded: profile.hasOnboarded === 1,
                    knowledgeLevel: profile.knowledgeLevel,
                    timeCommitment: profile.timeCommitment
                }));
            }

            const loadedUnits = await drizzleDb.select().from(schema.units).orderBy(schema.units.orderIndex);

            const unitsWithNodes = await Promise.all(
                loadedUnits.map(async (unit) => {
                    const loadedNodes = await drizzleDb.select().from(schema.nodes).where(eq(schema.nodes.unitId, unit.id)).orderBy(schema.nodes.orderIndex);

                    const nodesWithProgress = await Promise.all(
                        loadedNodes.map(async (n) => {
                            const totalResult = await db.getFirstAsync<{ c: number }>(`SELECT count(*) as c FROM levels WHERE node_id = ?`, [n.id]);
                            const completedResult = await db.getFirstAsync<{ c: number }>(`SELECT count(*) as c FROM levels l JOIN user_progress up ON l.id = up.level_id WHERE up.is_completed = 1 AND l.node_id = ?`, [n.id]);

                            return {
                                id: n.id,
                                title: n.title,
                                total_levels: totalResult?.c || 0,
                                completed_levels: completedResult?.c || 0
                            };
                        })
                    );

                    const totalUnitLevels = nodesWithProgress.reduce((sum, n) => sum + n.total_levels, 0);
                    const completedUnitLevels = nodesWithProgress.reduce((sum, n) => sum + n.completed_levels, 0);

                    return {
                        id: unit.id,
                        title: unit.title,
                        description: unit.description || '',
                        nodes: nodesWithProgress,
                        totalUnitLevels,
                        completedUnitLevels
                    };
                })
            );

            return unitsWithNodes;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchRoadmapLevels = createAsyncThunk(
    'curriculum/fetchRoadmapLevels',
    async (nodeId: number, { rejectWithValue }) => {
        try {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            const drizzleDb = drizzle(db, { schema });

            const data = await drizzleDb.select({
                id: schema.levels.id,
                title: schema.levels.title,
                order_index: schema.levels.orderIndex,
                is_completed: schema.userProgress.isCompleted
            })
                .from(schema.levels)
                .leftJoin(schema.userProgress, eq(schema.levels.id, schema.userProgress.levelId))
                .where(eq(schema.levels.nodeId, nodeId))
                .orderBy(asc(schema.levels.orderIndex));

            return data.map(d => ({
                id: d.id,
                title: d.title,
                order_index: d.order_index,
                is_completed: d.is_completed ?? 0
            }));
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPendingReviews = createAsyncThunk(
    'curriculum/fetchPendingReviews',
    async (_, { rejectWithValue }) => {
        try {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            const drizzleDb = drizzle(db, { schema });

            const pending = await drizzleDb.select({ value: count() })
                .from(schema.srsReviews)
                .where(lte(schema.srsReviews.nextReviewDate, getLocalYYYYMMDD()));

            return pending[0]?.value ?? 0;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const curriculumSlice = createSlice({
    name: 'curriculum',
    initialState,
    reducers: {
        clearRoadmapLevels: (state) => {
            state.roadmapLevels = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchHomeData.pending, (state) => {
                state.loadingHome = true;
                state.error = null;
            })
            .addCase(fetchHomeData.fulfilled, (state, action) => {
                state.loadingHome = false;
                state.units = action.payload;
            })
            .addCase(fetchHomeData.rejected, (state, action) => {
                state.loadingHome = false;
                state.error = action.payload as string;
            })
            .addCase(fetchRoadmapLevels.pending, (state) => {
                state.loadingRoadmap = true;
                state.error = null;
            })
            .addCase(fetchRoadmapLevels.fulfilled, (state, action) => {
                state.loadingRoadmap = false;
                state.roadmapLevels = action.payload;
            })
            .addCase(fetchRoadmapLevels.rejected, (state, action) => {
                state.loadingRoadmap = false;
                state.error = action.payload as string;
            })
            .addCase(fetchPendingReviews.pending, (state) => {
                state.loadingReviews = true;
                state.error = null;
            })
            .addCase(fetchPendingReviews.fulfilled, (state, action) => {
                state.loadingReviews = false;
                state.pendingReviewCount = action.payload;
            })
            .addCase(fetchPendingReviews.rejected, (state, action) => {
                state.loadingReviews = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearRoadmapLevels } = curriculumSlice.actions;
export default curriculumSlice.reducer;
