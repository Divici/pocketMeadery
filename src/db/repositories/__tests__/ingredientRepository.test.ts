import Database from 'better-sqlite3';
import { MIGRATIONS } from '../../migrations';
import { createBatch } from '../batchRepository';
import { createTestDbAdapter } from '../../testDbAdapter';
import {
  createIngredient,
  getIngredientById,
  listIngredientsByBatch,
  updateIngredient,
  deleteIngredient,
} from '../ingredientRepository';

describe('ingredientRepository', () => {
  let sqlite: Database.Database;
  let db: ReturnType<typeof createTestDbAdapter>;
  let batchId: string;

  beforeEach(async () => {
    sqlite = new Database(':memory:');
    sqlite.exec(MIGRATIONS[0]);
    sqlite.exec('PRAGMA user_version = 1');
    db = createTestDbAdapter(sqlite);
    const batch = await createBatch(db, { name: 'Test Batch' });
    batchId = batch.id;
  });

  afterEach(() => {
    sqlite.close();
  });

  describe('createIngredient', () => {
    it('creates ingredient with required fields', async () => {
      const ing = await createIngredient(db, {
        batch_id: batchId,
        name: 'Wildflower Honey',
      });
      expect(ing.id).toBeDefined();
      expect(ing.name).toBe('Wildflower Honey');
      expect(ing.batch_id).toBe(batchId);
      expect(ing.amount_value).toBeNull();
      expect(ing.ingredient_type).toBeNull();
    });

    it('creates ingredient with optional fields', async () => {
      const ing = await createIngredient(db, {
        batch_id: batchId,
        name: 'Honey',
        amount_value: 3,
        amount_unit: 'lb',
        ingredient_type: 'HONEY',
        notes: 'Local',
      });
      expect(ing.amount_value).toBe(3);
      expect(ing.amount_unit).toBe('lb');
      expect(ing.ingredient_type).toBe('HONEY');
      expect(ing.notes).toBe('Local');
    });
  });

  describe('listIngredientsByBatch', () => {
    it('returns ingredients for batch', async () => {
      await createIngredient(db, { batch_id: batchId, name: 'A' });
      await createIngredient(db, { batch_id: batchId, name: 'B' });
      const list = await listIngredientsByBatch(db, batchId);
      expect(list).toHaveLength(2);
      expect(list.map((i) => i.name).sort()).toEqual(['A', 'B']);
    });

    it('returns empty for batch with no ingredients', async () => {
      const list = await listIngredientsByBatch(db, batchId);
      expect(list).toHaveLength(0);
    });
  });

  describe('getIngredientById', () => {
    it('returns ingredient when found', async () => {
      const created = await createIngredient(db, {
        batch_id: batchId,
        name: 'Found',
      });
      const found = await getIngredientById(db, created.id);
      expect(found?.name).toBe('Found');
    });

    it('returns null when not found', async () => {
      const found = await getIngredientById(db, 'nonexistent');
      expect(found).toBeNull();
    });
  });

  describe('updateIngredient', () => {
    it('updates ingredient fields', async () => {
      const ing = await createIngredient(db, {
        batch_id: batchId,
        name: 'Original',
      });
      const updated = await updateIngredient(db, ing.id, {
        name: 'Updated',
        amount_value: 5,
      });
      expect(updated?.name).toBe('Updated');
      expect(updated?.amount_value).toBe(5);
    });
  });

  describe('deleteIngredient', () => {
    it('removes ingredient', async () => {
      const ing = await createIngredient(db, {
        batch_id: batchId,
        name: 'ToDelete',
      });
      await deleteIngredient(db, ing.id);
      const found = await getIngredientById(db, ing.id);
      expect(found).toBeNull();
    });
  });
});
