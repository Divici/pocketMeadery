import { uuid } from '../../lib/uuid';
import type { DbAdapter } from '../DbAdapter';
import type { Batch, BatchStatus, CreateBatchInput } from '../types';

const ACTIVE_STATUSES: BatchStatus[] = ['ACTIVE_PRIMARY', 'SECONDARY', 'AGING'];
const COMPLETED_STATUSES: BatchStatus[] = ['BOTTLED', 'ARCHIVED'];

export async function createBatch(
  db: DbAdapter,
  input: CreateBatchInput
): Promise<Batch> {
  const id = uuid();
  const now = Date.now();
  const status = input.status ?? 'ACTIVE_PRIMARY';

  await db.runAsync(
    `INSERT INTO batches (id, name, created_at, updated_at, status, batch_volume_value, batch_volume_unit, notes, goal_abv, expected_abv, current_abv)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.name,
    now,
    now,
    status,
    input.batch_volume_value ?? null,
    input.batch_volume_unit ?? null,
    input.notes ?? null,
    input.goal_abv ?? null,
    null,
    null
  );

  const batch = await getBatchById(db, id);
  if (!batch) throw new Error('Failed to create batch');
  return batch;
}

export async function getBatchById(
  db: DbAdapter,
  id: string
): Promise<Batch | null> {
  const row = await db.getFirstAsync<Batch>(
    'SELECT * FROM batches WHERE id = ?',
    id
  );
  return row;
}

export async function listActiveBatches(db: DbAdapter): Promise<Batch[]> {
  const placeholders = ACTIVE_STATUSES.map(() => '?').join(',');
  return db.getAllAsync<Batch>(
    `SELECT * FROM batches WHERE status IN (${placeholders}) ORDER BY updated_at DESC`,
    ...ACTIVE_STATUSES
  );
}

export async function listCompletedBatches(db: DbAdapter): Promise<Batch[]> {
  const placeholders = COMPLETED_STATUSES.map(() => '?').join(',');
  return db.getAllAsync<Batch>(
    `SELECT * FROM batches WHERE status IN (${placeholders}) ORDER BY updated_at DESC`,
    ...COMPLETED_STATUSES
  );
}

export type UpdateBatchInput = Partial<
  Pick<
    Batch,
    'name' | 'created_at' | 'status' | 'batch_volume_value' | 'batch_volume_unit' | 'notes' | 'goal_abv' | 'expected_abv' | 'current_abv'
  >
>;

export async function updateBatch(
  db: DbAdapter,
  id: string,
  input: UpdateBatchInput
): Promise<Batch | null> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.created_at !== undefined) {
    updates.push('created_at = ?');
    values.push(input.created_at);
  }
  if (input.status !== undefined) {
    updates.push('status = ?');
    values.push(input.status);
  }
  if (input.batch_volume_value !== undefined) {
    updates.push('batch_volume_value = ?');
    values.push(input.batch_volume_value);
  }
  if (input.batch_volume_unit !== undefined) {
    updates.push('batch_volume_unit = ?');
    values.push(input.batch_volume_unit);
  }
  if (input.notes !== undefined) {
    updates.push('notes = ?');
    values.push(input.notes);
  }
  if (input.goal_abv !== undefined) {
    updates.push('goal_abv = ?');
    values.push(input.goal_abv);
  }
  if (input.expected_abv !== undefined) {
    updates.push('expected_abv = ?');
    values.push(input.expected_abv);
  }
  if (input.current_abv !== undefined) {
    updates.push('current_abv = ?');
    values.push(input.current_abv);
  }

  if (updates.length === 0) return getBatchById(db, id);

  updates.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  await db.runAsync(
    `UPDATE batches SET ${updates.join(', ')} WHERE id = ?`,
    ...values
  );

  return getBatchById(db, id);
}

export async function deleteBatch(db: DbAdapter, id: string): Promise<void> {
  await db.runAsync('DELETE FROM batches WHERE id = ?', id);
}
