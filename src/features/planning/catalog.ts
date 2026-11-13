/*
=============================
catalog
--> Menerima katalog bahan dan resep tervalidasi dari API database.
=============================
*/

import type { Catalog, Ingredient, PlanForm, Preferences, Recipe, Stock } from './types';
import { isRecord } from '@/shared/typeguards';

export let ingredients: Record<string, Ingredient> = {};
export let recipes: Recipe[] = [];
export const slots = ['Sarapan', 'Makan Siang', 'Makan Malam'];

export function installCatalog(catalog: Catalog) {
  ingredients = catalog.ingredients;
  recipes = catalog.recipes;
}

export function getCatalog(): Catalog {
  return { ingredients, recipes, slots };
}


export function isCatalog(value: unknown): value is Catalog {
  if (!isRecord(value) || !isRecord(value.ingredients) || !Array.isArray(value.recipes)) return false;
  const entries = Object.entries(value.ingredients);
  if (!entries.length || !Array.isArray(value.slots) || value.slots.length !== 3) return false;
  const ids = new Set(entries.map(([id]) => id));
  const nutritionFields = ['energy', 'protein', 'carbohydrate', 'fat', 'fiber'];
  const validIngredients = entries.every(([id, ingredient]) => {
    if (
      !id ||
      !isRecord(ingredient) ||
      typeof ingredient.name !== 'string' ||
      !['g', 'ml', 'butir'].includes(String(ingredient.unit)) ||
      typeof ingredient.category !== 'string' ||
      typeof ingredient.icon !== 'string' ||
      !Array.isArray(ingredient.price) ||
      ingredient.price.length !== 2 ||
      !ingredient.price.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0) ||
      ingredient.price[0] > ingredient.price[1] ||
      !Array.isArray(ingredient.allergens) ||
      !ingredient.allergens.every((allergen) => typeof allergen === 'string') ||
      typeof ingredient.animal !== 'boolean' ||
      !isRecord(ingredient.nutrition) ||
      !nutritionFields.every(
        (field) =>
          typeof ingredient.nutrition[field] === 'number' &&
          Number.isFinite(ingredient.nutrition[field]) &&
          ingredient.nutrition[field] >= 0,
      ) ||
      !isRecord(ingredient.priceSource) ||
      !isRecord(ingredient.nutritionSource)
    )
      return false;
    return (
      typeof ingredient.priceSource.source === 'string' &&
      typeof ingredient.priceSource.sourceUrl === 'string' &&
      typeof ingredient.priceSource.region === 'string' &&
      typeof ingredient.priceSource.referenceQuantity === 'number' &&
      Number.isFinite(ingredient.priceSource.referenceQuantity) &&
      ingredient.priceSource.referenceQuantity > 0 &&
      typeof ingredient.priceSource.referenceUnit === 'string' &&
      typeof ingredient.priceSource.observedFrom === 'string' &&
      typeof ingredient.priceSource.observedTo === 'string' &&
      typeof ingredient.priceSource.updatedAt === 'string' &&
      typeof ingredient.nutritionSource.source === 'string' &&
      typeof ingredient.nutritionSource.sourceUrl === 'string' &&
      typeof ingredient.nutritionSource.sourceRecord === 'string' &&
      typeof ingredient.nutritionSource.servingSize === 'number' &&
      Number.isFinite(ingredient.nutritionSource.servingSize) &&
      ingredient.nutritionSource.servingSize > 0 &&
      typeof ingredient.nutritionSource.servingUnit === 'string' &&
      typeof ingredient.nutritionSource.ediblePortionPercent === 'number' &&
      Number.isFinite(ingredient.nutritionSource.ediblePortionPercent) &&
      ingredient.nutritionSource.ediblePortionPercent >= 0 &&
      ingredient.nutritionSource.ediblePortionPercent <= 100
    );
  });
  const recipeIds = new Set<string>();
  const validRecipes = value.recipes.every((recipe) => {
    if (
      !isRecord(recipe) ||
      typeof recipe.id !== 'string' ||
      !recipe.id ||
      recipeIds.has(recipe.id) ||
      typeof recipe.name !== 'string' ||
      typeof recipe.slot !== 'number' ||
      !Number.isInteger(recipe.slot) ||
      recipe.slot < 0 ||
      recipe.slot > 2 ||
      typeof recipe.image !== 'string' ||
      typeof recipe.time !== 'number' ||
      !Number.isFinite(recipe.time) ||
      recipe.time < 0 ||
      (recipe.servings !== undefined &&
        (typeof recipe.servings !== 'number' || !Number.isInteger(recipe.servings) || recipe.servings < 1)) ||
      !isRecord(recipe.items) ||
      !Array.isArray(recipe.nutrition) ||
      recipe.nutrition.length !== 5 ||
      !recipe.nutrition.every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0) ||
      !Array.isArray(recipe.steps) ||
      !recipe.steps.length ||
      !recipe.steps.every((step) => typeof step === 'string')
    )
      return false;
    recipeIds.add(recipe.id);
    return Object.entries(recipe.items).every(
      ([id, quantity]) =>
        ids.has(id) && typeof quantity === 'number' && Number.isFinite(quantity) && quantity > 0,
    );
  });
  return (
    validIngredients &&
    validRecipes &&
    value.slots.every((slot) => typeof slot === 'string') &&
    [0, 1, 2].every((slot) => value.recipes.some((recipe) => isRecord(recipe) && recipe.slot === slot))
  );
}

export const defaultPrefs: Preferences = {
  liked: [],
  avoided: [],
  allergies: [],
  diet: 'Bebas',
};

export const defaultForm: PlanForm = {
  mode: 'Keluarga',
  people: 2,
  days: 3,
  start: '2026-10-12',
  budget: 150000,
};

export const demoStock: Stock = {
  beras: 1000,
  telur: 4,
  wortel: 300,
};
