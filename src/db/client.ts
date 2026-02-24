import * as SQLite from 'expo-sqlite';
import { schemaQueries, seedQueries } from './schema';

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
            console.log("Seeding database...");
            await db.execAsync(seedQueries);
            console.log("Database initialized and seeded.");
        } else {
            console.log("Database already initialized.");
        }
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}
