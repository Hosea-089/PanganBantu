/*
=============================
Stat
--> Satu nilai statistik beserta judul, ikon, dan keterangan.
=============================
*/

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

export function Stat({
  title,
  value,
  sub,
  icon: Icon,
  blue = false,
}: {
  title: string;
  value: ReactNode;
  sub?: string;
  icon: LucideIcon;
  blue?: boolean;
}) {
  return (
    <div className={'stat ' + (blue ? 'blue' : '')}>
      <div className="stat-top">
        {title}
        <Icon size={20} />
      </div>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}
