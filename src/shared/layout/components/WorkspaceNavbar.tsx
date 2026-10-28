/*
=============================
WorkspaceNavbar
--> Navigasi aplikasi, informasi akun, tombol rencana baru, dan keluar.
=============================
*/

import { go } from '@/app/navigation';
import { useMember } from '@/features/auth/session';
import { usePlanning } from '@/features/planning/planning';
import { navItems } from '@/shared/layout/navigation';
import { Btn } from '@/shared/ui/Btn';
import { useFeedback } from '@/shared/ui/feedback';
import { Logo } from '@/shared/ui/Logo';
import { ArrowUpRight, LogOut, Menu, User, X } from 'lucide-react';
import { useState } from 'react';

export function WorkspaceNavbar({ route }: { route: string }) {
  const { user, setUser } = useMember();
  const { startPlan } = usePlanning();
  const { notify } = useFeedback();
  const [openRoute, setOpenRoute] = useState<string | null>(null);
  const open = openRoute === route;
  const setOpen = (value: boolean) => setOpenRoute(value ? route : null);

  const logout = () => {
    setUser(null);
    go('/masuk');
    notify('Anda sudah keluar dari akun simulasi.');
  };
  return (
    <header className="workspace-header">
      <div className="workspace-brand-row">
        <Logo />
        <button
          className="workspace-menu-toggle"
          aria-label={open ? 'Tutup navigasi aplikasi' : 'Buka navigasi aplikasi'}
          aria-expanded={open}
          aria-controls="workspace-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <div className="workspace-account">
          <a href="#/profil" className="workspace-profile" aria-label="Buka profil">
            <User size={20} strokeWidth={1.5} />
            <span>
              <strong>{user.name.split(' ')[0]}</strong>
              <small>Akun {user.demo ? 'demo' : 'simulasi'}</small>
            </span>
          </a>
          <Btn variant="outline" onClick={startPlan}>
            Buat Rencana
            <ArrowUpRight size={16} />
          </Btn>
          <button className="workspace-logout" aria-label="Keluar dari akun" onClick={logout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
      <nav
        id="workspace-navigation"
        className={'workspace-navigation ' + (open ? 'open' : '')}
        aria-label="Navigasi dapur"
      >
        {navItems.map(([path, label, Icon]) => (
          <a
            key={path}
            href={'#' + path}
            className={route === path ? 'selected' : ''}
            aria-current={route === path ? 'page' : undefined}
            onClick={(e) => {
              if (path === '/buat-rencana') {
                e.preventDefault();
                startPlan();
              }
              setOpen(false);
            }}
          >
            <Icon size={16} />
            <span>{label}</span>
          </a>
        ))}
        <button className="mobile-logout" onClick={logout}>
          <LogOut size={16} />
          Keluar dari akun
        </button>
      </nav>
    </header>
  );
}
