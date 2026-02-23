import Database from 'better-sqlite3';
import { MIGRATIONS } from '../../migrations';
import { createTestDbAdapter } from '../../testDbAdapter';
import {
  createBatch,
  getBatchById,
  listActiveBatches,
  listCompletedBatches,
  updateBatch,
} from '../batchRepository';

describe('batchRepository', () => {
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

  describe('createBatch', () => {
    it('creates a batch with required fields', async () => {
      const batch = await createBatch(db, {
        name: 'Test Mead',
      });

      expect(batch.id).toBeDefined();
      expect(batch.name).toBe('Test Mead');
      expect(batch.status).toBe('ACTIVE_PRIMARY');
      expect(batch.created_at).toBeGreaterThan(0);
      expect(batch.updated_at).toBeGreaterThan(0);
      expect(batch.goal_abv).toBeNull();
      expect(batch.expected_abv).toBeNull();
      expect(batch.current_abv).toBeNull();
    });

    it('creates a batch with optional fields', async () => {
      const batch = await createBatch(db, {
        name: 'Honey Wine',
        status: 'AGING',
        batch_volume_value: 1,
        batch_volume_unit: 'gal',
        goal_abv: 14,
      });

      expect(batch.status).toBe('AGING');
      expect(batch.batch_volume_value).toBe(1);
      expect(batch.batch_volume_unit).toBe('gal');
      expect(batch.goal_abv).toBe(14);
    });
  });

  describe('getBatchById', () => {
    it('returns batch when found', async () => {
      const created = await createBatch(db, { name: 'Found' });
      const found = await getBatchById(db, created.id);
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Found');
    });

    it('returns null when not found', async () => {
      const found = await getBatchById(db, 'nonexistent-id');
      expect(found).toBeNull();
    });
  });

  describe('listActiveBatches', () => {
    it('returns only ACTIVE_PRIMARY, SECONDARY, AGING', async () => {
      await createBatch(db, { name: 'A1', status: 'ACTIVE_PRIMARY' });
      await createBatch(db, { name: 'A2', status: 'SECONDARY' });
      await createBatch(db, { name: 'A3', status: 'AGING' });
      await createBatch(db, { name: 'C1', status: 'BOTTLED' });
      await createBatch(db, { name: 'C2', status: 'ARCHIVED' });

      const active = await listActiveBatches(db);
      expect(active).toHaveLength(3);
      expect(active.map((b) => b.name).sort()).toEqual(['A1', 'A2', 'A3']);
    });

    it('orders by updated_at descending', async () => {
      const b1 = await createBatch(db, { name: 'First' });
      await createBatch(db, { name: 'Second' });
      await updateBatch(db, b1.id, { name: 'FirstUpdated' });

      const active = await listActiveBatches(db);
      expect(active[0].name).toBe('FirstUpdated');
    });
  });

  describe('listCompletedBatches', () => {
    it('returns only BOTTLED and ARCHIVED', async () => {
      await createBatch(db, { name: 'A', status: 'ACTIVE_PRIMARY' });
      await createBatch(db, { name: 'B', status: 'BOTTLED' });
      await createBatch(db, { name: 'C', status: 'ARCHIVED' });

      const completed = await listCompletedBatches(db);
      expect(completed).toHaveLength(2);
      expect(completed.map((b) => b.name).sort()).toEqual(['B', 'C']);
    });
  });

  describe('updateBatch', () => {
    it('updates batch fields', async () => {
      const batch = await createBatch(db, { name: 'Original' });
      const updated = await updateBatch(db, batch.id, {
        name: 'Updated',
        status: 'BOTTLED',
      });
      expect(updated?.name).toBe('Updated');
      expect(updated?.status).toBe('BOTTLED');
    });
  });
});
