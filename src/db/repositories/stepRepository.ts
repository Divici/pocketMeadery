import { uuid } from '../../lib/uuid';
import type { DbAdapter } from '../DbAdapter';
import type { Step, CreateStepInput, StepEditHistory } from '../types';

export async function createStep(
  db: DbAdapter,
  input: CreateStepInput
): Promise<Step> {
  const id = uuid();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO steps (id, batch_id, occurred_at, created_at, updated_at, title, notes, gravity, temperature_value, temperature_unit, is_deleted)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    id,
    input.batch_id,
    input.occurred_at,
    now,
    now,
    input.title ?? null,
    input.notes,
    input.gravity ?? null,
    null,
    null
  );

  const step = await getStepById(db, id);
  if (!step) throw new Error('Failed to create step');
  return step;
}

export async function getStepById(
  db: DbAdapter,
  id: string
): Promise<Step | null> {
  return db.getFirstAsync<Step>('SELECT * FROM steps WHERE id = ?', id);
}

export async function listStepsByBatch(
  db: DbAdapter,
  batchId: string
): Promise<Step[]> {
  return db.getAllAsync<Step>(
    'SELECT * FROM steps WHERE batch_id = ? AND is_deleted = 0 ORDER BY occurred_at DESC',
    batchId
  );
}

export type UpdateStepInput = Partial<
  Pick<
    Step,
    | 'occurred_at'
    | 'title'
    | 'notes'
    | 'gravity'
    | 'temperature_value'
    | 'temperature_unit'
    | 'is_deleted'
  >
>;

export async function updateStep(
  db: DbAdapter,
  id: string,
  input: UpdateStepInput
): Promise<Step | null> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.occurred_at !== undefined) {
    updates.push('occurred_at = ?');
    values.push(input.occurred_at);
  }
  if (input.title !== undefined) {
    updates.push('title = ?');
    values.push(input.title);
  }
  if (input.notes !== undefined) {
    updates.push('notes = ?');
    values.push(input.notes);
  }
  if (input.gravity !== undefined) {
    updates.push('gravity = ?');
    values.push(input.gravity);
  }
  if (input.temperature_value !== undefined) {
    updates.push('temperature_value = ?');
    values.push(input.temperature_value);
  }
  if (input.temperature_unit !== undefined) {
    updates.push('temperature_unit = ?');
    values.push(input.temperature_unit);
  }
  if (input.is_deleted !== undefined) {
    updates.push('is_deleted = ?');
    values.push(input.is_deleted);
  }

  if (updates.length === 0) return getStepById(db, id);

  updates.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  await db.runAsync(
    `UPDATE steps SET ${updates.join(', ')} WHERE id = ?`,
    ...values
  );

  return getStepById(db, id);
}

export type SaveStepEditHistoryInput = {
  previous_notes: string;
  previous_gravity: number | null;
  previous_title: string | null;
  previous_occurred_at: number;
};

export async function saveStepEditHistory(
  db: DbAdapter,
  stepId: string,
  input: SaveStepEditHistoryInput
): Promise<void> {
  const now = Date.now();
  await db.runAsync(
    `INSERT OR REPLACE INTO step_edit_history (step_id, previous_notes, previous_gravity, previous_title, previous_occurred_at, saved_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    stepId,
    input.previous_notes,
    input.previous_gravity,
    input.previous_title,
    input.previous_occurred_at,
    now
  );
}

export async function getStepEditHistory(
  db: DbAdapter,
  stepId: string
): Promise<StepEditHistory | null> {
  return db.getFirstAsync<StepEditHistory>(
    'SELECT * FROM step_edit_history WHERE step_id = ?',
    stepId
  );
}

export async function restoreStepFromHistory(
  db: DbAdapter,
  stepId: string
): Promise<Step | null> {
  const history = await getStepEditHistory(db, stepId);
  if (!history) return null;

  const updated = await updateStep(db, stepId, {
    notes: history.previous_notes,
    gravity: history.previous_gravity,
    title: history.previous_title,
    occurred_at: history.previous_occurred_at,
  });

  if (updated) {
    await db.runAsync('DELETE FROM step_edit_history WHERE step_id = ?', stepId);
  }

  return updated;
}
