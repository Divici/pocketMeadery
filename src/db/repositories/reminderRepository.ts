import { uuid } from '../../lib/uuid';
import type { DbAdapter } from '../DbAdapter';
import type { Reminder, CreateReminderInput } from '../types';

export async function createReminder(
  db: DbAdapter,
  input: CreateReminderInput
): Promise<Reminder> {
  const id = uuid();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO reminders (id, batch_id, template_key, title, body, scheduled_for, notification_id, created_at, updated_at, is_completed, completed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)`,
    id,
    input.batch_id,
    input.template_key,
    input.title,
    input.body ?? null,
    input.scheduled_for,
    input.notification_id ?? null,
    now,
    now
  );

  const reminder = await getReminderById(db, id);
  if (!reminder) throw new Error('Failed to create reminder');
  return reminder;
}

export async function getReminderById(
  db: DbAdapter,
  id: string
): Promise<Reminder | null> {
  return db.getFirstAsync<Reminder>(
    'SELECT * FROM reminders WHERE id = ?',
    id
  );
}

export async function listUpcomingReminders(
  db: DbAdapter,
  limit: number = 10
): Promise<Reminder[]> {
  return db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE is_completed = 0 ORDER BY scheduled_for ASC LIMIT ?',
    limit
  );
}

export async function listUpcomingRemindersByBatch(
  db: DbAdapter,
  batchId: string,
  limit: number = 10
): Promise<Reminder[]> {
  return db.getAllAsync<Reminder>(
    'SELECT * FROM reminders WHERE batch_id = ? AND is_completed = 0 ORDER BY scheduled_for ASC LIMIT ?',
    batchId,
    limit
  );
}

export type UpdateReminderInput = Partial<
  Pick<Reminder, 'title' | 'body' | 'scheduled_for' | 'notification_id'>
>;

export async function updateReminder(
  db: DbAdapter,
  id: string,
  input: UpdateReminderInput
): Promise<Reminder | null> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.title !== undefined) {
    updates.push('title = ?');
    values.push(input.title);
  }
  if (input.body !== undefined) {
    updates.push('body = ?');
    values.push(input.body);
  }
  if (input.scheduled_for !== undefined) {
    updates.push('scheduled_for = ?');
    values.push(input.scheduled_for);
  }
  if (input.notification_id !== undefined) {
    updates.push('notification_id = ?');
    values.push(input.notification_id);
  }

  if (updates.length === 0) return getReminderById(db, id);

  updates.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  await db.runAsync(
    `UPDATE reminders SET ${updates.join(', ')} WHERE id = ?`,
    ...values
  );

  return getReminderById(db, id);
}

export async function markReminderCompleted(
  db: DbAdapter,
  id: string
): Promise<Reminder | null> {
  const now = Date.now();
  await db.runAsync(
    'UPDATE reminders SET is_completed = 1, completed_at = ?, updated_at = ? WHERE id = ?',
    now,
    now,
    id
  );
  return getReminderById(db, id);
}
