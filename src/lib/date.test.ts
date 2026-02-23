import { formatDateMMDDYYYY, parseDateMMDDYYYY } from './date';

describe('date utilities', () => {
  it('formats unix ms as MM/DD/YYYY', () => {
    const value = new Date(2026, 1, 23).getTime();
    expect(formatDateMMDDYYYY(value)).toBe('02/23/2026');
  });

  it('parses MM/DD/YYYY into unix ms', () => {
    const parsed = parseDateMMDDYYYY('02/23/2026');
    expect(parsed).not.toBeNull();
    expect(formatDateMMDDYYYY(parsed!)).toBe('02/23/2026');
  });

  it('returns null for invalid format', () => {
    expect(parseDateMMDDYYYY('2026-02-23')).toBeNull();
  });
});
