/*
=============================
PreferenceEditor
--> Pemilihan bahan disukai, dihindari, pola makan, dan alergi.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { ingredients } from '@/features/planning/model';
import type { Preferences } from '@/features/planning/types';
import { Note } from '@/shared/ui/Note';
import { Check, Heart, ShieldCheck, X } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

export function PreferenceEditor({
  value,
  onChange,
}: { value?: Preferences; onChange?: Dispatch<SetStateAction<Preferences>> } = {}) {
  const { prefs, setPrefs } = useKitchen();
  const p = value || prefs,
    set = onChange || setPrefs;
  function toggle(group: 'liked' | 'avoided' | 'allergies', id: string) {
    set((prev) => ({
      ...prev,
      [group]: prev[group].includes(id)
        ? prev[group].filter((v) => v !== id)
        : [...prev[group], id],
      ...(group === 'liked'
        ? { avoided: prev.avoided.filter((v) => v !== id) }
        : group === 'avoided'
          ? { liked: prev.liked.filter((v) => v !== id) }
          : {}),
    }));
  }
  return (
    <>
      <div className="prefs-group">
        <h3>
          <Heart size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />
          Bahan yang disukai
        </h3>
        <p>Diutamakan jika sesuai anggaran dan pantangan Anda.</p>
        <div className="chips">
          {Object.entries(ingredients).map(([id, v]) => (
            <button
              key={id}
              className={'chip ' + (p.liked.includes(id) ? 'selected' : '')}
              onClick={() => toggle('liked', id)}
              aria-pressed={p.liked.includes(id)}
            >
              {p.liked.includes(id) && <Check size={12} />} {v.name}
            </button>
          ))}
        </div>
      </div>
      <div className="prefs-group">
        <h3>Bahan yang dihindari</h3>
        <p>Bahan ini tidak akan digunakan pada rekomendasi baru.</p>
        <div className="chips">
          {Object.entries(ingredients).map(([id, v]) => (
            <button
              key={id}
              className={'chip ' + (p.avoided.includes(id) ? 'selected' : '')}
              onClick={() => toggle('avoided', id)}
              aria-pressed={p.avoided.includes(id)}
            >
              {p.avoided.includes(id) && <X size={12} />} {v.name}
            </button>
          ))}
        </div>
      </div>
      <div className="prefs-group">
        <h3>Pola makan</h3>
        <p>Pilih pola makan yang sesuai dengan kebutuhan Anda.</p>
        <div className="chips">
          {['Bebas', 'Vegetarian', 'Vegan'].map((v) => (
            <button
              className={'chip ' + (p.diet === v ? 'selected' : '')}
              key={v}
              aria-pressed={p.diet === v}
              onClick={() => set((prev) => ({ ...prev, diet: v }))}
            >
              {p.diet === v && <Check size={12} />} {v}
            </button>
          ))}
        </div>
        <p style={{ marginTop: 10 }}>
          Vegetarian: tanpa daging. Vegan: tanpa bahan hewani, termasuk telur.
        </p>
      </div>
      <div className="prefs-group">
        <h3>
          <ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 7 }} />
          Alergi bahan makanan
        </h3>
        <p>Pilih semua yang berlaku. Pengecualian ini wajib dipatuhi.</p>
        <div className="chips">
          {['Telur', 'Kedelai', 'Gluten', 'Susu', 'Kacang tanah', 'Ikan', 'Kerang'].map((a) => (
            <button
              className={'chip allergy ' + (p.allergies.includes(a) ? 'selected' : '')}
              key={a}
              onClick={() => toggle('allergies', a)}
              aria-pressed={p.allergies.includes(a)}
            >
              {p.allergies.includes(a) && <Check size={12} />} {a}
            </button>
          ))}
        </div>
      </div>
      <Note warning>
        Alergen yang dipilih akan dikecualikan dari seluruh rekomendasi baru dan pilihan pengganti.
        Preferensi kesukaan tidak dapat mengabaikan alergi. Periksa juga label bahan dan kemungkinan
        kontaminasi silang saat memasak.
      </Note>
    </>
  );
}
