import { convertForDisplay, formatAmountForDisplay } from './units';

describe('units conversion', () => {
  it('converts lb to kg for metric', () => {
    const result = convertForDisplay(2, 'lb', 'metric');
    expect(result.unit).toBe('kg');
    expect(result.value).toBeCloseTo(0.91, 2);
  });

  it('converts gal to L for metric', () => {
    const result = convertForDisplay(1, 'gal', 'metric');
    expect(result.unit).toBe('L');
    expect(result.value).toBeCloseTo(3.79, 2);
  });

  it('converts kg to lb for US', () => {
    const result = convertForDisplay(1, 'kg', 'US');
    expect(result.unit).toBe('lb');
    expect(result.value).toBeCloseTo(2.2, 1);
  });

  it('returns unrecognized units as-is', () => {
    const result = convertForDisplay(5, 'ml', 'US');
    expect(result.unit).toBe('ml');
    expect(result.value).toBe(5);
  });

  it('formats display string', () => {
    const result = formatAmountForDisplay(2, 'lb', 'metric');
    expect(result).toBe('0.91 kg');
  });
});
