import {
  REMINDER_TEMPLATES,
  getTemplate,
  getScheduledForFromRelative,
} from '../reminderTemplates';

describe('reminderTemplates', () => {
  it('has all preset templates', () => {
    expect(REMINDER_TEMPLATES.RACK_IN_DAYS).toBeDefined();
    expect(REMINDER_TEMPLATES.NUTRIENT_IN_HOURS).toBeDefined();
    expect(REMINDER_TEMPLATES.DEGAS_IN_HOURS).toBeDefined();
    expect(REMINDER_TEMPLATES.STABILIZE_IN_DAYS).toBeDefined();
    expect(REMINDER_TEMPLATES.BOTTLE_IN_DAYS).toBeDefined();
  });

  it('getTemplate returns template by key', () => {
    const t = getTemplate('RACK_IN_DAYS');
    expect(t.label).toBe('Rack in X days');
    expect(t.unit).toBe('days');
  });

  it('getScheduledForFromRelative computes hours correctly', () => {
    const base = Date.now();
    const result = getScheduledForFromRelative('NUTRIENT_IN_HOURS', 2);
    expect(result).toBeGreaterThanOrEqual(base + 2 * 60 * 60 * 1000 - 1000);
    expect(result).toBeLessThanOrEqual(base + 2 * 60 * 60 * 1000 + 1000);
  });

  it('getScheduledForFromRelative computes days correctly', () => {
    const base = Date.now();
    const result = getScheduledForFromRelative('RACK_IN_DAYS', 7);
    expect(result).toBeGreaterThanOrEqual(base + 7 * 24 * 60 * 60 * 1000 - 1000);
    expect(result).toBeLessThanOrEqual(base + 7 * 24 * 60 * 60 * 1000 + 1000);
  });
});
