/*
=============================
BudgetStep
--> Pemilihan durasi, tanggal mulai, dan anggaran belanja.
=============================
*/

import { dateLabel, rupiah } from '@/features/planning/model';
import { usePlanning } from '@/features/planning/planning';
import type { PlanForm } from '@/features/planning/types';
import { Wallet } from 'lucide-react';

export function BudgetStep({ error }: { error: string }) {
  const { form, setForm } = usePlanning();
  const set = <K extends keyof PlanForm>(k: K, v: PlanForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  return (
    <>
      <fieldset className="field">
        <legend>Rencanakan untuk berapa hari?</legend>
        <div className="day-picker">
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <button
              key={d}
              onClick={() => set('days', d)}
              className={form.days === d ? 'selected' : ''}
              aria-pressed={form.days === d}
              aria-label={`${d} hari`}
            >
              {d}
            </button>
          ))}
        </div>
        <small>
          {form.days} hari · {form.days * 3} waktu makan
        </small>
      </fieldset>
      <label className="field">
        <span>Tanggal mulai</span>
        <input
          type="date"
          lang="id-ID"
          value={form.start}
          onChange={(e) => set('start', e.target.value)}
        />
        {form.start && <small>{dateLabel(form.start)}</small>}
      </label>
      <label className="field">
        <span>Total anggaran belanja (Rp)</span>
        <input
          type="number"
          min="1"
          step="1"
          placeholder="Contoh: 150000"
          value={form.budget}
          onChange={(e) => set('budget', Number(e.target.value))}
          aria-invalid={!!error}
        />
        <small>
          Anggaran untuk {form.people} orang selama {form.days} hari, setelah memakai stok dapur.
        </small>
      </label>
      <div className="budget-equivalent">
        <Wallet size={22} />
        <div>
          Setara{' '}
          <strong>{rupiah(Math.max(0, Number(form.budget) || 0) / form.days)} per hari</strong>
          <br />
          <small>
            {rupiah(Math.max(0, Number(form.budget) || 0) / form.days / (Number(form.people) || 1))}{' '}
            per orang per hari
          </small>
        </div>
      </div>
    </>
  );
}
