import type { Database } from './database';
import {
  MOCK_MEAD_BATCHES,
  MOCK_MEAD_INGREDIENTS,
  MOCK_MEAD_REMINDERS,
  MOCK_MEAD_SEED_VERSION,
  MOCK_MEAD_STEPS,
  USE_MOCK_MEADS,
} from '../constants/mockMeads';

const SEED_KEY = `mock_seed_${MOCK_MEAD_SEED_VERSION}`;

export async function ensureMockDataSeeded(db: Database): Promise<void> {
  if (!USE_MOCK_MEADS) return;

  const existing = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    SEED_KEY
  );
  if (existing?.value === '1') return;

  await db.execAsync('BEGIN');
  try {
    for (const b of MOCK_MEAD_BATCHES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO batches (
          id, name, created_at, updated_at, status, batch_volume_value, batch_volume_unit,
          notes, goal_abv, expected_abv, current_abv
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        b.id,
        b.name,
        b.created_at,
        b.updated_at,
        b.status,
        b.batch_volume_value,
        b.batch_volume_unit,
        b.notes,
        b.goal_abv,
        b.expected_abv,
        b.current_abv
      );
    }

    for (const ing of MOCK_MEAD_INGREDIENTS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO ingredients (
          id, batch_id, name, amount_value, amount_unit, ingredient_type, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ing.id,
        ing.batch_id,
        ing.name,
        ing.amount_value,
        ing.amount_unit,
        ing.ingredient_type,
        ing.notes,
        ing.created_at,
        ing.updated_at
      );
    }

    for (const step of MOCK_MEAD_STEPS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO steps (
          id, batch_id, occurred_at, created_at, updated_at, title, notes, gravity,
          temperature_value, temperature_unit, is_deleted
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, 0)`,
        step.id,
        step.batch_id,
        step.occurred_at,
        step.created_at,
        step.updated_at,
        step.title,
        step.notes,
        step.gravity
      );
    }

    for (const reminder of MOCK_MEAD_REMINDERS) {
      await db.runAsync(
        `INSERT OR IGNORE INTO reminders (
          id, batch_id, template_key, title, body, scheduled_for, notification_id,
          created_at, updated_at, is_completed, completed_at
        ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, 0, NULL)`,
        reminder.id,
        reminder.batch_id,
        reminder.template_key,
        reminder.title,
        reminder.body,
        reminder.scheduled_for,
        reminder.created_at,
        reminder.updated_at
      );
    }

    await db.runAsync(
      `INSERT INTO app_settings (key, value)
       VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      SEED_KEY,
      '1'
    );
    await db.execAsync('COMMIT');
  } catch (error) {
    await db.execAsync('ROLLBACK');
    throw error;
  }
}
