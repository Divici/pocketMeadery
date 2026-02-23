export type GravityReading = {
  gravity: number | null;
  occurredAt: number;
};

/**
 * Compute ABV from earliest and latest gravity readings by occurredAt.
 * Formula: ABV ≈ (OG - FG) * 131.25
 * Returns null if fewer than 2 readings with gravity.
 */
export function calculateABV(
  readings: GravityReading[]
): number | null {
  const withGravity = readings.filter(
    (r): r is GravityReading & { gravity: number } =>
      r.gravity != null && typeof r.gravity === 'number'
  );
  if (withGravity.length < 2) return null;

  const sorted = [...withGravity].sort((a, b) => a.occurredAt - b.occurredAt);
  const og = sorted[0].gravity;
  const fg = sorted[sorted.length - 1].gravity;

  return (og - fg) * 131.25;
}
