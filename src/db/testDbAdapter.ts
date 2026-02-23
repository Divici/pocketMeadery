import Database from 'better-sqlite3';
import type { DbAdapter } from './DbAdapter';

/**
 * Wraps better-sqlite3 to match DbAdapter for tests.
 */
export function createTestDbAdapter(db: Database.Database): DbAdapter {
  return {
    async runAsync(sql: string, ...params: unknown[]) {
      const result = db.prepare(sql).run(...params);
      return {
        lastInsertRowId: Number(result.lastInsertRowid),
        changes: result.changes,
      };
    },
    async getFirstAsync<T>(sql: string, ...params: unknown[]) {
      const row = db.prepare(sql).get(...params);
      return (row as T) ?? null;
    },
    async getAllAsync<T>(sql: string, ...params: unknown[]) {
      const rows = db.prepare(sql).all(...params);
      return rows as T[];
    },
  };
}
