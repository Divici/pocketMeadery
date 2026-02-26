import type { Batch, BatchStatus } from '../db/types';

export const USE_MOCK_MEADS = true;
export const MOCK_MEAD_SEED_VERSION = 'v1';

const now = Date.now();
const day = 24 * 60 * 60 * 1000;
const hour = 60 * 60 * 1000;

type ReminderSeed = {
  id: string;
  batch_id: string;
  template_key: string;
  title: string;
  body: string | null;
  scheduled_for: number;
  created_at: number;
  updated_at: number;
};

type IngredientSeed = {
  id: string;
  batch_id: string;
  name: string;
  amount_value: number;
  amount_unit: string;
  ingredient_type: string;
  notes: string;
  created_at: number;
  updated_at: number;
};

type StepSeed = {
  id: string;
  batch_id: string;
  occurred_at: number;
  created_at: number;
  updated_at: number;
  title: string;
  notes: string;
  gravity: number | null;
};

function batch(
  id: string,
  name: string,
  status: BatchStatus,
  createdOffsetDays: number,
  volumeValue: number,
  volumeUnit: string,
  goalAbv: number,
  expected: number
): Batch {
  return {
    id,
    name,
    created_at: now - createdOffsetDays * day,
    updated_at: now - Math.max(1, createdOffsetDays - 4) * day,
    status,
    batch_volume_value: volumeValue,
    batch_volume_unit: volumeUnit,
    notes: `${name} demo batch with complete records for product walkthrough.`,
    goal_abv: goalAbv,
    expected_abv: expected,
    current_abv: expected,
  };
}

export const MOCK_MEAD_BATCHES: Batch[] = [
  batch('mock-batch-1', 'Wildflower Traditional', 'ACTIVE_PRIMARY', 46, 2.5, 'gal', 12.5, 11.8),
  batch('mock-batch-2', 'Blackberry Melomel', 'SECONDARY', 62, 3.0, 'gal', 13.0, 12.7),
  batch('mock-batch-3', 'Orange Blossom Semi-Sweet', 'ACTIVE_PRIMARY', 31, 10, 'L', 11.0, 10.9),
  batch('mock-batch-4', 'Cherry Cyser', 'AGING', 78, 2.0, 'gal', 14.0, 13.6),
  batch('mock-batch-5', 'Vanilla Oak Bochet', 'AGING', 94, 8.5, 'L', 15.0, 14.4),
  batch('mock-batch-6', 'Blueberry Session Mead', 'ACTIVE_PRIMARY', 26, 1.5, 'gal', 8.5, 8.1),
  batch('mock-batch-7', 'Spiced Winter Metheglin', 'SECONDARY', 53, 2.75, 'gal', 12.0, 11.4),
  batch('mock-batch-8', 'Raspberry Hydromel', 'ACTIVE_PRIMARY', 19, 9.0, 'L', 7.0, 6.7),
  batch('mock-batch-9', 'Buckwheat Sack Mead', 'BOTTLED', 120, 2.25, 'gal', 16.0, 15.2),
  batch('mock-batch-10', 'Maple Acerglyn', 'ARCHIVED', 180, 7.5, 'L', 13.5, 12.9),
];

export const MOCK_MEAD_REMINDERS: ReminderSeed[] = [
  {
    id: 'mock-reminder-1',
    batch_id: 'mock-batch-1',
    template_key: 'DEGAS_IN_HOURS',
    title: 'Degas',
    body: 'Batch: Wildflower Traditional',
    scheduled_for: now + 6 * hour,
    created_at: now - 1 * day,
    updated_at: now - 1 * day,
  },
  {
    id: 'mock-reminder-2',
    batch_id: 'mock-batch-2',
    template_key: 'RACK_IN_DAYS',
    title: 'Rack to secondary',
    body: 'Batch: Blackberry Melomel',
    scheduled_for: now + 2 * day,
    created_at: now - 2 * day,
    updated_at: now - 2 * day,
  },
  {
    id: 'mock-reminder-3',
    batch_id: 'mock-batch-3',
    template_key: 'NUTRIENT_IN_HOURS',
    title: 'Add nutrient',
    body: 'Batch: Orange Blossom Semi-Sweet',
    scheduled_for: now + 18 * hour,
    created_at: now - 1 * day,
    updated_at: now - 1 * day,
  },
  {
    id: 'mock-reminder-4',
    batch_id: 'mock-batch-4',
    template_key: 'STABILIZE_IN_DAYS',
    title: 'Stabilize',
    body: 'Batch: Cherry Cyser',
    scheduled_for: now + 4 * day,
    created_at: now - 3 * day,
    updated_at: now - 3 * day,
  },
  {
    id: 'mock-reminder-5',
    batch_id: 'mock-batch-5',
    template_key: 'BOTTLE_IN_DAYS',
    title: 'Bottle',
    body: 'Batch: Vanilla Oak Bochet',
    scheduled_for: now + 9 * day,
    created_at: now - 2 * day,
    updated_at: now - 2 * day,
  },
  {
    id: 'mock-reminder-6',
    batch_id: 'mock-batch-6',
    template_key: 'OTHER',
    title: 'Taste check',
    body: 'Batch: Blueberry Session Mead',
    scheduled_for: now + 1 * day,
    created_at: now - 1 * day,
    updated_at: now - 1 * day,
  },
  {
    id: 'mock-reminder-7',
    batch_id: 'mock-batch-7',
    template_key: 'DEGAS_IN_HOURS',
    title: 'Degas',
    body: 'Batch: Spiced Winter Metheglin',
    scheduled_for: now + 10 * hour,
    created_at: now - 1 * day,
    updated_at: now - 1 * day,
  },
  {
    id: 'mock-reminder-8',
    batch_id: 'mock-batch-8',
    template_key: 'RACK_IN_DAYS',
    title: 'Rack to secondary',
    body: 'Batch: Raspberry Hydromel',
    scheduled_for: now + 3 * day,
    created_at: now - 1 * day,
    updated_at: now - 1 * day,
  },
  {
    id: 'mock-reminder-9',
    batch_id: 'mock-batch-1',
    template_key: 'NUTRIENT_IN_HOURS',
    title: 'Add nutrient',
    body: 'Batch: Wildflower Traditional',
    scheduled_for: now + 22 * hour,
    created_at: now - 1 * day,
    updated_at: now - 1 * day,
  },
  {
    id: 'mock-reminder-10',
    batch_id: 'mock-batch-3',
    template_key: 'OTHER',
    title: 'Check airlock',
    body: 'Batch: Orange Blossom Semi-Sweet',
    scheduled_for: now + 2 * day,
    created_at: now - 1 * day,
    updated_at: now - 1 * day,
  },
];

