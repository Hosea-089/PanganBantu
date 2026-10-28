/*
=============================
SwapDialog
--> Pilihan pengganti yang tetap memenuhi anggaran dan pengecualian bahan.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { allowed, calculate, range, recipes, slots } from '@/features/planning/model';
import { Btn } from '@/shared/ui/Btn';
import { Dialog } from '@/shared/ui/Dialog';
import { Empty } from '@/shared/ui/Empty';
import { useFeedback } from '@/shared/ui/feedback';
import { Note } from '@/shared/ui/Note';
import { Check, ChefHat } from 'lucide-react';

export function SwapDialog({ d, s }: { d: number; s: number }) {
  const { plan, setPlan, stock, prefs, setChecked } = useKitchen();
  const { setModal, notify } = useFeedback();
  if (!plan) return null;
  const opts = recipes
    .filter(
      (r) =>
        r.slot === s && r.id !== plan.menu[d][s] && allowed(r, prefs) && allowed(r, plan.prefs),
    )
    .map((r) => {
      const p = structuredClone(plan);
      p.menu[d][s] = r.id;
      const c = calculate(p, stock);
      return { r, p, c };
    })
    .filter((o) => o.c.max <= plan.budget);
  return (
    <Dialog
      title="Pilih menu pengganti"
      sub={`${slots[s]} · Hari ${d + 1} · ${plan.people} porsi`}
      close={() => setModal(null)}
    >
      <Note>
        Hanya pilihan yang sesuai anggaran, porsi, serta pengecualian rencana dan preferensi terbaru
        yang ditampilkan. Estimasi seluruh rencana akan dihitung ulang.
      </Note>
      {opts.length ? (
        opts.map(({ r, p, c }) => (
          <article className="alt-card" key={r.id}>
            <img src={r.image} alt={r.name} />
            <div>
              <h3>{r.name}</h3>
              <p>
                {r.time} menit · {r.nutrition[0]} kkal per porsi
              </p>
              <p>
                Total belanja rencana: <strong>{range(c.min, c.max)}</strong>
              </p>
              <Btn
                className="small"
                onClick={() => {
                  setPlan(p);
                  setChecked({});
                  setModal(null);
                  notify('Menu berhasil diganti. Daftar belanja sudah diperbarui.');
                }}
              >
                Pilih Menu
                <Check size={13} />
              </Btn>
            </div>
          </article>
        ))
      ) : (
        <Empty
          title="Belum ada pengganti yang sesuai"
          sub="Pilihan lain pada katalog belum memenuhi seluruh anggaran dan pengecualian Anda. Menu saat ini tetap tersimpan."
          icon={ChefHat}
        >
          <Btn variant="outline" onClick={() => setModal(null)}>
            Kembali ke rencana
          </Btn>
        </Empty>
      )}
    </Dialog>
  );
}
