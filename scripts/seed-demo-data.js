/* eslint-disable no-console */
const path = require('path');
const Database = require('better-sqlite3');
const { randomUUID } = require('crypto');

function parseArgs() {
  const args = process.argv.slice(2);
  const dbIndex = args.indexOf('--db');
  if (dbIndex === -1 || !args[dbIndex + 1]) {
    throw new Error(
      'Missing required --db argument. Example: npm run seed:demo -- --db "C:\\path\\to\\pocketmeadery.db"'
    );
  }
  return {
    dbPath: path.resolve(args[dbIndex + 1]),
  };
}

function createRng(seed = 42) {
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function rangeInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function titleCaseStatus(status) {
  if (status === 'ACTIVE_PRIMARY') return 'Active';
  return status
    .toLowerCase()
    .split('_')
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join(' ');
}

function buildBatchName(profile, stage, index) {
  return `${profile} ${stage} #${String(index + 1).padStart(2, '0')}`;
}

function run() {
  const { dbPath } = parseArgs();
  const rng = createRng(20260223);
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');

  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type='table'")
    .all()
    .map((r) => r.name);
  const required = ['batches', 'ingredients', 'steps', 'reminders'];
  const missing = required.filter((t) => !tables.includes(t));
  if (missing.length > 0) {
    throw new Error(
      `Database is missing required tables: ${missing.join(', ')}. Run app migrations first.`
    );
  }

  const insertBatch = db.prepare(`
    INSERT INTO batches (
      id, name, created_at, updated_at, status, batch_volume_value, batch_volume_unit,
      notes, goal_abv, expected_abv, current_abv
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertIngredient = db.prepare(`
    INSERT INTO ingredients (
      id, batch_id, name, amount_value, amount_unit, ingredient_type, notes, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertStep = db.prepare(`
    INSERT INTO steps (
      id, batch_id, occurred_at, created_at, updated_at, title, notes, gravity,
      temperature_value, temperature_unit, is_deleted
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);
  const insertReminder = db.prepare(`
    INSERT INTO reminders (
      id, batch_id, template_key, title, body, scheduled_for, notification_id,
      created_at, updated_at, is_completed, completed_at
    ) VALUES (?, ?, ?, ?, ?, ?, NULL, ?, ?, 0, NULL)
  `);

  const batchProfiles = [
    'Wildflower',
    'Orange Blossom',
    'Buckwheat',
    'Blackberry',
    'Cyser',
    'Bochet',
    'Sack Mead',
    'Hydromel',
    'Cherry',
    'Blueberry',
    'Vanilla Oak',
    'Spiced Winter',
  ];

  const ingredientTemplates = {
    base: [
      ['Wildflower Honey', 'HONEY', 'lb'],
      ['Go-Ferm', 'NUTRIENT', 'g'],
      ['Fermaid O', 'NUTRIENT', 'g'],
      ['Lalvin 71B', 'YEAST', 'g'],
    ],
    fruit: [
      ['Blackberries', 'FRUIT', 'lb'],
      ['Blueberries', 'FRUIT', 'lb'],
      ['Cherries', 'FRUIT', 'lb'],
      ['Apple Juice', 'ADDITION', 'gal'],
    ],
    spice: [
      ['French Oak Cubes', 'ADDITION', 'oz'],
      ['Vanilla Bean', 'ADDITION', 'oz'],
      ['Cinnamon Stick', 'ADDITION', 'oz'],
      ['Clove', 'ADDITION', 'g'],
    ],
  };

  const stepTitles = [
    'Pitch Yeast',
    'Nutrient Addition',
    'Degas',
    'Gravity Check',
    'Rack to Secondary',
    'Stabilize',
    'Fine and Clarify',
    'Bottle',
  ];

  const reminderTemplates = [
    ['RACK_IN_DAYS', 'Rack to secondary'],
    ['NUTRIENT_IN_HOURS', 'Add nutrient'],
    ['DEGAS_IN_HOURS', 'Degas'],
    ['STABILIZE_IN_DAYS', 'Stabilize'],
    ['BOTTLE_IN_DAYS', 'Bottle'],
  ];

  const statuses = [
    ...Array(14).fill('ACTIVE_PRIMARY'),
    ...Array(8).fill('SECONDARY'),
    ...Array(8).fill('AGING'),
    ...Array(6).fill('BOTTLED'),
    ...Array(4).fill('ARCHIVED'),
  ];

  const now = Date.now();
  let remindersCreated = 0;
  let stepsCreated = 0;
  let ingredientsCreated = 0;

  const tx = db.transaction(() => {
    statuses.forEach((status, i) => {
      const batchId = randomUUID();
      const profile = pick(rng, batchProfiles);
      const batchName = buildBatchName(profile, titleCaseStatus(status), i);
      const createdAt = now - rangeInt(rng, 12, 240) * 24 * 60 * 60 * 1000;
      const updatedAt = createdAt + rangeInt(rng, 1, 10) * 24 * 60 * 60 * 1000;
      const volumeUnit = rng() > 0.5 ? 'gal' : 'L';
      const volumeValue =
        volumeUnit === 'gal'
          ? Number((rng() * 4 + 1).toFixed(1))
          : Number((rng() * 16 + 4).toFixed(1));
      const goalAbv = Number((rng() * 8 + 8).toFixed(1));

      const og = Number((1.07 + rng() * 0.06).toFixed(3));
      const fg = Number((1.0 + rng() * 0.03).toFixed(3));
      const expected = Number(Math.max(0, (og - fg) * 131.25).toFixed(1));

      insertBatch.run(
        batchId,
        batchName,
        createdAt,
        updatedAt,
        status,
        volumeValue,
        volumeUnit,
        `${profile} profile with clean fermentation notes and tracked milestones.`,
        goalAbv,
        expected,
        expected
      );

      const baseIngredients = ingredientTemplates.base.slice(0, 3 + rangeInt(rng, 0, 1));
      const maybeFruit = rng() > 0.4 ? [pick(rng, ingredientTemplates.fruit)] : [];
      const maybeSpice = rng() > 0.5 ? [pick(rng, ingredientTemplates.spice)] : [];
      const chosenIngredients = [...baseIngredients, ...maybeFruit, ...maybeSpice];
      chosenIngredients.forEach((ing, idx) => {
        const [name, type, unit] = ing;
        const amount =
          unit === 'lb'
            ? Number((rng() * 6 + 0.5).toFixed(2))
            : unit === 'gal'
              ? Number((rng() * 1 + 0.25).toFixed(2))
              : Number((rng() * 15 + 0.5).toFixed(2));
        const ts = createdAt + (idx + 1) * 60 * 1000;
        insertIngredient.run(
          randomUUID(),
          batchId,
          name,
          amount,
          unit,
          type,
          `Demo ingredient entry for ${batchName}.`,
          ts,
          ts
        );
        ingredientsCreated += 1;
      });

      const stepCount = rangeInt(rng, 4, 8);
      for (let s = 0; s < stepCount; s++) {
        const occurredAt = createdAt + (s + 1) * rangeInt(rng, 2, 9) * 24 * 60 * 60 * 1000;
        let gravity = null;
        if (s === 0) gravity = og;
        else if (s === stepCount - 1) gravity = fg;
        else if (rng() > 0.5) {
          const drift = og - ((og - fg) * (s / (stepCount - 1)));
          gravity = Number((drift + (rng() - 0.5) * 0.006).toFixed(3));
        }
        const title = pick(rng, stepTitles);
        insertStep.run(
          randomUUID(),
          batchId,
          occurredAt,
          occurredAt,
          occurredAt,
          title,
          `${title} completed for ${batchName}.`,
          gravity,
          null,
          null
        );
        stepsCreated += 1;
      }

      if (remindersCreated < 10 && ['ACTIVE_PRIMARY', 'SECONDARY', 'AGING'].includes(status)) {
        const remindersForBatch = remindersCreated < 8 && rng() > 0.7 ? 2 : 1;
        for (let r = 0; r < remindersForBatch && remindersCreated < 10; r++) {
          const [templateKey, title] = pick(rng, reminderTemplates);
          const isHourReminder = templateKey.includes('HOURS');
          const scheduledFor = isHourReminder
            ? now + rangeInt(rng, 4, 72) * 60 * 60 * 1000
            : now + rangeInt(rng, 2, 18) * 24 * 60 * 60 * 1000;
          insertReminder.run(
            randomUUID(),
            batchId,
            templateKey,
            title,
            `Batch: ${batchName}`,
            scheduledFor,
            now,
            now
          );
          remindersCreated += 1;
        }
      }
    });
  });

  tx();
  db.close();

  console.log('Demo seed complete.');
  console.log(`Batches added: 40`);
  console.log(`Ingredients added: ${ingredientsCreated}`);
  console.log(`Steps added: ${stepsCreated}`);
  console.log(`Reminders added: ${remindersCreated}`);
  console.log(`Database: ${dbPath}`);
}

try {
  run();
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
