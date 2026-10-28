/*
=============================
WizardProgress
--> Indikator langkah aktif pada pembuatan rencana.
=============================
*/

import { Check } from 'lucide-react';

export function WizardProgress({ step }: { step: number }) {
  const labels = [
    'Pilih Perencanaan',
    'Durasi & Anggaran',
    'Stok Bahan',
    'Preferensi Makanan',
    'Ringkasan',
  ];
  return (
    <div className="progress-steps" aria-label={`Langkah ${step} dari 5`}>
      {labels.map((l, i) => (
        <div
          className={'progress-step ' + (step === i + 1 ? 'current' : step > i + 1 ? 'done' : '')}
          key={l}
          aria-current={step === i + 1 ? 'step' : undefined}
        >
          <span>{step > i + 1 ? <Check size={15} /> : i + 1}</span>
          {l}
        </div>
      ))}
    </div>
  );
}
