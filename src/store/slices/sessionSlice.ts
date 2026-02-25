import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../../db/client';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../../db/schema';
import { eq, asc, lte } from 'drizzle-orm';
import { calculateSM2, getLocalYYYYMMDD } from '../../utils/sm2';
export interface Exercise {
    id: number;
    level_id: number;
    type: 'multiple_choice' | 'ordering' | 'matching' | 'true_false' | 'fill_blank' ;
    content_json: string;
    correct_answer: string;
    explanation: string;
}

export interface SessionState {
    isActive: boolean;
    currentLevelId: number | null;
    exercises: Exercise[];
    currentExerciseIndex: number;
    correctAnswers: number;
    sessionXP: number;
    loadingExercises: boolean;
    error: string | null;
}

const initialState: SessionState = {
    isActive: false,
    currentLevelId: null,
    exercises: [],
    currentExerciseIndex: 0,
    correctAnswers: 0,
    sessionXP: 0,
    loadingExercises: false,
    error: null,
};

export const loadExercisesForSession = createAsyncThunk(
    'session/loadExercisesForSession',
    async ({ levelId, isPractice }: { levelId: number; isPractice: boolean }, { rejectWithValue }) => {
        try {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            const drizzleDb = drizzle(db, { schema });
            let data: Exercise[] = [];

            if (isPractice) {
                const queryRes = await drizzleDb.select({
                    id: schema.exercises.id,
                    level_id: schema.exercises.levelId,
                    type: schema.exercises.type,
                    content_json: schema.exercises.contentJson,
                    correct_answer: schema.exercises.correctAnswer,
                    explanation: schema.exercises.explanation
                })
                    .from(schema.exercises)
                    .innerJoin(schema.srsReviews, eq(schema.exercises.id, schema.srsReviews.exerciseId))
                    .where(lte(schema.srsReviews.nextReviewDate, getLocalYYYYMMDD()))
                    .orderBy(asc(schema.srsReviews.nextReviewDate))
                    .limit(10);

                data = queryRes as Exercise[];
            } else {
                const queryRes = await drizzleDb.select({
                    id: schema.exercises.id,
                    level_id: schema.exercises.levelId,
                    type: schema.exercises.type,
                    content_json: schema.exercises.contentJson,
                    correct_answer: schema.exercises.correctAnswer,
                    explanation: schema.exercises.explanation
                }).from(schema.exercises).where(eq(schema.exercises.levelId, levelId));

                data = queryRes as Exercise[];
            }

            return { levelId, exercises: data };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const processExerciseAnswer = createAsyncThunk(
    'session/processExerciseAnswer',
    async ({ exerciseId, quality, isPractice }: { exerciseId: number; quality: number, isPractice: boolean }, { rejectWithValue }) => {
        try {
            const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
            const drizzleDb = drizzle(db, { schema });

            if (!isPractice) {
                // When finishing a roadmap level, simply add to review deck for TODAY
                const today = new Date();

                await drizzleDb.insert(schema.srsReviews).values({
                    exerciseId: exerciseId,
                    easeFactor: 2.5,
                    interval: 0,
                    repetitions: 0,
                    nextReviewDate: getLocalYYYYMMDD(today)
                }).onConflictDoNothing(); // If already scheduled from a previous run, do nothing

                return { success: true, isRepeatAgain: false, exerciseId };
            }

            // In Practice Mode (Review Screen), apply SM-2 algorithm based on how well they did
            const existingReviewRes = await drizzleDb.select({
                ease_factor: schema.srsReviews.easeFactor,
                interval: schema.srsReviews.interval,
                repetitions: schema.srsReviews.repetitions
            }).from(schema.srsReviews).where(eq(schema.srsReviews.exerciseId, exerciseId)).limit(1);

            const existingReview = existingReviewRes[0];

            const ef = existingReview?.ease_factor ?? 2.5;
            const iv = existingReview?.interval ?? 0;
            const rep = existingReview?.repetitions ?? 0;

            const nextData = calculateSM2(quality, rep, ef, iv);

            await drizzleDb.insert(schema.srsReviews).values({
                exerciseId: exerciseId,
                easeFactor: nextData.easeFactor,
                interval: nextData.interval,
                repetitions: nextData.repetitions,
                nextReviewDate: nextData.nextReviewDate
            }).onConflictDoUpdate({
                target: schema.srsReviews.exerciseId,
                set: {
                    easeFactor: nextData.easeFactor,
                    interval: nextData.interval,
                    repetitions: nextData.repetitions,
                    nextReviewDate: nextData.nextReviewDate
                }
            });

            return { success: true, isRepeatAgain: nextData.isRepeatAgain, exerciseId };
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const completeSession = createAsyncThunk<void, void, { state: { session: SessionState } }>(
    'session/completeSession',
    async (_, { getState, dispatch }) => {
        try {
            const db = SQLite.openDatabaseSync(DATABASE_NAME);
            const drizzleDb = drizzle(db, { schema });
            const session = getState().session;

            if (session.currentLevelId && session.currentLevelId !== -1) {
                await drizzleDb.insert(schema.userProgress).values({
                    levelId: session.currentLevelId,
                    isCompleted: 1,
                    highScore: 0
                }).onConflictDoUpdate({
                    target: schema.userProgress.levelId,
                    set: { isCompleted: 1 }
                });
            }
            dispatch(endSession());
        } catch (e) {
            console.error("Failed to update level progress via Drizzle:", e);
        }
    }
);

const sessionSlice = createSlice({
    name: 'session',
    initialState,
    reducers: {
        startSession: (state, action: PayloadAction<{ levelId: number; exercises: Exercise[] }>) => {
            state.isActive = true;
            state.currentLevelId = action.payload.levelId;
            state.exercises = action.payload.exercises;
            state.currentExerciseIndex = 0;
            state.correctAnswers = 0;
            state.sessionXP = 0;
        },
        retryIncorrectExercise: (state) => {
            // Redundant explicit call, but keeping it if UI explicitly wants to trigger a push
            const currentEx = state.exercises[state.currentExerciseIndex];
            if (currentEx) {
                state.exercises.push(currentEx);
            }
        },
        nextExercise: (state) => {
            if (state.currentExerciseIndex < state.exercises.length - 1) {
                state.currentExerciseIndex += 1;
            }
        },
        recordCorrectAnswer: (state, action: PayloadAction<number>) => {
            state.correctAnswers += 1;
            state.sessionXP += action.payload; // XP to add
        },
        endSession: (state) => {
            state.isActive = false;
            // We don't reset levelId and summary stats immediately so the UI can display a summary screen
        },
        resetSession: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadExercisesForSession.pending, (state) => {
                state.loadingExercises = true;
                state.error = null;
            })
            .addCase(loadExercisesForSession.fulfilled, (state, action) => {
                state.loadingExercises = false;
                state.isActive = action.payload.exercises.length > 0;
                state.currentLevelId = action.payload.levelId;
                state.exercises = action.payload.exercises;
                state.currentExerciseIndex = 0;
                state.correctAnswers = 0;
                state.sessionXP = 0;
            })
            .addCase(loadExercisesForSession.rejected, (state, action) => {
                state.loadingExercises = false;
                state.error = action.payload as string;
            })
            .addCase(processExerciseAnswer.fulfilled, (state, action) => {
                // If SM-2 algorithm determined quality < 4, it flags isRepeatAgain
                if (action.payload.isRepeatAgain) {
                    const exerciseToRepeat = state.exercises.find(e => e.id === action.payload.exerciseId);
                    if (exerciseToRepeat) {
                        state.exercises.push(exerciseToRepeat);
                    }
                }
            });
    }
});

export const { startSession, nextExercise, recordCorrectAnswer, endSession, resetSession, retryIncorrectExercise } = sessionSlice.actions;
export default sessionSlice.reducer;
