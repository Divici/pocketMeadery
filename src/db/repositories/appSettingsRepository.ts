import type { DbAdapter } from '../DbAdapter';

export async function getSetting(
  db: DbAdapter,
  key: string
): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>(
    'SELECT value FROM app_settings WHERE key = ?',
    key
  );
  return row?.value ?? null;
}

export async function setSetting(
  db: DbAdapter,
  key: string,
  value: string
): Promise<void> {
  await db.runAsync(
    'INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)',
    key,
    value
  );
}
