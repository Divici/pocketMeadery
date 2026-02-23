import { calculateABV } from './abv';

describe('calculateABV', () => {
  it('returns null when no gravities', () => {
    expect(calculateABV([])).toBeNull();
  });

  it('returns null when only one gravity', () => {
    expect(calculateABV([{ gravity: 1.080, occurredAt: 1000 }])).toBeNull();
  });

  it('computes ABV from earliest and latest gravity by occurredAt', () => {
    const gravities = [
      { gravity: 1.100, occurredAt: 2000 },
      { gravity: 1.050, occurredAt: 1000 },
      { gravity: 1.010, occurredAt: 3000 },
    ];
    // OG = 1.050 (earliest), FG = 1.010 (latest)
    // ABV ≈ (1.050 - 1.010) * 131.25 = 5.25
    const result = calculateABV(gravities);
    expect(result).toBeCloseTo(5.25, 2);
  });

  it('uses standard formula: (OG - FG) * 131.25', () => {
    const gravities = [
      { gravity: 1.080, occurredAt: 1000 },
      { gravity: 1.010, occurredAt: 2000 },
    ];
    // (1.080 - 1.010) * 131.25 = 9.1875
    expect(calculateABV(gravities)).toBeCloseTo(9.1875, 2);
  });

  it('ignores steps without gravity', () => {
    const gravities = [
      { gravity: 1.070, occurredAt: 1000 },
      { gravity: null, occurredAt: 1500 },
      { gravity: 1.015, occurredAt: 2000 },
    ];
    const result = calculateABV(
      gravities.filter((g) => g.gravity != null) as { gravity: number; occurredAt: number }[]
    );
    expect(result).toBeCloseTo((1.07 - 1.015) * 131.25, 2);
  });
});
