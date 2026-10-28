/*
=============================
ParticipantsStep
--> Pemilihan individu atau keluarga dan jumlah peserta 1 sampai 100.
=============================
*/

import { usePlanning } from '@/features/planning/planning';
import type { PlanForm } from '@/features/planning/types';
import { Note } from '@/shared/ui/Note';
import { User, Users } from 'lucide-react';

export function ParticipantsStep({ error }: { error: string }) {
  const { form, setForm } = usePlanning();
  const set = <K extends keyof PlanForm>(k: K, v: PlanForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  return (
    <>
      <div className="mode-cards">
        {(
          [
            ['Individu', User, 'Untuk kebutuhan makan sendiri.'],
            ['Keluarga', Users, 'Untuk Anda dan orang tersayang.'],
          ] as const
        ).map(([mode, Icon, sub]) => (
          <button
            className={'mode-card ' + (form.mode === mode ? 'selected' : '')}
            key={mode}
            onClick={() =>
              setForm((f) => ({
                ...f,
                mode,
                people: mode === 'Individu' ? 1 : Math.max(2, Number(f.people) || 2),
              }))
            }
            aria-pressed={form.mode === mode}
          >
            <span className="radio-dot" />
            <Icon size={29} strokeWidth={1.5} />
            <h3>{mode}</h3>
            <p>{sub}</p>
          </button>
        ))}
      </div>
      <label className="field">
        <span>Jumlah peserta</span>
        <input
          type="number"
          min="1"
          max="100"
          step="1"
          value={form.people}
          onChange={(e) => set('people', Number(e.target.value))}
          disabled={form.mode === 'Individu'}
          aria-invalid={!!error}
        />
        <small>
          {form.mode === 'Individu'
            ? 'Mode individu otomatis menggunakan 1 peserta.'
            : 'Masukkan jumlah orang dalam bilangan bulat, termasuk Anda.'}
        </small>
      </label>
      <Note>
        <p>Satu peserta mendapat sarapan, makan siang, dan makan malam setiap hari.</p>
      </Note>
    </>
  );
}
