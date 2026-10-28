/*
=============================
DeleteDialog
--> Konfirmasi penghapusan bahan dan pembaruan daftar belanja.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { ingredients } from '@/features/planning/model';
import { Btn } from '@/shared/ui/Btn';
import { Dialog } from '@/shared/ui/Dialog';
import { useFeedback } from '@/shared/ui/feedback';
import { Trash2 } from 'lucide-react';

export function DeleteDialog({ id }: { id: string }) {
  const { setStock, setChecked } = useKitchen();
  const { setModal, notify } = useFeedback();
  return (
    <Dialog
      title="Hapus bahan dari stok?"
      sub={`${ingredients[id].name} akan dikeluarkan dari stok dapur. Estimasi belanja akan dihitung ulang.`}
      close={() => setModal(null)}
    >
      <div className="actions">
        <Btn variant="outline" onClick={() => setModal(null)}>
          Batal
        </Btn>
        <Btn
          onClick={() => {
            setStock((s) => {
              const n = { ...s };
              delete n[id];
              return n;
            });
            setChecked({});
            setModal(null);
            notify(ingredients[id].name + ' dihapus dari stok.');
          }}
        >
          <Trash2 size={15} />
          Hapus Bahan
        </Btn>
      </div>
    </Dialog>
  );
}
