/*
=============================
Shell
--> Kerangka halaman aplikasi, navigasi, breadcrumb, area utama, dan footer.
=============================
*/

import { useKitchen } from '@/features/pantry/kitchen';
import { WorkspaceBreadcrumb } from '@/shared/layout/WorkspaceBreadcrumb';
import type { ReactNode } from 'react';
import { WorkspaceFooter } from './components/WorkspaceFooter';
import { WorkspaceNavbar } from './components/WorkspaceNavbar';

import { navItems } from './navigation';

export function Shell({ route, children }: { route: string; children: ReactNode }) {
  const { plan } = useKitchen();
  const currentLabel = navItems.find(([path]) => path === route)?.[1] || 'Rencana Makan';
  const hasCarouselHeader =
    ['/stok', '/preferensi', '/belanja', '/profil'].includes(route) ||
    (route === '/rencana' && !!plan);

  return (
    <div className="app-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Lewati navigasi
      </a>
      <WorkspaceNavbar route={route} />
      {!hasCarouselHeader && <WorkspaceBreadcrumb currentLabel={currentLabel} />}
      <div className="app-main">
        <main
          id="main-content"
          tabIndex={-1}
          className={
            'page page-' + route.slice(1) + (hasCarouselHeader ? ' page-fullwidth-header' : '')
          }
        >
          {children}
        </main>
      </div>
      <WorkspaceFooter />
    </div>
  );
}
