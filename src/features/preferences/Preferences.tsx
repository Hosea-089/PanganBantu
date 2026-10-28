/*
=============================
Preferences
--> Halaman draf preferensi yang disimpan setelah tombol Simpan ditekan.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { PreferenceEditor } from '@/features/preferences/PreferenceEditor';
import { planHeaderImages } from '@/shared/layout/headerImages';
import { PageHeader } from '@/shared/layout/PageHeader';
import { WorkspaceBreadcrumb } from '@/shared/layout/WorkspaceBreadcrumb';
import { Btn } from '@/shared/ui/Btn';
import { useFeedback } from '@/shared/ui/feedback';
import { Note } from '@/shared/ui/Note';
import { Check } from 'lucide-react';
import { useState } from 'react';

export function Preferences() {
  const { prefs, setPrefs, plan } = useKitchen();
  const { notify } = useFeedback();
  const [draft, setDraft] = useState(() => structuredClone(prefs));
  const save = () => {
    setPrefs(draft);
    notify('Preferensi berhasil diperbarui untuk rekomendasi berikutnya.');
  };
  return (
    <>
      <PageHeader
        eyebrow="SETIAP DAPUR PUNYA SELERA"
        title="Preferensi Makanan"
        breadcrumb={<WorkspaceBreadcrumb currentLabel="Preferensi" />}
        sub="Bantu kami memilih hidangan yang nyaman untuk Anda."
        backgroundImages={planHeaderImages(plan)}
      >
        <Btn onClick={save}>
          <Check size={17} />
          Simpan Preferensi
        </Btn>
      </PageHeader>
      <div className="panel preferences-panel">
        <h2>Selera & kebutuhan makan</h2>
        <p className="panel-sub">Pilihan ini akan digunakan saat membuat rencana berikutnya.</p>
        <PreferenceEditor value={draft} onChange={setDraft} />
        {plan && (
          <Note>
            Rencana aktif tidak diubah otomatis. Setelah menyimpan preferensi, buat rencana baru
            untuk menerapkan seluruh perubahan.
          </Note>
        )}
        <Btn onClick={save}>
          <Check size={16} />
          Simpan Preferensi
        </Btn>
      </div>
    </>
  );
}
