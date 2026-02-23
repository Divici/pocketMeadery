import Database from 'better-sqlite3';
import { MIGRATIONS } from '../../db/migrations';
import { createBatch } from '../../db/repositories/batchRepository';
import { createStep } from '../../db/repositories/stepRepository';
import { createTestDbAdapter } from '../../db/testDbAdapter';
import { recalculateBatchABV } from '../batchAbvService';

describe('batchAbvService', () => {
  let sqlite: Database.Database;
  let db: ReturnType<typeof createTestDbAdapter>;
  let batchId: string;

  beforeEach(async () => {
    sqlite = new Database(':memory:');
    sqlite.exec(MIGRATIONS[0]);
    sqlite.exec('PRAGMA user_version = 1');
    db = createTestDbAdapter(sqlite);
    const batch = await createBatch(db, { name: 'Test' });
    batchId = batch.id;
  });

  afterEach(() => {
    sqlite.close();
  });

  it('does nothing when no gravity readings', async () => {
    await createStep(db, {
      batch_id: batchId,
      occurred_at: 1000,
      notes: 'No gravity',
    });
    await recalculateBatchABV(db, batchId);
    const batch = await sqlite.prepare('SELECT expected_abv, current_abv FROM batches WHERE id = ?').get(batchId) as { expected_abv: number | null; current_abv: number | null };
    expect(batch.expected_abv).toBeNull();
    expect(batch.current_abv).toBeNull();
  });

  it('does nothing when only one gravity reading', async () => {
    await createStep(db, {
      batch_id: batchId,
      occurred_at: 1000,
      notes: 'OG',
      gravity: 1.08,
    });
    await recalculateBatchABV(db, batchId);
    const batch = await sqlite.prepare('SELECT expected_abv, current_abv FROM batches WHERE id = ?').get(batchId) as { expected_abv: number | null; current_abv: number | null };
    expect(batch.expected_abv).toBeNull();
    expect(batch.current_abv).toBeNull();
  });

  it('updates expected_abv and current_abv when two+ gravity readings', async () => {
    await createStep(db, {
      batch_id: batchId,
      occurred_at: 1000,
      notes: 'OG',
      gravity: 1.08,
    });
    await createStep(db, {
      batch_id: batchId,
      occurred_at: 2000,
      notes: 'FG',
      gravity: 1.01,
    });
    await recalculateBatchABV(db, batchId);
    const batch = await sqlite.prepare('SELECT expected_abv, current_abv FROM batches WHERE id = ?').get(batchId) as { expected_abv: number; current_abv: number };
    const expectedAbv = (1.08 - 1.01) * 131.25;
    expect(batch.expected_abv).toBeCloseTo(expectedAbv, 2);
    expect(batch.current_abv).toBeCloseTo(expectedAbv, 2);
  });

  it('uses earliest and latest gravity by occurred_at', async () => {
    await createStep(db, {
      batch_id: batchId,
      occurred_at: 3000,
      notes: 'Latest',
      gravity: 1.01,
    });
    await createStep(db, {
      batch_id: batchId,
      occurred_at: 1000,
      notes: 'Earliest',
      gravity: 1.09,
    });
    await createStep(db, {
      batch_id: batchId,
      occurred_at: 2000,
      notes: 'Middle',
      gravity: 1.05,
    });
    await recalculateBatchABV(db, batchId);
    const batch = await sqlite.prepare('SELECT expected_abv FROM batches WHERE id = ?').get(batchId) as { expected_abv: number };
    expect(batch.expected_abv).toBeCloseTo((1.09 - 1.01) * 131.25, 2);
  });
});
