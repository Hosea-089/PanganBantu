/*
=============================
PublicFooter
--> Logo, hak cipta, dan informasi simulasi pada beranda.
=============================
*/

import { Logo } from '@/shared/ui/Logo';

export function PublicFooter() {
  return (
    <footer className="public-footer">
      <Logo />
      <span>© 2026 PanganBantu. Dari rencana, jadi hidangan.</span>
      <span>Prototipe interaktif · Data simulasi</span>
    </footer>
  );
}
