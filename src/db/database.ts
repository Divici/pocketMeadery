import * as SQLite from 'expo-sqlite';
import { MIGRATIONS, LATEST_VERSION } from './migrations';

const DB_NAME = 'pocketmeadery';

export type Database = SQLite.SQLiteDatabase;

export async function openDatabase(): Promise<Database> {
  const db = await SQLite.openDatabaseAsync(DB_NAME);

  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = row?.user_version ?? 0;

  for (let v = currentVersion; v < LATEST_VERSION; v++) {
    await db.execAsync(MIGRATIONS[v]);
    await db.runAsync(`PRAGMA user_version = ${v + 1}`);
  }

  return db;
}
