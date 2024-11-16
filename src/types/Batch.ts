export type Batch = {
    id: string;
    name: string;
    startDate: string;
    abvGoal: number; // Target ABV
    targetStartingGravity: number; // Calculated from ABV Goal
    startingGravity: number; // Actual starting gravity entered by the user
    currentGravity: number; // Current gravity updated by the user
    finalGravity?: number; // Final gravity entered after fermentation
    currentABV: number; // Dynamically calculated
    ingredients: Ingredient[];
    steps: Step[];
    notes: string;
};
  
export type Ingredient = {
    name: string;
    quantity: string;
};
  
export type Step = {
    date: string;
    description: string;
};
  