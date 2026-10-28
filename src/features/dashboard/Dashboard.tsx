/*
=============================
Dashboard
--> Menyusun sambutan, ringkasan anggaran, pintasan, dan pratinjau stok.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { calculate, rupiah } from '@/features/planning/model';
import { Note } from '@/shared/ui/Note';
import { SourceNote } from '@/shared/ui/SourceNote';
import { ArrowRight } from 'lucide-react';
import { DashboardShortcuts } from './components/DashboardShortcuts';
import { DashboardStats } from './components/DashboardStats';
import { DashboardWelcome } from './components/DashboardWelcome';
import { PantryPreview } from './components/PantryPreview';

export function Dashboard() {
  const { plan, stock } = useKitchen();
  const calc = plan && calculate(plan, stock);

  return (
    <>
      <DashboardWelcome plan={plan} calc={calc} />
      {plan && calc && (
        <>
          <DashboardStats plan={plan} calc={calc} />
          {calc.max > plan.budget && (
            <Note warning>
              Estimasi belanja saat ini melebihi anggaran {rupiah(calc.max - plan.budget)} pada
              batas atas harga.{' '}
              <a href="#/rencana" className="text-link">
                Tinjau rencana
                <ArrowRight size={13} />
              </a>
            </Note>
          )}
        </>
      )}
      <DashboardShortcuts />
      <PantryPreview />
      <SourceNote />
    </>
  );
}
