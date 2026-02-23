import { uuid } from '../../lib/uuid';
import type { DbAdapter } from '../DbAdapter';
import type {
  Ingredient,
  IngredientType,
  CreateIngredientInput,
} from '../types';

export async function createIngredient(
  db: DbAdapter,
  input: CreateIngredientInput
): Promise<Ingredient> {
  const id = uuid();
  const now = Date.now();

  await db.runAsync(
    `INSERT INTO ingredients (id, batch_id, name, amount_value, amount_unit, ingredient_type, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.batch_id,
    input.name,
    input.amount_value ?? null,
    input.amount_unit ?? null,
    input.ingredient_type ?? null,
    input.notes ?? null,
    now,
    now
  );

  const ing = await getIngredientById(db, id);
  if (!ing) throw new Error('Failed to create ingredient');
  return ing;
}

export async function getIngredientById(
  db: DbAdapter,
  id: string
): Promise<Ingredient | null> {
  return db.getFirstAsync<Ingredient>(
    'SELECT * FROM ingredients WHERE id = ?',
    id
  );
}

export async function listIngredientsByBatch(
  db: DbAdapter,
  batchId: string
): Promise<Ingredient[]> {
  return db.getAllAsync<Ingredient>(
    'SELECT * FROM ingredients WHERE batch_id = ?',
    batchId
  );
}

export type UpdateIngredientInput = Partial<
  Pick<
    Ingredient,
    | 'name'
    | 'amount_value'
    | 'amount_unit'
    | 'ingredient_type'
    | 'notes'
  >
>;

export async function updateIngredient(
  db: DbAdapter,
  id: string,
  input: UpdateIngredientInput
): Promise<Ingredient | null> {
  const updates: string[] = [];
  const values: unknown[] = [];

  if (input.name !== undefined) {
    updates.push('name = ?');
    values.push(input.name);
  }
  if (input.amount_value !== undefined) {
    updates.push('amount_value = ?');
    values.push(input.amount_value);
  }
  if (input.amount_unit !== undefined) {
    updates.push('amount_unit = ?');
    values.push(input.amount_unit);
  }
  if (input.ingredient_type !== undefined) {
    updates.push('ingredient_type = ?');
    values.push(input.ingredient_type);
  }
  if (input.notes !== undefined) {
    updates.push('notes = ?');
    values.push(input.notes);
  }

  if (updates.length === 0) return getIngredientById(db, id);

  updates.push('updated_at = ?');
  values.push(Date.now());
  values.push(id);

  await db.runAsync(
    `UPDATE ingredients SET ${updates.join(', ')} WHERE id = ?`,
    ...values
  );

  return getIngredientById(db, id);
}

export async function deleteIngredient(
  db: DbAdapter,
  id: string
): Promise<void> {
  await db.runAsync('DELETE FROM ingredients WHERE id = ?', id);
}
