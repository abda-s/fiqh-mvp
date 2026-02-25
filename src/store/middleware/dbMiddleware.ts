import { Middleware } from '@reduxjs/toolkit';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../../db/client';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from '../../db/schema';
import { eq } from 'drizzle-orm';

export const dbMiddleware: Middleware = store => next => action => {
    // We capture state before it modifies for endSession to ensure we have the session context
    const prevState = store.getState();
    const act = action as any;

    if (act.type === 'session/endSession') {
        try {
            const db = SQLite.openDatabaseSync(DATABASE_NAME);
            const drizzleDb = drizzle(db, { schema });
            const session = prevState.session;

            if (session.currentLevelId && session.currentLevelId !== -1) {
                // Using runSync inside middleware is tricky with Drizzle's Promise-based API for react-native.
                // However, Drizzle Expo-SQLite driver supports async correctly. We just use fire-and-forget promises.
                drizzleDb.insert(schema.userProgress).values({
                    levelId: session.currentLevelId,
                    isCompleted: 1,
                    highScore: 0
                }).onConflictDoUpdate({
                    target: schema.userProgress.levelId,
                    set: { isCompleted: 1 }
                }).catch(e => console.error("Failed to update level progress via Drizzle:", e));
            }
        } catch (e) {
            console.error("Failed to setup drizzle for progress tracking:", e);
        }
    }

    const result = next(action);
    const state = store.getState();

    // Intercept specific actions and fire and forget SQLite updates
    if (
        act.type === 'user/addXP' ||
        act.type === 'user/deductHeart' ||
        act.type === 'user/refillHearts' ||
        act.type === 'user/updateStreak' ||
        act.type === 'user/completeOnboarding' ||
        act.type === 'user/setUserStats'
    ) {
        try {
            const db = SQLite.openDatabaseSync(DATABASE_NAME);
            const drizzleDb = drizzle(db, { schema });
            const user = state.user;

            drizzleDb.update(schema.profiles)
                .set({
                    totalXp: user.totalXP,
                    hearts: user.hearts,
                    streakCount: user.streakCount,
                    hasOnboarded: user.hasOnboarded ? 1 : 0,
                    knowledgeLevel: user.knowledgeLevel,
                    timeCommitment: user.timeCommitment,
                    lastActiveAt: user.lastActiveAt
                })
                .where(eq(schema.profiles.id, 1))
                .catch(err => console.error("DB Update Error Profiles via Drizzle:", err));

        } catch (e) {
            console.error("Failed to open db synchronously:", e);
        }
    }

    return result;
};
