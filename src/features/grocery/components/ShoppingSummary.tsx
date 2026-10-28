/*
=============================
ShoppingSummary
--> Total belanja, penghematan stok, dan status kecukupan anggaran.
=============================
*/

import { range } from '@/features/planning/model';
import type { Calculation, Plan } from '@/features/planning/types';
import { Badge } from '@/shared/ui/Badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function ShoppingSummary({ plan, calc: c }: { plan: Plan; calc: Calculation }) {
  return (
    <div className="shopping-total">
      <div>
        <small>Total estimasi belanja</small>
        <strong>{range(c.min, c.max)}</strong>
        <p className="remaining">
          Dari {range(c.min + c.savedMin, c.max + c.savedMax)}, hemat stok{' '}
          {range(c.savedMin, c.savedMax)}.
        </p>
      </div>
      <Badge color={c.max <= plan.budget ? 'green' : 'orange'}>
        {c.max <= plan.budget ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}{' '}
        {c.max <= plan.budget ? 'Sesuai anggaran' : 'Melebihi anggaran'}
      </Badge>
    </div>
  );
}
