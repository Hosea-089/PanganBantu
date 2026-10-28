/*
=============================
PantryPreview
--> Enam bahan pertama di dapur dan tautan pengelolaan stok.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { ingredients, qty } from '@/features/planning/model';
import { Btn } from '@/shared/ui/Btn';
import { Empty } from '@/shared/ui/Empty';
import { ArrowUpRight, Package, Plus } from 'lucide-react';

export function PantryPreview() {
  const { stock } = useKitchen();
  const stockEntries = Object.entries(stock);
  return (
    <section className="dashboard-pantry content-section">
      <div className="section-title">
        <h2>Bahan yang tersedia</h2>
        <a className="text-link" href="#/stok">
          Semua stok
          <ArrowUpRight size={16} />
        </a>
      </div>
      {stockEntries.length ? (
        <div className="pantry-preview">
          {stockEntries.slice(0, 6).map(([id, q]) => (
            <a href="#/stok" className="pantry-chip" key={id}>
              <span>{ingredients[id].icon}</span>
              <div>
                {ingredients[id].name}
                <small>{qty(q, id)} tersedia</small>
              </div>
              <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      ) : (
        <Empty
          title="Dapur Anda siap diisi"
          sub="Catat bahan yang sudah ada di rumah. Kami bantu memanfaatkannya sebelum belanja lagi."
          icon={Package}
        >
          <Btn to="/stok">
            <Plus size={16} />
            Tambah Bahan Pertama
          </Btn>
        </Empty>
      )}
    </section>
  );
}
