/*
=============================
RecipeDialog
--> Bahan, alokasi stok, langkah memasak, dan informasi gizi resep.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { calculate, getRecipe, ingredients, qty, range, slots } from '@/features/planning/model';
import { Badge } from '@/shared/ui/Badge';
import { Btn } from '@/shared/ui/Btn';
import { Dialog } from '@/shared/ui/Dialog';
import { useFeedback } from '@/shared/ui/feedback';
import { Note } from '@/shared/ui/Note';
import { ArrowLeft, Check, Clock, Users } from 'lucide-react';

export function RecipeDialog({ d, s }: { d: number; s: number }) {
  const { plan, stock } = useKitchen();
  const { setModal } = useFeedback();
  if (!plan) return null;
  const r = getRecipe(plan.menu[d][s]),
    c = calculate(plan, stock),
    m = c.meals.find((x) => x.d === d && x.s === s),
    labels = ['Energi', 'Protein', 'Karbohidrat', 'Lemak', 'Serat'];
  if (!m) return null;
  return (
    <Dialog title="Dari dapur PanganBantu" close={() => setModal(null)} large>
      <div className="recipe-hero">
        <img src={r.image} alt={r.name + ' — foto ilustrasi'} />
        <div>
          <Badge color="green">
            {slots[s]} · Hari {d + 1}
          </Badge>
          <h2>{r.name}</h2>
          <div className="meal-meta">
            <Clock size={14} />
            {r.time} menit <span>·</span>
            <Users size={14} />
            {plan.people} porsi
          </div>
          <div className="meal-price">{range(m.min, m.max)}</div>
          <p>Estimasi bahan tambahan untuk {plan.people} porsi.</p>
        </div>
      </div>
      <div className="recipe-columns">
        <section>
          <h3>Bahan yang dibutuhkan</h3>
          <p className="muted" style={{ fontSize: 11 }}>
            Takaran sudah disesuaikan untuk {plan.people} porsi. Beras ditimbang sebelum dimasak.
          </p>
          {m.lines.map((l) => (
            <div className="ingredient-line" key={l.id}>
              <div>
                <strong>{ingredients[l.id].name}</strong>
                <span>{qty(l.need, l.id)}</span>
              </div>
              {l.used > 0 && (
                <small style={{ color: '#547843' }}>
                  <Check size={10} style={{ verticalAlign: 'middle' }} /> Sudah tersedia:{' '}
                  {qty(l.used, l.id)} {l.buy === 0 ? '· Tidak perlu dibeli' : ''}
                </small>
              )}
              {l.buy > 0 && (
                <small>
                  Perlu dibeli: {qty(l.buy, l.id)} · {range(l.min, l.max)}
                </small>
              )}
            </div>
          ))}
          <p className="muted" style={{ fontSize: 10, marginTop: 12 }}>
            Air secukupnya digunakan untuk memasak. Alokasi stok ini memperhitungkan menu sebelumnya
            agar tidak terhitung dua kali.
          </p>
        </section>
        <section>
          <h3>Cara memasak</h3>
          {r.steps.map((step, i) => (
            <div className="cooking-step" key={step}>
              <span>{i + 1}</span>
              <p>{step}</p>
            </div>
          ))}
          <Note>
            Foto adalah ilustrasi penyajian dan dapat memuat pelengkap. Gunakan daftar bahan resep
            ini; pelengkap foto tidak termasuk dalam perhitungan.
          </Note>
        </section>
      </div>
      <h3 style={{ fontSize: 16, margin: '25px 0 12px' }}>Perkiraan gizi per porsi</h3>
      <div className="nutrition-full">
        {r.nutrition.map((n, i) => (
          <div key={labels[i]}>
            <strong>
              {n} {i === 0 ? 'kkal' : 'g'}
            </strong>
            {labels[i]}
          </div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 10 }}>
        Informasi gizi simulasi, bukan target gizi pribadi atau diagnosis medis.
      </p>
      <Btn variant="outline" onClick={() => setModal(null)}>
        <ArrowLeft size={15} />
        Kembali ke Rencana Makan
      </Btn>
    </Dialog>
  );
}
