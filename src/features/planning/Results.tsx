/*
=============================
Results
--> Hasil rencana, peringatan anggaran atau preferensi, menu harian, dan biaya.
=============================
*/

import { DayTabs } from './components/DayTabs';
import { go } from '@/app/navigation';
import { useKitchen } from '@/features/pantry/kitchen';
import { MealCarousel } from '@/features/planning/components/MealCarousel';
import {
  allowed,
  calculate,
  dateLabel,
  dateRange,
  getRecipe,
  range,
  rupiah,
} from '@/features/planning/model';
import { usePlanning } from '@/features/planning/planning';
import { planHeaderImages } from '@/shared/layout/headerImages';
import { PageHeader } from '@/shared/layout/PageHeader';
import { WorkspaceBreadcrumb } from '@/shared/layout/WorkspaceBreadcrumb';
import { Badge } from '@/shared/ui/Badge';
import { Btn } from '@/shared/ui/Btn';
import { Empty } from '@/shared/ui/Empty';
import { Note } from '@/shared/ui/Note';
import { SourceNote } from '@/shared/ui/SourceNote';
import { Stat } from '@/shared/ui/Stat';
import { ArrowRight, Package, RefreshCw, ShoppingBasket, Users, Wallet } from 'lucide-react';
import { useState } from 'react';
import { RecipeAssistant } from './RecipeAssistant';
import { DailyCostSummary } from './components/DailyCostSummary';

export function Results() {
  const { plan, stock, prefs } = useKitchen();
  const { startPlan, setForm, setStep } = usePlanning();
  const [day, setDay] = useState(0);
  if (!plan)
    return (
      <Empty
        title="Belum ada rencana makan"
        sub="Buat rencana pertama untuk melihat menu dan estimasi belanja Anda."
      >
        <Btn onClick={startPlan}>
          Buat Rencana Makan
          <ArrowRight size={16} />
        </Btn>
      </Empty>
    );
  const c = calculate(plan, stock),
    daily = c.meals.filter((m) => m.d === day),
    dailyMin = daily.reduce((n, m) => n + m.min, 0),
    dailyMax = daily.reduce((n, m) => n + m.max, 0),
    inBudget = c.max <= plan.budget,
    conflict = plan.menu.flat().some((id) => !allowed(getRecipe(id), prefs));
  return (
    <>
      <PageHeader
        eyebrow="DARI RENCANA, JADI HIDANGAN"
        title="Rencana Makan Anda"
        breadcrumb={<WorkspaceBreadcrumb currentLabel="Rencana Makan" />}
        sub={`${dateRange(plan)} · ${plan.mode} · ${plan.people} orang`}
        backgroundImages={planHeaderImages(plan)}
      >
        <div className="actions">
          <Btn onClick={startPlan} variant="outline">
            <RefreshCw size={15} />
            Rencana Baru
          </Btn>
          <Btn to="/belanja">
            <ShoppingBasket size={16} />
            Daftar Belanja
          </Btn>
        </div>
      </PageHeader>
      {conflict && (
        <Note warning>
          Preferensi Anda berubah. Ada menu pada rencana ini yang tidak sesuai preferensi terbaru.
          Buat rencana baru untuk menerapkan pengecualian tersebut.
        </Note>
      )}
      {!inBudget && (
        <Note warning>
          <strong>Alternatif ini masih melebihi anggaran.</strong>
          <p>
            Anggaran {rupiah(plan.budget)}; batas atas estimasi melebihi sebesar{' '}
            {rupiah(c.max - plan.budget)}. Rencana ini belum sesuai anggaran.
          </p>
          <button
            className="text-link"
            onClick={() => {
              setForm({ ...plan });
              setStep(2);
              go('/buat-rencana');
            }}
          >
            Ubah Anggaran
            <ArrowRight size={13} />
          </button>
        </Note>
      )}
      <div
        className="summary-grid"
        role="region"
        aria-label="Ringkasan anggaran rencana makan"
        tabIndex={0}
      >
        <Stat
          title="Total estimasi belanja"
          value={range(c.min, c.max)}
          icon={ShoppingBasket}
          blue
        />
        <Stat title="Anggaran Anda" value={rupiah(plan.budget)} icon={Wallet} />
        <Stat title="Hemat dari stok dapur" value={range(c.savedMin, c.savedMax)} icon={Package} />
      </div>
      <DayTabs plan={plan} day={day} setDay={setDay} />
      <section id="day-panel" role="tabpanel" aria-labelledby={`day-tab-${day}`} tabIndex={0}>
        <div className="result-heading">
          <div>
            <h2>{dateLabel(plan.start, day)}</h2>
            <p>
              Estimasi belanja hari ini:{' '}
              <strong style={{ color: '#4b5641' }}>{range(dailyMin, dailyMax)}</strong>
            </p>
          </div>
          <Badge color="green">
            <Users size={11} />
            {plan.people} porsi setiap menu
          </Badge>
        </div>
        <MealCarousel key={dateLabel(plan.start, day)} d={day} plan={plan} calc={c} />
      </section>
      <Note>
        Nilai gizi merupakan informasi perkiraan per porsi, bukan target gizi atau saran medis. Stok
        dipakai berurutan dari awal rencana; biaya harian dapat berbeda karena alokasi stok.
      </Note>
      <DailyCostSummary plan={plan} calc={c} />
      <RecipeAssistant plan={plan} selectedDay={day} />
      <SourceNote />
    </>
  );
}
