/*
=============================
DashboardStats
--> Ringkasan anggaran, penghematan stok, dan jumlah bahan tersedia.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { range, rupiah } from '@/features/planning/model';
import type { Calculation, Plan } from '@/features/planning/types';
import { Stat } from '@/shared/ui/Stat';
import { Package, Sprout, Wallet } from 'lucide-react';

export function DashboardStats({ plan, calc }: { plan: Plan | null; calc: Calculation | null }) {
  const { stock } = useKitchen();
  if (!plan || !calc) return null;
  return (
    <div
      className="summary-grid dashboard-stats"
      role="region"
      aria-label="Ringkasan dapur"
      tabIndex={0}
    >
      <Stat
        title="Anggaran makan"
        value={rupiah(plan.budget)}
        sub={`${rupiah(plan.budget / plan.days)} per hari · ${plan.days} hari`}
        icon={Wallet}
      />
      <Stat
        blue
        title="Hemat dari stok dapur"
        value={range(calc.savedMin, calc.savedMax)}
        sub={`${calc.lines.filter((l) => l.used > 0).length} bahan dimanfaatkan dari dapur Anda`}
        icon={Sprout}
      />
      <Stat
        title="Bahan tersedia"
        value={`${Object.values(stock).filter((v) => v > 0).length} jenis bahan`}
        sub="Cek stok sebelum menambah belanja"
        icon={Package}
      />
    </div>
  );
}
