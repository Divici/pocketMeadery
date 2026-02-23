export type UnitsPreference = 'US' | 'metric';

const LB_TO_KG = 0.45359237;
const OZ_TO_G = 28.349523125;
const GAL_TO_L = 3.785411784;

function round(value: number, decimals: number = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function convertForDisplay(
  value: number,
  unit: string,
  preference: UnitsPreference
): { value: number; unit: string } {
  const normalized = unit.trim().toLowerCase();

  if (preference === 'metric') {
    if (normalized === 'lb') return { value: round(value * LB_TO_KG), unit: 'kg' };
    if (normalized === 'oz') return { value: round(value * OZ_TO_G), unit: 'g' };
    if (normalized === 'gal') return { value: round(value * GAL_TO_L), unit: 'L' };
  } else {
    if (normalized === 'kg') return { value: round(value / LB_TO_KG), unit: 'lb' };
    if (normalized === 'g') return { value: round(value / OZ_TO_G), unit: 'oz' };
    if (normalized === 'l') return { value: round(value / GAL_TO_L), unit: 'gal' };
  }

  return { value: round(value), unit };
}

export function formatAmountForDisplay(
  value: number | null,
  unit: string | null,
  preference: UnitsPreference
): string | null {
  if (value == null || !unit) return null;
  const converted = convertForDisplay(value, unit, preference);
  return `${converted.value} ${converted.unit}`;
}
