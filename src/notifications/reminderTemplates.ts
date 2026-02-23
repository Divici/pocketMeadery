export const REMINDER_TEMPLATES = {
  RACK_IN_DAYS: {
    key: 'RACK_IN_DAYS',
    label: 'Rack in X days',
    defaultTitle: 'Rack to secondary',
    unit: 'days' as const,
  },
  NUTRIENT_IN_HOURS: {
    key: 'NUTRIENT_IN_HOURS',
    label: 'Nutrient addition in X hours',
    defaultTitle: 'Add nutrient',
    unit: 'hours' as const,
  },
  DEGAS_IN_HOURS: {
    key: 'DEGAS_IN_HOURS',
    label: 'Degas in X hours',
    defaultTitle: 'Degas',
    unit: 'hours' as const,
  },
  STABILIZE_IN_DAYS: {
    key: 'STABILIZE_IN_DAYS',
    label: 'Stabilize in X days',
    defaultTitle: 'Stabilize',
    unit: 'days' as const,
  },
  BOTTLE_IN_DAYS: {
    key: 'BOTTLE_IN_DAYS',
    label: 'Bottle in X days',
    defaultTitle: 'Bottle',
    unit: 'days' as const,
  },
} as const;

export type ReminderTemplateKey = keyof typeof REMINDER_TEMPLATES;

export function getTemplate(key: ReminderTemplateKey) {
  return REMINDER_TEMPLATES[key];
}

export function getScheduledForFromRelative(
  templateKey: ReminderTemplateKey,
  value: number
): number {
  const template = REMINDER_TEMPLATES[templateKey];
  const now = Date.now();
  if (template.unit === 'hours') {
    return now + value * 60 * 60 * 1000;
  }
  return now + value * 24 * 60 * 60 * 1000;
}
