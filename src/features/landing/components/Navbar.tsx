/*
=============================
Navbar
--> Navigasi beranda, pengumuman, menu ponsel, dan akses masuk atau daftar.
=============================
*/

import { useSession } from '@/features/auth/session';
import { Btn } from '@/shared/ui/Btn';
import { Logo } from '@/shared/ui/Logo';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(true);
  const { user } = useSession();
  return (
    <div>
      {announcement && (
        <div className="announcement">
          Dari dapur yang terencana, untuk hari yang lebih tenang.{' '}
          <a href="#/daftar">Mulai bersama PanganBantu ↗</a>
          <button aria-label="Tutup pengumuman" onClick={() => setAnnouncement(false)}>
            <X size={16} />
          </button>
        </div>
      )}
      <header className="container public-nav">
        <Logo />
        <button
          className="mobile-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Buka navigasi"
          aria-expanded={open}
          aria-controls="public-navigation"
        >
          <Menu size={21} />
        </button>
        <nav
          id="public-navigation"
          aria-label="Navigasi utama"
          className={'navlinks ' + (open ? 'open' : '')}
        >
          <a className="active" href="#/" onClick={() => setOpen(false)}>
            Beranda
          </a>
          <a
            href="#cara-kerja"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' });
              setOpen(false);
            }}
          >
            Cara Kerja
          </a>
          <a href={user ? '#/dashboard' : '#/masuk'}>{user ? 'Dasbor' : 'Masuk'}</a>
          <Btn to={user ? '/buat-rencana' : '/daftar'} variant="outline">
            {user ? 'Buat Rencana' : 'Daftar Gratis'}
            <ArrowUpRight size={15} />
          </Btn>
        </nav>
      </header>
    </div>
  );
}
