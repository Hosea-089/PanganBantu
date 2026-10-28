/*
=============================
WorkspaceFooter
--> Identitas PanganBantu serta tautan stok, preferensi, dan beranda.
=============================
*/

import { Logo } from '@/shared/ui/Logo';
import { ArrowUpRight } from 'lucide-react';

export function WorkspaceFooter() {
  return (
    <footer className="workspace-footer">
      <div className="workspace-footer-brand">
        <Logo />
        <p>
          Dari rencana, jadi hidangan.
          <br />
          Teman untuk dapur yang lebih terencana.
        </p>
      </div>
      <nav aria-label="Navigasi footer">
        <a href="#/stok">
          Kelola stok
          <ArrowUpRight size={16} />
        </a>
        <a href="#/preferensi">
          Selera & alergi
          <ArrowUpRight size={16} />
        </a>
        <a href="#/">
          Kembali ke beranda
          <ArrowUpRight size={16} />
        </a>
      </nav>
      <div className="workspace-footer-bottom">
        <span>© {new Date().getFullYear()} PanganBantu</span>
        <span>Prototipe interaktif · Data simulasi</span>
      </div>
    </footer>
  );
}
