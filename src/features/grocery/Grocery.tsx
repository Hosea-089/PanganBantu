/*
=============================
Grocery
--> Filter dan status pembelian, ringkasan biaya, serta kelompok daftar belanja.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { calculate, dateRange, ingredients, range, rupiah } from '@/features/planning/model';
import { usePlanning } from '@/features/planning/planning';
import { PageHeader } from '@/shared/layout/PageHeader';
import { WorkspaceBreadcrumb } from '@/shared/layout/WorkspaceBreadcrumb';
import { planHeaderImages } from '@/shared/layout/headerImages';
import { Btn } from '@/shared/ui/Btn';
import { Empty } from '@/shared/ui/Empty';
import { Note } from '@/shared/ui/Note';
import { SourceNote } from '@/shared/ui/SourceNote';
import { useFeedback } from '@/shared/ui/feedback';
import { ArrowLeft, ArrowRight, CheckCircle2, Printer, ShoppingBasket } from 'lucide-react';
import { useState } from 'react';
import { ShoppingSummary } from './components/ShoppingSummary';
import { ShoppingTable } from './components/ShoppingTable';

export function Grocery() {
  const { plan, stock, checked, setChecked } = useKitchen();
  const { startPlan } = usePlanning();
  const { notify } = useFeedback();
  const [filter, setFilter] = useState('Semua');
  if (!plan)
    return (
      <>
        <PageHeader
          title="Daftar Belanja"
          breadcrumb={<WorkspaceBreadcrumb currentLabel="Daftar Belanja" />}
          sub="Belanja secukupnya, masak sepenuh hati."
          backgroundImages={planHeaderImages(plan)}
        />
        <Empty
          title="Daftar belanja belum tersedia"
          sub="Buat rencana makan terlebih dahulu. Daftar bahan yang perlu dibeli akan tersusun otomatis."
          icon={ShoppingBasket}
        >
          <Btn onClick={startPlan}>
            Buat Rencana Makan
            <ArrowRight size={16} />
          </Btn>
        </Empty>
      </>
    );
  const c = calculate(plan, stock),
    buyLines = c.lines.filter((l) => l.buy > 0),
    done = buyLines.filter((l) => checked[l.id]).length,
    remaining = buyLines.filter((l) => !checked[l.id]);
  const toggle = (id: string) => {
    const next = !checked[id];
    setChecked({ ...checked, [id]: next });
    notify(
      next
        ? ingredients[id].name + ' ditandai sudah dibeli.'
        : 'Tanda pembelian ' + ingredients[id].name + ' dibatalkan.',
    );
  };
  return (
    <>
      <PageHeader
        eyebrow="BELANJA SECUKUPNYA, MASAK SEPENUH HATI"
        title="Daftar Belanja"
        breadcrumb={<WorkspaceBreadcrumb currentLabel="Daftar Belanja" />}
        sub={`${dateRange(plan)} · ${plan.people} orang · ${plan.days * 3} hidangan`}
        backgroundImages={planHeaderImages(plan)}
      >
        <div className="actions">
          <Btn variant="outline" onClick={() => window.print()}>
            <Printer size={15} />
            Cetak Daftar
          </Btn>
          <Btn to="/rencana" variant="outline">
            <ArrowLeft size={15} />
            Lihat Rencana
          </Btn>
        </div>
      </PageHeader>
      <ShoppingSummary plan={plan} calc={c} />
      {c.max > plan.budget && (
        <Note warning>
          Estimasi batas atas melebihi anggaran {rupiah(c.max - plan.budget)}. Daftar ini belum
          sesuai anggaran {rupiah(plan.budget)}.
        </Note>
      )}
      <Note>
        <strong>Jumlah dibeli = Maks(0, Jumlah dibutuhkan - Stok tersedia)</strong>
        <p>
          Stok yang ditampilkan adalah bagian yang digunakan untuk rencana ini. Jika stok lebih
          banyak, sisa stok tetap tersedia di dapur.
        </p>
      </Note>
      <div className="toolbar">
        <div>
          <strong style={{ fontSize: 13 }}>
            {done} dari {buyLines.length} bahan ditandai dibeli
          </strong>
          <p className="remaining">
            Belum ditandai:{' '}
            {range(
              remaining.reduce((n, l) => n + l.min, 0),
              remaining.reduce((n, l) => n + l.max, 0),
            )}
          </p>
        </div>
        <div className="filter-tabs" style={{ margin: 0 }}>
          {['Semua', 'Belum dibeli'].map((f) => (
            <button key={f} className={filter === f ? 'selected' : ''} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
        </div>
      </div>
      {buyLines.length > 0 && done === buyLines.length && (
        <Note success>
          Semua bahan belanja telah ditandai. Daftar siap dipakai untuk memasak. Tanda pembelian
          hanya simulasi dan tidak menambah stok otomatis.
        </Note>
      )}
      {['Sayuran', 'Protein', 'Bahan Pokok', 'Bumbu'].map((category) => {
        const lines = c.lines.filter(
          (l) =>
            ingredients[l.id].category === category &&
            (filter === 'Semua' || (l.buy > 0 && !checked[l.id])),
        );
        return lines.length ? (
          <section className="shopping-group" key={category}>
            <h3>
              {category}{' '}
              <small style={{ fontWeight: 400, marginLeft: 8 }}>{lines.length} bahan</small>
            </h3>
            <ShoppingTable lines={lines} checked={checked} toggle={toggle} category={category} />
          </section>
        ) : null;
      })}
      {filter === 'Belum dibeli' && !remaining.length && (
        <Empty
          title="Daftar sudah beres!"
          sub="Tidak ada lagi bahan yang belum ditandai untuk dibeli."
          icon={CheckCircle2}
        >
          <Btn variant="outline" onClick={() => setFilter('Semua')}>
            Tampilkan semua bahan
          </Btn>
        </Empty>
      )}
      <Note>
        Tanda centang adalah interaksi simulasi. Total estimasi kebutuhan tetap sama meski bahan
        sudah ditandai. Stok dapat diperbarui secara terpisah melalui halaman Stok Bahan.
      </Note>
      <SourceNote />
    </>
  );
}
