/*
=============================
types
--> Kontrak tipe data fitur untuk mencegah bentuk data yang tidak sesuai.
=============================
*/

export interface Ingredient {
  name: string;
  unit: 'g' | 'ml' | 'butir';
  category: string;
  price: [number, number];
  icon: string;
  allergens?: string[];
  animal?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  slot: number;
  image: string;
  time: number;
  items: Record<string, number>;
  nutrition: [number, number, number, number, number];
  steps: string[];
}

export interface Preferences {
  liked: string[];
  avoided: string[];
  allergies: string[];
  diet: string;
}

export interface PlanForm {
  mode: string;
  people: number;
  days: number;
  start: string;
  budget: number;
}

export interface Plan extends PlanForm {
  menu: string[][];
  prefs: Preferences;
  alternative?: boolean;
}

export type Stock = Record<string, number>;
export type ShoppingChecks = Record<string, boolean>;

export interface CostLine {
  id: string;
  need: number;
  used: number;
  buy: number;
  min: number;
  max: number;
}

export interface MealCost {
  d: number;
  s: number;
  id: string;
  lines: CostLine[];
  min: number;
  max: number;
}

export interface Calculation {
  lines: CostLine[];
  meals: MealCost[];
  min: number;
  max: number;
  savedMin: number;
  savedMax: number;
}

export type GenerationResult =
  | { error: 'restrictions'; plan?: never; cheapest?: never; feasible?: never }
  | { error?: never; plan: Plan; cheapest: Plan; feasible: boolean };

export interface GenerationInput {
  form: PlanForm;
  stock: Stock;
  prefs: Preferences;
}
