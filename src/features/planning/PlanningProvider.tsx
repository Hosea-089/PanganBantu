/*
=============================
PlanningProvider
--> State draf lintas halaman, pengiriman perhitungan ke worker, dan penyimpanan hasil.
=============================
*/

import { go } from '@/app/navigation';
import { useKitchen } from '@/features/pantry/kitchen';
import { isPlanForm } from '@/shared/storage/validators';
import { Dialog } from '@/shared/ui/Dialog';
import { useFeedback } from '@/shared/ui/feedback';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { defaultForm } from './model';
import { PlanningContext } from './planning';
import type { GenerationResult, Plan, PlanForm } from './types';

export function PlanningProvider({ children }: { children: ReactNode }) {
  const { plan, setPlan, setChecked, stock, prefs } = useKitchen();
  const { notify } = useFeedback();
  const [form, setForm] = useState<PlanForm>({ ...defaultForm });
  const [step, setStep] = useState(1);
  const [failure, setFailure] = useState<GenerationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const worker = useRef<Worker | null>(null);
  useEffect(() => () => worker.current?.terminate(), []);
  const startPlan = () => {
    setFailure(null);
    setStep(1);
    setForm(
      plan
        ? {
            mode: plan.mode,
            people: plan.people,
            days: plan.days,
            start: plan.start,
            budget: plan.budget,
          }
        : { ...defaultForm },
    );
    go('/buat-rencana');
  };
  const savePlan = (value: Plan) => {
    setPlan(value);
    setChecked({});
    setFailure(null);
    go('/rencana');
    notify(
      value.alternative
        ? 'Alternatif ditampilkan. Estimasinya masih melebihi anggaran.'
        : 'Rencana makan berhasil dibuat. Selamat memasak!',
    );
  };
  const createPlan = () => {
    if (worker.current) return;
    if (!isPlanForm(form)) {
      notify('Periksa tanggal, anggaran, durasi 1–7 hari, dan jumlah peserta 1–100.');
      return;
    }
    try {
      const job = new Worker(new URL('./planner.worker.ts', import.meta.url), { type: 'module' });
      worker.current = job;
      setBusy(true);
      const finish = () => {
        job.terminate();
        worker.current = null;
        setBusy(false);
      };
      job.onmessage = (event: MessageEvent<{ result?: GenerationResult; error?: string }>) => {
        finish();
        const result = event.data.result;
        if (!result) {
          notify(event.data.error ?? 'Rencana belum dapat dibuat. Coba lagi.');
          return;
        }
        if (result.error || !result.feasible) {
          setFailure(result);
          go('/hasil');
        } else savePlan(result.plan);
      };
      job.onerror = () => {
        finish();
        notify('Rencana belum dapat dihitung. Silakan coba lagi.');
      };
      job.postMessage({ form, stock, prefs });
    } catch {
      setBusy(false);
      worker.current = null;
      notify('Peramban belum dapat menjalankan perhitungan. Silakan coba lagi.');
    }
  };
  return (
    <PlanningContext
      value={{ form, setForm, step, setStep, failure, busy, startPlan, createPlan, savePlan }}
    >
      {children}
      {busy && (
        <div className="workspace-surface allianz-surface modal-surface">
          <Dialog title="Sedang merencanakan menu" dismissible={false}>
            <div className="loading" role="status">
              <div className="spinner" />
              <h2>Menu hemat sedang disiapkan…</h2>
              <p>Menghitung stok, porsi, anggaran, dan preferensi Anda.</p>
            </div>
          </Dialog>
        </div>
      )}
    </PlanningContext>
  );
}
