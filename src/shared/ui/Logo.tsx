/*
=============================
Logo
--> Identitas dan tautan beranda PanganBantu.
=============================
*/

import { Sprout } from 'lucide-react';

export function Logo() {
  return (
    <a className="logo" href="#/">
      <span className="logo-icon">
        <Sprout size={24} />
      </span>
      <span>
        pangan<em>bantu</em>
        <span className="logo-period">.</span>
      </span>
    </a>
  );
}
