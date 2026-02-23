export const MIGRATIONS: readonly string[] = [
  // v1: create all MVP tables + indexes
  `
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      status TEXT NOT NULL,
      batch_volume_value REAL,
      batch_volume_unit TEXT,
      notes TEXT,
      goal_abv REAL,
      expected_abv REAL,
      current_abv REAL
    );

    CREATE TABLE IF NOT EXISTS ingredients (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      amount_value REAL,
      amount_unit TEXT,
      ingredient_type TEXT,
      notes TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS steps (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      occurred_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      title TEXT,
      notes TEXT NOT NULL,
      gravity REAL,
      temperature_value REAL,
      temperature_unit TEXT,
      is_deleted INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS step_edit_history (
      step_id TEXT PRIMARY KEY REFERENCES steps(id) ON DELETE CASCADE,
      previous_notes TEXT NOT NULL,
      previous_gravity REAL,
      previous_title TEXT,
      previous_occurred_at INTEGER NOT NULL,
      saved_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
      template_key TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      scheduled_for INTEGER NOT NULL,
      notification_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      completed_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_steps_batch_occurred ON steps(batch_id, occurred_at DESC);
    CREATE INDEX IF NOT EXISTS idx_ingredients_batch ON ingredients(batch_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_scheduled ON reminders(scheduled_for ASC);
    CREATE INDEX IF NOT EXISTS idx_batches_status_updated ON batches(status, updated_at DESC);
  `,
];

export const LATEST_VERSION = MIGRATIONS.length;
