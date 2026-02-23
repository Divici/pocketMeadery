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
