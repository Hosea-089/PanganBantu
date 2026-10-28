/*
=============================
MealCard
--> Foto, biaya per porsi, gizi, dan tindakan resep atau penggantian menu.
=============================
*/

import { getRecipe, range, slots } from '@/features/planning/model';
import { Badge } from '@/shared/ui/Badge';
import { Btn } from '@/shared/ui/Btn';
import { useFeedback } from '@/shared/ui/feedback';
import { ArrowUpRight, RefreshCw } from 'lucide-react';
import type { Calculation, Plan } from '../types';

export function MealCard({
  d,
  s,
  plan,
  calc,
}: {
  d: number;
  s: number;
  plan: Plan;
  calc: Calculation;
}) {
  const { setModal } = useFeedback();
  const r = getRecipe(plan.menu[d][s]),
    m = calc.meals.find((m) => m.d === d && m.s === s);
  if (!m) return null;
  return (
    <article className="meal-card">
      <div className="meal-photo">
        <img loading="lazy" src={r.image} alt={r.name + ' — ilustrasi penyajian'} />
        <Badge>
          {s === 0 ? '☀' : s === 1 ? '◉' : '☾'} {slots[s]}
        </Badge>
      </div>
      <div className="meal-body">
        <h3>{r.name}</h3>
        <div className="meal-price">
          {range(m.min / plan.people, m.max / plan.people)}
          <span className="meal-price-unit">/porsi</span>
        </div>
        <div className="nutrition-mini">
          <div>
            <strong>{r.nutrition[0]} kkal</strong>Energi / porsi
          </div>
          <div>
            <strong>{r.nutrition[1]} g</strong>Protein
          </div>
          <div>
            <strong>{r.nutrition[4]} g</strong>Serat
          </div>
        </div>
        <div className="meal-actions">
          <Btn variant="outline" onClick={() => setModal({ type: 'recipe', d, s })}>
            Lihat Resep
            <ArrowUpRight size={13} />
          </Btn>
          <button className="text-link muted" onClick={() => setModal({ type: 'swap', d, s })}>
            <RefreshCw size={12} />
            Ganti Menu
          </button>
        </div>
      </div>
    </article>
  );
}
