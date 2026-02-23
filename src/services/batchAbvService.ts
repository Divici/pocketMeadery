import { calculateABV } from '../lib/abv';
import type { DbAdapter } from '../db/DbAdapter';
import { listStepsByBatch } from '../db/repositories/stepRepository';
import { updateBatch } from '../db/repositories/batchRepository';

/**
 * Recalculate expected_abv and current_abv for a batch from its gravity readings.
 * Uses earliest + latest gravity by occurred_at.
 */
export async function recalculateBatchABV(
  db: DbAdapter,
  batchId: string
): Promise<void> {
  const steps = await listStepsByBatch(db, batchId);
  const readings = steps
    .filter((s) => s.gravity != null)
    .map((s) => ({ gravity: s.gravity!, occurredAt: s.occurred_at }));

  const abv = calculateABV(readings);

  await updateBatch(db, batchId, {
    expected_abv: abv,
    current_abv: abv,
  });
}
