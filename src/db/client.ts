import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';
import seedData from './seed.json';

export const DATABASE_NAME = 'fiqh_lingo.db';

export async function initDatabase(db: SQLite.SQLiteDatabase) {
    try {
        const drizzleDb = drizzle(db, { schema });
        // Check if tables already exist (simple check)
        const result = await db.getFirstAsync<{ count: number }>(
            "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='units';"
        );

        if (result && result.count === 0) {
            console.log("Initializing database schema...");

            // Raw creation is standard for Expo SQLite MVP
            await db.execAsync(`
              PRAGMA foreign_keys = ON;
              CREATE TABLE IF NOT EXISTS units (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT, order_index INTEGER NOT NULL);
              CREATE TABLE IF NOT EXISTS nodes (id INTEGER PRIMARY KEY AUTOINCREMENT, unit_id INTEGER NOT NULL REFERENCES units(id), title TEXT NOT NULL, order_index INTEGER NOT NULL);
              CREATE TABLE IF NOT EXISTS levels (id INTEGER PRIMARY KEY AUTOINCREMENT, node_id INTEGER NOT NULL REFERENCES nodes(id), title TEXT NOT NULL, order_index INTEGER NOT NULL);
              CREATE TABLE IF NOT EXISTS exercises (id INTEGER PRIMARY KEY AUTOINCREMENT, level_id INTEGER NOT NULL REFERENCES levels(id), type TEXT NOT NULL, content_json TEXT NOT NULL, correct_answer TEXT NOT NULL, explanation TEXT NOT NULL);
              CREATE TABLE IF NOT EXISTS profiles (id INTEGER PRIMARY KEY AUTOINCREMENT, total_xp INTEGER DEFAULT 0, streak_count INTEGER DEFAULT 0, hearts INTEGER DEFAULT 5, has_onboarded INTEGER DEFAULT 0, knowledge_level TEXT, time_commitment INTEGER, last_active_at TEXT);
              CREATE TABLE IF NOT EXISTS user_progress (id INTEGER PRIMARY KEY AUTOINCREMENT, level_id INTEGER UNIQUE NOT NULL REFERENCES levels(id), is_completed INTEGER DEFAULT 0, high_score INTEGER DEFAULT 0);
              CREATE TABLE IF NOT EXISTS srs_reviews (id INTEGER PRIMARY KEY AUTOINCREMENT, exercise_id INTEGER UNIQUE NOT NULL REFERENCES exercises(id), ease_factor REAL DEFAULT 2.5, interval INTEGER DEFAULT 0, repetitions INTEGER DEFAULT 0, next_review_date TEXT);
            `);

            console.log("Seeding database from JSON via Drizzle...");

            // Profiles
            if (seedData.profiles.length > 0) {
                const mappedProfiles = seedData.profiles.map(p => ({
                    id: p.id,
                    totalXp: p.total_xp,
                    streakCount: p.streak_count,
                    hearts: p.hearts,
                    hasOnboarded: p.has_onboarded,
                    lastActiveAt: p.last_active_at
                }));
                await drizzleDb.insert(schema.profiles).values(mappedProfiles);
            }
            // Units
            if (seedData.units.length > 0) {
                const mappedUnits = seedData.units.map(u => ({
                    id: u.id,
                    title: u.title,
                    description: u.description,
                    orderIndex: u.order_index
                }));
                await drizzleDb.insert(schema.units).values(mappedUnits);
            }
            // Nodes
            if (seedData.nodes.length > 0) {
                const mappedNodes = seedData.nodes.map(n => ({
                    id: n.id,
                    unitId: n.unit_id,
                    title: n.title,
                    orderIndex: n.order_index
                }));
                await drizzleDb.insert(schema.nodes).values(mappedNodes);
            }
            // Levels
            if (seedData.levels.length > 0) {
                const mappedLevels = seedData.levels.map(l => ({
                    id: l.id,
                    nodeId: l.node_id,
                    title: l.title,
                    orderIndex: l.order_index
                }));
                await drizzleDb.insert(schema.levels).values(mappedLevels);
            }
            // Exercises
            if (seedData.exercises.length > 0) {
                const mappedEx = seedData.exercises.map(e => ({
                    id: e.id,
                    levelId: e.level_id,
                    type: e.type,
                    contentJson: JSON.stringify(e.content),
                    correctAnswer: e.correct_answer,
                    explanation: e.explanation
                }));
                await drizzleDb.insert(schema.exercises).values(mappedEx);
            }

            console.log("Database initialized and JSON seeded successfully via Drizzle ORM.");
        } else {
            console.log("Database already initialized.");
        }
    } catch (error) {
        console.error("Error initializing database:", error);
        throw error;
    }
}
