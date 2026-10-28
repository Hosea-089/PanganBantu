/*
=============================
WorkspaceBreadcrumb
--> Jejak halaman dan tanggal saat ini dalam zona Asia/Jakarta.
=============================
*/

import { Badge } from '@/shared/ui/Badge';
import { CalendarDays, ChevronRight, LayoutDashboard } from 'lucide-react';

export function WorkspaceBreadcrumb({ currentLabel }: { currentLabel: string }) {
  return (
    <div className="workspace-breadcrumb">
      <div>
        <a href="#/dashboard">
          <LayoutDashboard size={13} />
          Dapur Saya
        </a>
        <ChevronRight size={12} />
        <span>{currentLabel}</span>
      </div>
      <span className="workspace-date">
        <CalendarDays size={13} />
        {new Date().toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'Asia/Jakarta',
        })}
        <Badge>Simulasi</Badge>
      </span>
    </div>
  );
}
