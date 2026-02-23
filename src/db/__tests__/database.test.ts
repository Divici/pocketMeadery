import Database from 'better-sqlite3';
import { MIGRATIONS, LATEST_VERSION } from '../migrations';

describe('database migrations', () => {
  it('defines v1 migration', () => {
    expect(MIGRATIONS).toHaveLength(1);
    expect(MIGRATIONS[0]).toContain('CREATE TABLE');
    expect(MIGRATIONS[0]).toContain('batches');
    expect(MIGRATIONS[0]).toContain('ingredients');
    expect(MIGRATIONS[0]).toContain('steps');
    expect(MIGRATIONS[0]).toContain('step_edit_history');
    expect(MIGRATIONS[0]).toContain('reminders');
    expect(MIGRATIONS[0]).toContain('app_settings');
  });

  it('LATEST_VERSION matches migration count', () => {
    expect(LATEST_VERSION).toBe(MIGRATIONS.length);
  });

  it('v1 migration runs successfully and creates schema', () => {
    const db = new Database(':memory:');

    db.exec(MIGRATIONS[0]);
    db.exec('PRAGMA user_version = 1');

    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
      )
      .all() as { name: string }[];
    const tableNames = tables.map((t) => t.name);

    expect(tableNames).toContain('batches');
    expect(tableNames).toContain('ingredients');
    expect(tableNames).toContain('steps');
    expect(tableNames).toContain('step_edit_history');
    expect(tableNames).toContain('reminders');
    expect(tableNames).toContain('app_settings');

    const version = db.prepare('PRAGMA user_version').get() as {
      user_version: number;
    };
    expect(version.user_version).toBe(1);

    db.close();
  });

  it('batches table has expected columns', () => {
    const db = new Database(':memory:');
    db.exec(MIGRATIONS[0]);

    const cols = db
      .prepare('PRAGMA table_info(batches)')
      .all() as { name: string }[];
    const colNames = cols.map((c) => c.name);

    expect(colNames).toContain('id');
    expect(colNames).toContain('name');
    expect(colNames).toContain('goal_abv');
    expect(colNames).toContain('expected_abv');
    expect(colNames).toContain('current_abv');

    db.close();
  });
});
