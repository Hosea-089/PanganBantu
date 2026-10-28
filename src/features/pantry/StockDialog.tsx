/*
=============================
StockDialog
--> Form tambah atau ubah jumlah stok beserta validasi satuan bahan.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { ingredients, qty } from '@/features/planning/model';
import { Btn } from '@/shared/ui/Btn';
import { Dialog } from '@/shared/ui/Dialog';
import { useFeedback } from '@/shared/ui/feedback';
import { Note } from '@/shared/ui/Note';
import { Check } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';

export function StockDialog({ id }: { id?: string }) {
  const { stock, setStock, setChecked } = useKitchen();
  const { setModal, notify } = useFeedback();
  const [selected, setSelected] = useState(id || 'beras'),
    [amount, setAmount] = useState<number | string>(id ? stock[id] : ''),
    [search, setSearch] = useState(''),
    [error, setError] = useState('');
  const close = () => setModal(null);
  const matches = Object.entries(ingredients).filter(([, v]) =>
    v.name.toLowerCase().includes(search.toLowerCase()),
  );
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (amount === '' || !Number.isFinite(Number(amount)) || Number(amount) < 0)
      return setError('Jumlah stok wajib diisi dan tidak boleh negatif.');
    if (ingredients[selected].unit === 'butir' && !Number.isInteger(Number(amount)))
      return setError('Jumlah telur harus berupa bilangan bulat dalam satuan butir.');
    setStock((s) => ({ ...s, [selected]: Number(amount) }));
    setChecked({});
    notify(`${ingredients[selected].name} berhasil ${id ? 'diperbarui' : 'disimpan'}.`);
    close();
  }
  return (
    <Dialog
      title={id ? 'Ubah stok bahan' : 'Tambah bahan dapur'}
      sub="Gunakan satuan yang tertera agar perhitungan tetap tepat."
      close={close}
    >
      <form onSubmit={submit} noValidate>
        {!id && (
          <label className="field">
            <span>Cari nama bahan</span>
            <input
              placeholder="Contoh: beras, telur, wortel"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                const match = Object.entries(ingredients).find(([, v]) =>
                  v.name.toLowerCase().includes(e.target.value.toLowerCase()),
                );
                if (match) {
                  setSelected(match[0]);
                  setAmount('');
                }
              }}
            />
          </label>
        )}
        <label className="field">
          <span>Bahan</span>
          <select
            value={selected}
            disabled={!!id}
            onChange={(e) => {
              setSelected(e.target.value);
              setAmount('');
            }}
          >
            {matches.map(([key, v]) => (
              <option key={key} value={key}>
                {v.name}
              </option>
            ))}
          </select>
          {!matches.length && (
            <small>Tidak ada bahan dalam katalog simulasi yang cocok. Coba kata kunci lain.</small>
          )}
        </label>
        <label className="field">
          <span>Jumlah tersedia ({ingredients[selected].unit})</span>
          <input
            type="number"
            min="0"
            step={ingredients[selected].unit === 'butir' ? '1' : 'any'}
            placeholder="Masukkan jumlah"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <small>
            {ingredients[selected].unit === 'g'
              ? 'Gunakan gram: 1 kg = 1.000 g.'
              : ingredients[selected].unit === 'ml'
                ? 'Gunakan mililiter: 1 liter = 1.000 ml.'
                : 'Gunakan jumlah butir utuh.'}
          </small>
        </label>
        {!id && stock[selected] !== undefined && (
          <Note>
            Bahan ini sudah tercatat sebanyak {qty(stock[selected], selected)}. Angka yang disimpan
            akan mengganti jumlah tersebut.
          </Note>
        )}
        {error && (
          <div className="field-error" role="alert">
            {error}
          </div>
        )}
        <div className="actions">
          <Btn variant="outline" onClick={close}>
            Batal
          </Btn>
          <button className="btn primary" type="submit" disabled={!matches.length}>
            <Check size={16} />
            Simpan Bahan
          </button>
        </div>
      </form>
    </Dialog>
  );
}
