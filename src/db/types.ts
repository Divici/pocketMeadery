export type BatchStatus =
  | 'ACTIVE_PRIMARY'
  | 'SECONDARY'
  | 'AGING'
  | 'BOTTLED'
  | 'ARCHIVED';

export type Batch = {
  id: string;
  name: string;
  created_at: number;
  updated_at: number;
  status: BatchStatus;
  batch_volume_value: number | null;
  batch_volume_unit: string | null;
  notes: string | null;
  goal_abv: number | null;
  expected_abv: number | null;
  current_abv: number | null;
};

export type CreateBatchInput = {
  name: string;
  status?: BatchStatus;
  batch_volume_value?: number;
  batch_volume_unit?: string;
  notes?: string;
  goal_abv?: number;
};

export type IngredientType =
  | 'HONEY'
  | 'YEAST'
  | 'NUTRIENT'
  | 'FRUIT'
  | 'ADDITION'
  | 'OTHER';

export type Ingredient = {
  id: string;
  batch_id: string;
  name: string;
  amount_value: number | null;
  amount_unit: string | null;
  ingredient_type: IngredientType | null;
  notes: string | null;
  created_at: number;
  updated_at: number;
};

export type CreateIngredientInput = {
  batch_id: string;
  name: string;
  amount_value?: number;
  amount_unit?: string;
  ingredient_type?: IngredientType;
  notes?: string;
};

export type Step = {
  id: string;
  batch_id: string;
  occurred_at: number;
  created_at: number;
  updated_at: number;
  title: string | null;
  notes: string;
  gravity: number | null;
  temperature_value: number | null;
  temperature_unit: string | null;
  is_deleted: number;
};

export type CreateStepInput = {
  batch_id: string;
  occurred_at: number;
  title?: string;
  notes: string;
  gravity?: number;
};

export type StepEditHistory = {
  step_id: string;
  previous_notes: string;
  previous_gravity: number | null;
  previous_title: string | null;
  previous_occurred_at: number;
  saved_at: number;
};

export type Reminder = {
  id: string;
  batch_id: string;
  template_key: string;
  title: string;
  body: string | null;
  scheduled_for: number;
  notification_id: string | null;
  created_at: number;
  updated_at: number;
  is_completed: number;
  completed_at: number | null;
};

export type CreateReminderInput = {
  batch_id: string;
  template_key: string;
  title: string;
  body?: string;
  scheduled_for: number;
  notification_id?: string | null;
};
