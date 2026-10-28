/*
=============================
ReviewStep
--> Ringkasan seluruh isian, stok, preferensi, dan alergi sebelum perhitungan.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { dateRange, ingredients, qty, rupiah } from '@/features/planning/model';
import { usePlanning } from '@/features/planning/planning';
import { Note } from '@/shared/ui/Note';
import { ShieldCheck } from 'lucide-react';

export function ReviewStep() {
  const { form } = usePlanning();
  const { stock, prefs } = useKitchen();
  return (
    <>
      <div className="summary-list">
        <div>
          <span>Mode perencanaan</span>
          <strong>
            {form.mode} · {form.people} orang
          </strong>
        </div>
        <div>
          <span>Durasi</span>
          <strong>
            {form.days} hari · {form.days * 3} menu
          </strong>
        </div>
        <div>
          <span>Tanggal</span>
          <strong>{dateRange(form)}</strong>
        </div>
        <div>
          <span>Anggaran</span>
          <strong>{rupiah(form.budget)}</strong>
        </div>
        <div>
          <span>Setara per hari</span>
          <strong>{rupiah(form.budget / form.days)}</strong>
        </div>
      </div>
      <div className="inline-prefs">
        <strong>Stok dapur ({Object.keys(stock).length} bahan)</strong>
        {Object.keys(stock).length
          ? Object.entries(stock)
              .map(([id, q]) => `${ingredients[id].name} ${qty(q, id)}`)
              .join(' · ')
          : 'Belum ada stok. Seluruh kebutuhan akan masuk daftar belanja.'}
        <strong>Preferensi & pantangan</strong>
        {prefs.diet} · Disukai:{' '}
        {prefs.liked.map((id) => ingredients[id].name).join(', ') || 'Tidak ada pilihan'}
        <br />
        Dihindari: {prefs.avoided.map((id) => ingredients[id].name).join(', ') || 'Tidak ada'}
        <strong>Alergi yang wajib dikecualikan</strong>
        {prefs.allergies.join(', ') || 'Tidak ada alergi yang dipilih'}
      </div>
      <Note>
        <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: 5 }} />
        Rekomendasi memakai jumlah porsi, anggaran, stok, dan preferensi Anda. Batas atas estimasi
        dipakai untuk memeriksa kecukupan anggaran.
      </Note>
    </>
  );
}
