import Database from 'better-sqlite3';
import { MIGRATIONS } from '../../migrations';
import { createBatch } from '../batchRepository';
import { createTestDbAdapter } from '../../testDbAdapter';
import {
  createReminder,
  getReminderById,
  listUpcomingReminders,
  updateReminder,
  markReminderCompleted,
} from '../reminderRepository';

describe('reminderRepository', () => {
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

  describe('createReminder', () => {
    it('creates reminder with required fields', async () => {
      const now = Date.now();
      const reminder = await createReminder(db, {
        batch_id: batchId,
        template_key: 'RACK_IN_DAYS',
        title: 'Rack to secondary',
        scheduled_for: now + 86400000,
      });
      expect(reminder.id).toBeDefined();
      expect(reminder.batch_id).toBe(batchId);
      expect(reminder.template_key).toBe('RACK_IN_DAYS');
      expect(reminder.is_completed).toBe(0);
      expect(reminder.notification_id).toBeNull();
    });

    it('creates reminder with optional notification_id', async () => {
      const reminder = await createReminder(db, {
        batch_id: batchId,
        template_key: 'NUTRIENT_IN_HOURS',
        title: 'Add nutrient',
        scheduled_for: Date.now() + 3600000,
        notification_id: 'expo-notif-123',
      });
      expect(reminder.notification_id).toBe('expo-notif-123');
    });
  });

  describe('listUpcomingReminders', () => {
    it('returns reminders not completed, ordered by scheduled_for asc', async () => {
      const now = Date.now();
      await createReminder(db, {
        batch_id: batchId,
        template_key: 'RACK_IN_DAYS',
        title: 'Later',
        scheduled_for: now + 86400000 * 2,
      });
      await createReminder(db, {
        batch_id: batchId,
        template_key: 'RACK_IN_DAYS',
        title: 'Soon',
        scheduled_for: now + 86400000,
      });
      const list = await listUpcomingReminders(db, 3);
      expect(list).toHaveLength(2);
      expect(list[0].title).toBe('Soon');
      expect(list[1].title).toBe('Later');
    });

    it('excludes completed reminders', async () => {
      const reminder = await createReminder(db, {
        batch_id: batchId,
        template_key: 'RACK_IN_DAYS',
        title: 'Will complete',
        scheduled_for: Date.now() + 86400000,
      });
      await markReminderCompleted(db, reminder.id);
      const list = await listUpcomingReminders(db, 5);
      expect(list).toHaveLength(0);
    });

    it('limits to N results', async () => {
      const now = Date.now();
      for (let i = 0; i < 5; i++) {
        await createReminder(db, {
          batch_id: batchId,
          template_key: 'RACK_IN_DAYS',
          title: `Reminder ${i}`,
          scheduled_for: now + 86400000 * (i + 1),
        });
      }
      const list = await listUpcomingReminders(db, 3);
      expect(list).toHaveLength(3);
    });
  });

  describe('updateReminder', () => {
    it('updates reminder fields', async () => {
      const reminder = await createReminder(db, {
        batch_id: batchId,
        template_key: 'RACK_IN_DAYS',
        title: 'Original',
        scheduled_for: Date.now() + 86400000,
      });
      const updated = await updateReminder(db, reminder.id, {
        notification_id: 'new-id',
      });
      expect(updated?.notification_id).toBe('new-id');
    });
  });

  describe('markReminderCompleted', () => {
    it('sets is_completed and completed_at', async () => {
      const reminder = await createReminder(db, {
        batch_id: batchId,
        template_key: 'RACK_IN_DAYS',
        title: 'Complete me',
        scheduled_for: Date.now() + 86400000,
      });
      const updated = await markReminderCompleted(db, reminder.id);
      expect(updated?.is_completed).toBe(1);
      expect(updated?.completed_at).not.toBeNull();
    });
  });
});
