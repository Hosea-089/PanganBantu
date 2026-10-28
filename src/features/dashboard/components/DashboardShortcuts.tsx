/*
=============================
DashboardShortcuts
--> Pintasan menuju rencana, stok, preferensi, dan belanja.
=============================
*/

import { usePlanning } from '@/features/planning/planning';
import { ArrowUpRight, CalendarDays, Heart, Package, ShoppingBasket } from 'lucide-react';

export function DashboardShortcuts() {
  const { startPlan } = usePlanning();
  const shortcuts = [
    {
      to: '/buat-rencana',
      icon: CalendarDays,
      title: 'Rencana baru',
      body: 'Tentukan hari, porsi, dan anggaran.',
      action: 'Mulai',
      onClick: startPlan,
    },
    {
      to: '/stok',
      icon: Package,
      title: 'Stok dapur',
      body: 'Catat dan perbarui bahan yang tersedia.',
      action: 'Kelola stok',
    },
    {
      to: '/preferensi',
      icon: Heart,
      title: 'Selera & alergi',
      body: 'Sesuaikan menu dengan kebutuhan Anda.',
      action: 'Atur preferensi',
    },
    {
      to: '/belanja',
      icon: ShoppingBasket,
      title: 'Daftar belanja',
      body: 'Cek bahan yang masih perlu dibeli.',
      action: 'Lihat daftar',
    },
  ];
  return (
    <section className="dashboard-tools content-section">
      <div className="section-title section-title-centered">
        <div>
          <span className="section-overline">SETIAP HARI LEBIH TERENCANA</span>
          <h2>
            Apa yang ingin Anda <strong>siapkan hari ini?</strong>
          </h2>
          <p className="section-description">
            Semua kebutuhan dapur, dari bahan yang ada hingga menu di meja.
          </p>
        </div>
      </div>
      <div className="shortcut-grid">
        {shortcuts.map(({ to, icon: Icon, title, body, action, onClick }, i) => (
          <a
            key={to}
            className="shortcut-card"
            href={'#' + to}
            onClick={
              onClick
                ? (e) => {
                    e.preventDefault();
                    onClick();
                  }
                : undefined
            }
          >
            <span className="shortcut-icon">
              <Icon size={24} strokeWidth={1.5} />
            </span>
            <span className="shortcut-index">0{i + 1}</span>
            <h3>{title}</h3>
            <p>{body}</p>
            <span className="shortcut-action">
              {action}
              <span>
                <ArrowUpRight size={15} />
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
