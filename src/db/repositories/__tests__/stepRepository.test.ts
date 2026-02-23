import Database from 'better-sqlite3';
import { MIGRATIONS } from '../../migrations';
import { createBatch } from '../batchRepository';
import { createTestDbAdapter } from '../../testDbAdapter';
import {
  createStep,
  getStepById,
  listStepsByBatch,
  updateStep,
  saveStepEditHistory,
  getStepEditHistory,
  restoreStepFromHistory,
} from '../stepRepository';

describe('stepRepository', () => {
  let sqlite: Database.Database;
  let db: ReturnType<typeof createTestDbAdapter>;
  let batchId: string;

  beforeEach(async () => {
    sqlite = new Database(':memory:');
    sqlite.exec(MIGRATIONS[0]);
    sqlite.exec('PRAGMA user_version = 1');
    db = createTestDbAdapter(sqlite);
    const batch = await createBatch(db, { name: 'Test Batch' });
    batchId = batch.id;
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('createStep', () => {
    it('creates step with required fields', async () => {
      const step = await createStep(db, {
        batch_id: batchId,
        occurred_at: Date.now(),
        notes: 'Pitched yeast',
      });
      expect(step.id).toBeDefined();
      expect(step.notes).toBe('Pitched yeast');
      expect(step.gravity).toBeNull();
      expect(step.is_deleted).toBe(0);
    });

    it('creates step with optional gravity and title', async () => {
      const step = await createStep(db, {
        batch_id: batchId,
        occurred_at: 1000,
        notes: 'OG reading',
        title: 'Initial gravity',
        gravity: 1.08,
      });
      expect(step.title).toBe('Initial gravity');
      expect(step.gravity).toBe(1.08);
    });
  });

  describe('listStepsByBatch', () => {
    it('returns steps newest-first by occurred_at', async () => {
      await createStep(db, {
        batch_id: batchId,
        occurred_at: 1000,
        notes: 'First',
      });
      await createStep(db, {
        batch_id: batchId,
        occurred_at: 3000,
        notes: 'Third',
      });
      await createStep(db, {
        batch_id: batchId,
        occurred_at: 2000,
        notes: 'Second',
      });
      const list = await listStepsByBatch(db, batchId);
      expect(list).toHaveLength(3);
      expect(list[0].notes).toBe('Third');
      expect(list[1].notes).toBe('Second');
      expect(list[2].notes).toBe('First');
    });

    it('excludes is_deleted steps', async () => {
      const step = await createStep(db, {
        batch_id: batchId,
        occurred_at: 1000,
        notes: 'Will delete',
      });
      await updateStep(db, step.id, { is_deleted: 1 });
      const list = await listStepsByBatch(db, batchId);
      expect(list).toHaveLength(0);
    });
  });

  describe('updateStep', () => {
    it('updates step fields', async () => {
      const step = await createStep(db, {
        batch_id: batchId,
        occurred_at: 1000,
        notes: 'Original',
      });
      const updated = await updateStep(db, step.id, {
        notes: 'Updated',
        gravity: 1.05,
      });
      expect(updated?.notes).toBe('Updated');
      expect(updated?.gravity).toBe(1.05);
    });
  });

  describe('step edit history (one-level undo)', () => {
    it('saves previous state before edit and can restore', async () => {
      const step = await createStep(db, {
        batch_id: batchId,
        occurred_at: 1000,
        notes: 'Original notes',
        title: 'Original title',
        gravity: 1.08,
      });

      await saveStepEditHistory(db, step.id, {
        previous_notes: step.notes,
        previous_gravity: step.gravity,
        previous_title: step.title,
        previous_occurred_at: step.occurred_at,
      });

      await updateStep(db, step.id, {
        notes: 'Edited',
        title: 'Edited title',
        gravity: 1.05,
        occurred_at: 2000,
      });

      const history = await getStepEditHistory(db, step.id);
      expect(history).not.toBeNull();
      expect(history!.previous_notes).toBe('Original notes');
      expect(history!.previous_gravity).toBe(1.08);
      expect(history!.previous_title).toBe('Original title');
      expect(history!.previous_occurred_at).toBe(1000);

      await restoreStepFromHistory(db, step.id);
      const restored = await getStepById(db, step.id);
      expect(restored?.notes).toBe('Original notes');
      expect(restored?.gravity).toBe(1.08);
      expect(restored?.title).toBe('Original title');
      expect(restored?.occurred_at).toBe(1000);
    });
  });
});
