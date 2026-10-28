/*
=============================
calculations
--> Pengecualian resep, alokasi stok, dan perhitungan biaya yang konsisten.
=============================
*/

import { ingredients, recipes } from './catalog';
import type { Calculation, CostLine, MealCost, Plan, Preferences, Recipe, Stock } from './types';

export function getRecipe(id: string): Recipe {
  const recipe = recipes.find((r) => r.id === id);
  if (!recipe) throw new Error('Resep tidak ditemukan: ' + id);
  return recipe;
}

export function allowed(recipe: Recipe, prefs: Preferences) {
  return Object.keys(recipe.items).every((id) => {
    const isAvoided = prefs.avoided.includes(id);
    const hasAllergen = (ingredients[id].allergens || []).some((a) => prefs.allergies.includes(a));
    const violatesVegetarian = prefs.diet === 'Vegetarian' && ingredients[id].animal;
    const violatesVegan = prefs.diet === 'Vegan' && (ingredients[id].animal || id === 'telur');

    return !isAvoided && !hasAllergen && !violatesVegetarian && !violatesVegan;
  });
}

export function calculate(plan: Plan, stock: Stock = {}): Calculation {
  const available = { ...stock };
  const totals: Record<string, CostLine> = {};
  const meals: MealCost[] = [];

  plan.menu.forEach((day, d) => {
    day.forEach((id, s) => {
      const r = getRecipe(id);
      const lines = Object.entries(r.items).map(([key, q]) => {
        const need = q * plan.people;
        const used = Math.min(need, available[key] || 0);
        const buy = need - used;

        available[key] = Math.max(0, (available[key] || 0) - used);

        const [lo, hi] = ingredients[key].price;
        const prev = totals[key]?.buy || 0;
        const line = {
          id: key,
          need,
          used,
          buy,
          min: Math.round((prev + buy) * lo) - Math.round(prev * lo),
          max: Math.round((prev + buy) * hi) - Math.round(prev * hi),
        };

        const t = totals[key] || {
          id: key,
          need: 0,
          used: 0,
          buy: 0,
          min: 0,
          max: 0,
        };

        for (const k of ['need', 'used', 'buy', 'min', 'max'] as const) {
          t[k] += line[k];
        }
        totals[key] = t;

        return line;
      });

      meals.push({
        d,
        s,
        id,
        lines,
        min: lines.reduce((n, l) => n + l.min, 0),
        max: lines.reduce((n, l) => n + l.max, 0),
      });
    });
  });

  const lines = Object.values(totals);
  const min = lines.reduce((n, l) => n + l.min, 0);
  const max = lines.reduce((n, l) => n + l.max, 0);
  const savedMin = lines.reduce((n, l) => n + l.need * ingredients[l.id].price[0] - l.min, 0);
  const savedMax = lines.reduce((n, l) => n + l.need * ingredients[l.id].price[1] - l.max, 0);

  return { lines, meals, min, max, savedMin, savedMax };
}
