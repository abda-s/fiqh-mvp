import { Alert } from 'react-native';
import { deleteDatabaseAsync, SQLiteDatabase } from 'expo-sqlite';
import { DATABASE_NAME } from '../db/client';

/**
 * Development utility to reset the SQLite database.
 * Prompts the user to restart the app after deletion.
 * @param db The SQLite database instance.
 */
export const resetDatabase = async (db: SQLiteDatabase) => {
    try {
        await db.closeAsync();
        await deleteDatabaseAsync(DATABASE_NAME);
        Alert.alert('Database Deleted', 'Please restart the app completely to re-initialize the database schema and seeds.');
    } catch (e) {
        Alert.alert('Error', 'Failed to delete database: ' + String(e));
    }
};
