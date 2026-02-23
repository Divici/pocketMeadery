/**
 * Minimal DB interface for repositories.
 * Implemented by expo-sqlite and by our test adapter (better-sqlite3).
 */
export interface DbAdapter {
  runAsync(sql: string, ...params: unknown[]): Promise<{ lastInsertRowId: number; changes: number }>;
  getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null>;
  getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]>;
}
