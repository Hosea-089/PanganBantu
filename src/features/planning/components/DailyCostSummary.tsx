/*
=============================
DailyCostSummary
--> Biaya tiap tanggal serta total pengurangan biaya dari stok dapur.
=============================
*/

import { dateLabel, range } from '@/features/planning/model';
import { Badge } from '@/shared/ui/Badge';
import type { Calculation, Plan } from '../types';

export function DailyCostSummary({ plan, calc: c }: { plan: Plan; calc: Calculation }) {
  return (
    <div className="panel" style={{ marginTop: 25 }}>
      <div className="section-title" style={{ marginTop: 0 }}>
        <h2>Ringkasan biaya harian</h2>
        <Badge color="gray">Setelah memakai stok</Badge>
      </div>
      <div className="summary-list">
        {plan.menu.map((_, d) => {
          const ms = c.meals.filter((m) => m.d === d);
          return (
            <div key={dateLabel(plan.start, d)}>
              <span>
                Hari {d + 1} · {dateLabel(plan.start, d, true)}
              </span>
              <strong>
                {range(
                  ms.reduce((n, m) => n + m.min, 0),
                  ms.reduce((n, m) => n + m.max, 0),
                )}
              </strong>
            </div>
          );
        })}
        <div>
          <span>Estimasi tanpa stok</span>
          <strong>{range(c.min + c.savedMin, c.max + c.savedMax)}</strong>
        </div>
        <div>
          <span>Pengurangan dari stok</span>
          <strong>− {range(c.savedMin, c.savedMax)}</strong>
        </div>
        <div style={{ color: 'var(--blue)' }}>
          <strong>Total estimasi belanja</strong>
          <strong>{range(c.min, c.max)}</strong>
        </div>
      </div>
    </div>
  );
}
