import * as SQLite from 'expo-sqlite';
import { schemaQueries } from './schema';
import seedData from './seed.json';

export const DATABASE_NAME = 'fiqh_lingo.db';

export async function initDatabase(db: SQLite.SQLiteDatabase) {
    try {
        // Check if tables already exist (simple check)
        const result = await db.getFirstAsync<{ count: number }>(
            "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='units';"
        );

        if (result && result.count === 0) {
            console.log("Initializing database schema...");
            await db.execAsync(schemaQueries);
            console.log("Seeding database from JSON...");

            // Profiles
            for (const p of seedData.profiles) {
                await db.runAsync('INSERT OR IGNORE INTO profiles (id, total_xp, streak_count, hearts, has_onboarded, last_active_at) VALUES (?, ?, ?, ?, ?, ?)', [p.id, p.total_xp, p.streak_count, p.hearts, p.has_onboarded, p.last_active_at]);
            }
            // Units
            for (const u of seedData.units) {
                await db.runAsync('INSERT OR IGNORE INTO units (id, title, description, order_index) VALUES (?, ?, ?, ?)', [u.id, u.title, u.description, u.order_index]);
            }
            // Nodes
            for (const n of seedData.nodes) {
                await db.runAsync('INSERT OR IGNORE INTO nodes (id, unit_id, title, order_index) VALUES (?, ?, ?, ?)', [n.id, n.unit_id, n.title, n.order_index]);
            }
            // Levels
            for (const l of seedData.levels) {
                await db.runAsync('INSERT OR IGNORE INTO levels (id, node_id, title, order_index) VALUES (?, ?, ?, ?)', [l.id, l.node_id, l.title, l.order_index]);
            }
            // Exercises
            for (const e of seedData.exercises) {
                await db.runAsync('INSERT OR IGNORE INTO exercises (id, level_id, type, content_json, correct_answer) VALUES (?, ?, ?, ?, ?)', [e.id, e.level_id, e.type, JSON.stringify(e.content), e.correct_answer]);
            }

            console.log("Database initialized and JSON seeded successfully.");
        } else {
            console.log("Database already initialized.");
        }
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}
