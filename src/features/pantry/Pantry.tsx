/*
=============================
Pantry
--> Daftar stok dengan pencarian, filter kategori, serta tindakan ubah dan hapus.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { ingredients, qty } from '@/features/planning/model';
import { PageHeader } from '@/shared/layout/PageHeader';
import { WorkspaceBreadcrumb } from '@/shared/layout/WorkspaceBreadcrumb';
import { planHeaderImages } from '@/shared/layout/headerImages';
import { Badge } from '@/shared/ui/Badge';
import { Btn } from '@/shared/ui/Btn';
import { Empty } from '@/shared/ui/Empty';
import { Note } from '@/shared/ui/Note';
import { SourceNote } from '@/shared/ui/SourceNote';
import { useFeedback } from '@/shared/ui/feedback';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function Pantry({ embedded = false }: { embedded?: boolean }) {
  const { stock, plan } = useKitchen();
  const { setModal } = useFeedback();
  const [search, setSearch] = useState(''),
    [category, setCategory] = useState('Semua');
  const entries = Object.entries(stock).filter(
    ([id]) =>
      ingredients[id].name.toLowerCase().includes(search.toLowerCase()) &&
      (category === 'Semua' || ingredients[id].category === category),
  );
  return (
    <>
      {!embedded && (
        <PageHeader
          eyebrow="KENALI ISI DAPUR ANDA"
          title="Stok Bahan Dapur"
          breadcrumb={<WorkspaceBreadcrumb currentLabel="Stok Bahan" />}
          sub="Catat yang tersedia, manfaatkan sebelum belanja lagi."
          backgroundImages={planHeaderImages(plan)}
        >
          <Btn onClick={() => setModal({ type: 'stock' })}>
            <Plus size={17} />
            Tambah Bahan
          </Btn>
        </PageHeader>
      )}
      <div className="toolbar">
        <div className="searchbox">
          <Search size={17} />
          <input
            className="search-input"
            aria-label="Cari stok bahan"
            placeholder="Cari bahan di dapur…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {embedded ? (
          <Btn variant="outline" onClick={() => setModal({ type: 'stock' })}>
            <Plus size={15} />
            Tambah Bahan
          </Btn>
        ) : (
          <Badge color="green">{Object.keys(stock).length} jenis bahan</Badge>
        )}
      </div>
      {!embedded && (
        <div className="filter-tabs">
          {['Semua', 'Sayuran', 'Protein', 'Bahan Pokok', 'Bumbu'].map((c) => (
            <button
              className={category === c ? 'selected' : ''}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {entries.length ? (
        <div className="inventory-list">
          {entries.map(([id, q]) => (
            <div className="inventory-item" key={id}>
              <span className="ingredient-icon">{ingredients[id].icon}</span>
              <div>
                <h3>{ingredients[id].name}</h3>
                <small>
                  {qty(q, id)} <span className="muted">tersedia</span>
                </small>
              </div>
              <div className="item-actions">
                <button
                  aria-label={'Ubah ' + ingredients[id].name}
                  onClick={() => setModal({ type: 'stock', id })}
                >
                  <Pencil size={15} />
                </button>
                <button
                  aria-label={'Hapus ' + ingredients[id].name}
                  onClick={() => setModal({ type: 'delete', id })}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : Object.keys(stock).length ? (
        <Empty
          title="Bahan belum ditemukan"
          sub="Coba kata kunci atau kategori lain."
          icon={Search}
        >
          <Btn
            variant="outline"
            onClick={() => {
              setSearch('');
              setCategory('Semua');
            }}
          >
            Tampilkan semua stok
          </Btn>
        </Empty>
      ) : (
        <Empty
          title="Dapur Anda siap diisi"
          sub="Ada beras, telur, atau sayuran di rumah? Catat di sini supaya tidak perlu dibeli lagi."
          icon={Package}
        >
          <Btn onClick={() => setModal({ type: 'stock' })}>
            <Plus size={16} />
            Tambah Bahan Pertama
          </Btn>
        </Empty>
      )}
      <Note>
        Stok dialokasikan berurutan dari hari pertama: sarapan, makan siang, lalu makan malam.
        Perubahan stok langsung memperbarui estimasi rencana aktif. Bahan tidak otomatis dihapus
        setelah memasak.
      </Note>
      {!embedded && <SourceNote />}
    </>
  );
}
