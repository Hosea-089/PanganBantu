/*
=============================
Infeasible
--> Penjelasan kendala rencana dan pilihan mengubah isian atau melihat alternatif.
=============================
*/

import { go } from '@/app/navigation';
import { useKitchen } from '@/features/pantry/kitchen';
import { calculate, range, rupiah } from '@/features/planning/model';
import { usePlanning } from '@/features/planning/planning';
import { PageHeader } from '@/shared/layout/PageHeader';
import { Badge } from '@/shared/ui/Badge';
import { Btn } from '@/shared/ui/Btn';
import { Empty } from '@/shared/ui/Empty';
import { Note } from '@/shared/ui/Note';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export function Infeasible() {
  const { stock } = useKitchen();
  const { failure, form, setStep, savePlan, startPlan } = usePlanning();
  if (!failure)
    return (
      <Empty
        title="Mulai dengan kebutuhan Anda"
        sub="Atur anggaran dan preferensi untuk membuat rencana."
      >
        <Btn onClick={startPlan}>Buat Rencana Makan</Btn>
      </Empty>
    );
  const c = failure.cheapest && calculate(failure.cheapest, stock);
  return (
    <>
      <PageHeader
        title="Mari sesuaikan rencana Anda"
        sub="Sedikit penyesuaian bisa membuat rencana makan terasa lebih pas."
      />
      <div className="error-plan">
        <AlertTriangle size={47} strokeWidth={1.5} />
        <h2>
          {failure.error
            ? 'Belum ada menu yang sesuai.'
            : 'Anggaran belum mencukupi untuk rencana ini.'}
        </h2>
        <p>
          {failure.error
            ? 'Kombinasi bahan yang dihindari dan pola makan belum dapat dipenuhi oleh katalog simulasi kami. Tinjau preferensi atau stok. Alergi Anda tetap dikecualikan.'
            : `Untuk ${form.people} orang selama ${form.days} hari, alternatif termurah dari katalog simulasi membutuhkan kisaran berikut setelah memakai stok Anda.`}
        </p>
        {c && (
          <>
            <div className="cost">{range(c.min, c.max)}</div>
            <Badge color="orange">Masih di atas anggaran {rupiah(form.budget)}</Badge>
            <p style={{ marginTop: 18 }}>
              Batas atas estimasi melebihi anggaran sebesar{' '}
              <strong>{rupiah(c.max - form.budget)}</strong>. Alternatif ini belum sesuai anggaran.
            </p>
          </>
        )}
        <div className="actions" style={{ marginTop: 25 }}>
          {failure.error ? (
            <Btn
              onClick={() => {
                setStep(4);
                go('/buat-rencana');
              }}
            >
              Tinjau Preferensi
              <ArrowRight size={15} />
            </Btn>
          ) : (
            <>
              <Btn
                onClick={() => {
                  savePlan({ ...failure.cheapest, alternative: true });
                }}
              >
                Lihat Alternatif Termurah
                <ArrowRight size={15} />
              </Btn>
              <Btn
                variant="outline"
                onClick={() => {
                  setStep(2);
                  go('/buat-rencana');
                }}
              >
                Ubah Anggaran
              </Btn>
            </>
          )}
        </div>
      </div>
      <Note>
        “Termurah” berarti kombinasi dengan batas atas biaya belanja terendah dari 9 resep simulasi
        yang tersedia, sesuai porsi, stok, dan pengecualian Anda. Angka ini bukan harga pasar waktu
        nyata.
      </Note>
    </>
  );
}
