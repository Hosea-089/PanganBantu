/*
=============================
WizardAside
--> Ringkasan peserta, durasi, anggaran, dan stok selama pengisian.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { rupiah } from '@/features/planning/model';
import { usePlanning } from '@/features/planning/planning';
import { Leaf } from 'lucide-react';

export function WizardAside() {
  const { form } = usePlanning();
  const { stock } = useKitchen();
  return (
    <aside className="wizard-aside">
      <Leaf size={29} strokeWidth={1.4} />
      <h3>Pas untuk keseharian Anda.</h3>
      <p>Rencana kecil hari ini bisa membuat urusan makan besok jauh lebih ringan.</p>
      <div className="aside-line">
        <span>Peserta</span>
        <strong>{form.people || '—'} orang</strong>
      </div>
      <div className="aside-line">
        <span>Durasi</span>
        <strong>{form.days} hari</strong>
      </div>
      <div className="aside-line">
        <span>Anggaran</span>
        <strong>{rupiah(Number(form.budget) || 0)}</strong>
      </div>
      <div className="aside-line">
        <span>Stok dapur</span>
        <strong>{Object.keys(stock).length} bahan</strong>
      </div>
      <p style={{ fontSize: 10, marginTop: 20, marginBottom: 0 }}>
        Anda bisa kembali ke langkah sebelumnya kapan saja. Isian tetap tersimpan selama proses ini.
      </p>
    </aside>
  );
}
