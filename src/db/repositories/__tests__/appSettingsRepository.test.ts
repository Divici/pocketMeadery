import Database from 'better-sqlite3';
import { MIGRATIONS } from '../../migrations';
import { createTestDbAdapter } from '../../testDbAdapter';
import {
  getSetting,
  setSetting,
} from '../appSettingsRepository';

describe('appSettingsRepository', () => {
  let sqlite: Database.Database;
  let db: ReturnType<typeof createTestDbAdapter>;

  beforeEach(() => {
    sqlite = new Database(':memory:');
    sqlite.exec(MIGRATIONS[0]);
    sqlite.exec('PRAGMA user_version = 1');
    db = createTestDbAdapter(sqlite);
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('getSetting / setSetting', () => {
    it('returns null for unset key', async () => {
      const value = await getSetting(db, 'units');
      expect(value).toBeNull();
    });

    it('stores and retrieves setting', async () => {
      await setSetting(db, 'units', 'metric');
      const value = await getSetting(db, 'units');
      expect(value).toBe('metric');
    });

    it('overwrites existing value', async () => {
      await setSetting(db, 'theme', 'light');
      await setSetting(db, 'theme', 'dark');
      const value = await getSetting(db, 'theme');
      expect(value).toBe('dark');
    });
  });
});
