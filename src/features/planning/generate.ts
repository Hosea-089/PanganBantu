/*
=============================
generate
--> Pencarian menu termurah dan rekomendasi sesuai anggaran serta preferensi.
=============================
*/

import { isPlanForm, isPrefs, isStock } from '@/shared/storage/validators';
import { allowed, calculate } from './calculations';
import { ingredients, recipes } from './catalog';
import type { GenerationResult, Plan, PlanForm, Preferences, Stock } from './types';

function allocations(n: number, k: number): number[][] {
  if (k === 1) {
    return [[n]];
  }

  const out: number[][] = [];
  for (let i = 0; i <= n; i++) {
    for (const rest of allocations(n - i, k - 1)) {
      out.push([i, ...rest]);
    }
  }

  return out;
}

export function generate(form: PlanForm, stock: Stock, prefs: Preferences): GenerationResult {
  if (!isPlanForm(form) || !isStock(stock) || !isPrefs(prefs))
    throw new Error('Data perencanaan tidak valid.');
  const options = [0, 1, 2].map((s) => recipes.filter((r) => r.slot === s && allowed(r, prefs)));

  if (options.some((o) => !o.length)) {
    return { error: 'restrictions' };
  }

  const ids = Object.keys(ingredients);
  const vectors = options.map((group) =>
    allocations(form.days, group.length).map((counts) => ({
      counts,
      needs: ids.map((id) =>
        group.reduce((n, r, i) => n + (r.items[id] || 0) * counts[i] * form.people, 0),
      ),
    })),
  );

  let best: (typeof vectors)[number] | null = null;
  let bestMax = Infinity;
  let bestMin = Infinity;

  for (const a of vectors[0]) {
    for (const b of vectors[1]) {
      for (const c of vectors[2]) {
        let max = 0;
        let min = 0;

        for (let i = 0; i < ids.length; i++) {
          const buy = Math.max(0, a.needs[i] + b.needs[i] + c.needs[i] - (stock[ids[i]] || 0));
          min += Math.round(buy * ingredients[ids[i]].price[0]);
          max += Math.round(buy * ingredients[ids[i]].price[1]);
        }

        if (max < bestMax || (max === bestMax && min < bestMin)) {
          best = [a, b, c];
          bestMax = max;
          bestMin = min;
        }
      }
    }
  }

  if (!best) return { error: 'restrictions' };
  const lists = best.map((v, s) =>
    v.counts.flatMap((n, i) => Array.from({ length: n }, () => options[s][i].id)),
  );

  const cheapest: Plan = {
    ...form,
    prefs: structuredClone(prefs),
    menu: Array.from({ length: form.days }, (_, d) => lists.map((list) => list[d])),
  };

  const sorted = options.map((o) =>
    o
      .slice()
      .sort(
        (a, b) =>
          Object.keys(b.items).filter((id) => prefs.liked.includes(id)).length -
          Object.keys(a.items).filter((id) => prefs.liked.includes(id)).length,
      ),
  );

  const varied: Plan = {
    ...form,
    prefs: structuredClone(prefs),
    menu: Array.from({ length: form.days }, (_, d) => sorted.map((o) => o[d % o.length].id)),
  };

  const recommended = calculate(varied, stock).max <= form.budget ? varied : cheapest;

  return { plan: recommended, cheapest, feasible: bestMax <= form.budget };
}
