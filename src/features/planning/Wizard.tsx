/*
=============================
Wizard
--> Alur lima langkah pembuatan rencana serta validasi sebelum melanjutkan.
=============================
*/

import { isPlanForm } from '@/shared/storage/validators';
import { go } from '@/app/navigation';
import { useKitchen } from '@/features/pantry/kitchen';
import { Pantry } from '@/features/pantry/Pantry';
import { usePlanning } from '@/features/planning/planning';
import { PreferenceEditor } from '@/features/preferences/PreferenceEditor';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Badge } from '@/shared/ui/Badge';
import { Btn } from '@/shared/ui/Btn';
import { SourceNote } from '@/shared/ui/SourceNote';
import { ArrowLeft, ArrowRight, ChefHat } from 'lucide-react';
import { useState } from 'react';
import { BudgetStep } from './components/BudgetStep';
import { ParticipantsStep } from './components/ParticipantsStep';
import { ReviewStep } from './components/ReviewStep';
import { WizardAside } from './components/WizardAside';
import { WizardProgress } from './components/WizardProgress';

export function Wizard() {
  const { stock } = useKitchen();
  const { form, setForm, step, setStep, createPlan } = usePlanning();
  const [error, setError] = useState('');

  function next() {
    setError('');
    if (step === 1 && (!Number.isSafeInteger(form.people) || form.people < 1 || form.people > 100))
      return setError('Jumlah peserta harus berupa bilangan bulat antara 1 dan 100.');
    if (step === 2) {
      if (!isPlanForm({ ...form, budget: 1 }))
        return setError('Pilih tanggal mulai dan durasi yang valid.');
      if (
        !Number.isFinite(form.budget) ||
        form.budget <= 0 ||
        form.budget > Number.MAX_SAFE_INTEGER
      )
        return setError('Anggaran perlu diisi dengan nilai lebih dari Rp0.');
    }
    setForm((f) => ({
      ...f,
      people: Number(f.people),
      budget: Number(f.budget),
    }));
    setStep(Math.min(5, step + 1));
    window.scrollTo(0, 0);
  }
  return (
    <>
      <PageHeader
        eyebrow="SELANGKAH MENUJU DAPUR TERENCANA"
        title="Buat Rencana Makan"
        sub="Rencana yang sesuai dengan kebutuhan, selera, dan kantong Anda."
      />
      <WizardProgress step={step} />
      <div className="wizard-layout">
        <div className="panel wizard-panel">
          <Badge>LANGKAH {step} DARI 5</Badge>
          <h2 style={{ marginTop: 20 }}>
            {
              [
                'Untuk siapa kita memasak?',
                'Atur hari dan anggaran Anda',
                'Apa yang ada di dapur?',
                'Menu yang pas dengan selera',
                'Siap merencanakan hidangan?',
              ][step - 1]
            }
          </h2>
          <p className="panel-sub">
            {
              [
                'Porsi setiap resep akan disesuaikan dengan jumlah peserta.',
                'Mulai dari anggaran yang nyaman untuk Anda.',
                'Stok akan dipakai lebih dulu sebelum menghitung bahan belanja.',
                'Beri tahu kesukaan dan bahan yang perlu dihindari.',
                'Periksa sekali lagi. Anda selalu bisa mengganti menu nanti.',
              ][step - 1]
            }
          </p>
          {step === 1 && <ParticipantsStep error={error} />}
          {step === 2 && <BudgetStep error={error} />}
          {step === 3 && <Pantry embedded />}
          {step === 4 && <PreferenceEditor />}
          {step === 5 && <ReviewStep />}
          {error && (
            <div role="alert" className="field-error">
              {error}
            </div>
          )}
          <div className="wizard-buttons">
            <Btn
              variant="outline"
              onClick={() => {
                setError('');
                if (step === 1) go('/dashboard');
                else setStep(step - 1);
              }}
            >
              <ArrowLeft size={15} />
              {step === 1 ? 'Batal' : 'Kembali'}
            </Btn>
            {step < 5 ? (
              <div className="actions">
                {step === 3 && !Object.keys(stock).length && (
                  <button className="text-link muted" onClick={next}>
                    Lewati, belum ada stok
                  </button>
                )}
                <Btn onClick={next}>
                  Lanjut
                  <ArrowRight size={15} />
                </Btn>
              </div>
            ) : (
              <Btn onClick={createPlan}>
                <ChefHat size={17} />
                Buat Rencana Makan
              </Btn>
            )}
          </div>
        </div>
        <WizardAside />
      </div>
      <SourceNote />
    </>
  );
}