export const MOCK_MEAD_INGREDIENTS: IngredientSeed[] = MOCK_MEAD_BATCHES.flatMap((b, idx) => {
  const t = b.created_at;
  return [
    {
      id: `mock-ing-${idx + 1}-1`,
      batch_id: b.id,
      name: 'Wildflower Honey',
      amount_value: 9 + (idx % 4),
      amount_unit: 'lb',
      ingredient_type: 'HONEY',
      notes: `Primary honey charge for ${b.name}.`,
      created_at: t + 60_000,
      updated_at: t + 60_000,
    },
    {
      id: `mock-ing-${idx + 1}-2`,
      batch_id: b.id,
      name: 'Lalvin 71B',
      amount_value: 5,
      amount_unit: 'g',
      ingredient_type: 'YEAST',
      notes: `Yeast pitch for ${b.name}.`,
      created_at: t + 120_000,
      updated_at: t + 120_000,
    },
    {
      id: `mock-ing-${idx + 1}-3`,
      batch_id: b.id,
      name: 'Fermaid O',
      amount_value: 6 + (idx % 3),
      amount_unit: 'g',
      ingredient_type: 'NUTRIENT',
      notes: `Nutrient plan for ${b.name}.`,
      created_at: t + 180_000,
      updated_at: t + 180_000,
    },
    {
      id: `mock-ing-${idx + 1}-4`,
      batch_id: b.id,
      name: idx % 2 === 0 ? 'French Oak Cubes' : 'Blackberries',
      amount_value: idx % 2 === 0 ? 1.2 : 2.5,
      amount_unit: idx % 2 === 0 ? 'oz' : 'lb',
      ingredient_type: idx % 2 === 0 ? 'ADDITION' : 'FRUIT',
      notes: `Style addition for ${b.name}.`,
      created_at: t + 240_000,
      updated_at: t + 240_000,
    },
  ];
});

export const MOCK_MEAD_STEPS: StepSeed[] = MOCK_MEAD_BATCHES.flatMap((b, idx) => {
  const t = b.created_at;
  const og = Number((1.08 + (idx % 5) * 0.004).toFixed(3));
  const mid = Number((og - 0.026).toFixed(3));
  const fg = Number((og - 0.058).toFixed(3));
  return [
    {
      id: `mock-step-${idx + 1}-1`,
      batch_id: b.id,
      occurred_at: t + 1 * day,
      created_at: t + 1 * day,
      updated_at: t + 1 * day,
      title: 'Pitch Yeast',
      notes: `Yeast pitched for ${b.name}.`,
      gravity: og,
    },
    {
      id: `mock-step-${idx + 1}-2`,
      batch_id: b.id,
      occurred_at: t + 3 * day,
      created_at: t + 3 * day,
      updated_at: t + 3 * day,
      title: 'Nutrient Addition',
      notes: `Staggered nutrient addition completed for ${b.name}.`,
      gravity: null,
    },
    {
      id: `mock-step-${idx + 1}-3`,
      batch_id: b.id,
      occurred_at: t + 7 * day,
      created_at: t + 7 * day,
      updated_at: t + 7 * day,
      title: 'Gravity Check',
      notes: `Mid fermentation gravity check for ${b.name}.`,
      gravity: mid,
    },
    {
      id: `mock-step-${idx + 1}-4`,
      batch_id: b.id,
      occurred_at: t + 14 * day,
      created_at: t + 14 * day,
      updated_at: t + 14 * day,
      title: 'Rack to Secondary',
      notes: `Transferred ${b.name} to secondary vessel.`,
      gravity: fg,
    },
    {
      id: `mock-step-${idx + 1}-5`,
      batch_id: b.id,
      occurred_at: t + 21 * day,
      created_at: t + 21 * day,
      updated_at: t + 21 * day,
      title: 'Tasting Note',
      notes: `Balanced profile developing for ${b.name}.`,
      gravity: null,
    },
  ];
});
