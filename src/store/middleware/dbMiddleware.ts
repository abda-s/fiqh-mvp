import { Middleware } from '@reduxjs/toolkit';
import * as SQLite from 'expo-sqlite';
import { DATABASE_NAME } from '../../db/client';

export const dbMiddleware: Middleware = store => next => action => {
    // We capture state before it modifies for endSession to ensure we have the session context
    const prevState = store.getState();
    const act = action as any;

    if (act.type === 'session/endSession') {
        try {
            const db = SQLite.openDatabaseSync(DATABASE_NAME);
            const session = prevState.session;

            if (session.currentLevelId && session.currentLevelId !== -1) {
                const existing = db.getFirstSync<{ id: number }>('SELECT id FROM user_progress WHERE level_id = ?', [session.currentLevelId]);
                if (existing) {
                    db.execSync(`UPDATE user_progress SET is_completed = 1 WHERE level_id = ${session.currentLevelId};`);
                } else {
                    db.execSync(`INSERT INTO user_progress (level_id, is_completed, high_score) VALUES (${session.currentLevelId}, 1, 0);`);
                }
            }
        } catch (e) {
            console.error("Failed to update progress:", e);
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
            const user = state.user;

            const onboardedVal = user.hasOnboarded ? 1 : 0;
            const kl = user.knowledgeLevel ? "'" + user.knowledgeLevel + "'" : 'NULL';
            const tc = user.timeCommitment ? user.timeCommitment : 'NULL';

            // Update profiles
            db.execAsync(`
        UPDATE profiles SET 
          total_xp = ${user.totalXP}, 
          hearts = ${user.hearts},
          streak_count = ${user.streakCount},
          has_onboarded = ${onboardedVal},
          knowledge_level = ${kl},
          time_commitment = ${tc},
          last_active_at = ${user.lastActiveAt ? "'" + user.lastActiveAt + "'" : 'NULL'}
        WHERE id = 1;
      `).catch(err => console.error("DB Update Error Profiles:", err));

        } catch (e) {
            console.error("Failed to open db synchronously:", e);
        }
    }

    return result;
};
