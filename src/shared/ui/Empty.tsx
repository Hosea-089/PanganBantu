/*
=============================
Empty
--> Keadaan kosong dengan ikon, penjelasan, dan tindakan lanjutan.
=============================
*/

import type { LucideIcon } from 'lucide-react';
import { CalendarDays } from 'lucide-react';
import type { ReactNode } from 'react';

export function Empty({
  title,
  sub,
  icon: Icon = CalendarDays,
  children,
}: {
  title: string;
  sub: string;
  icon?: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={29} />
      </div>
      <h2>{title}</h2>
      <p>{sub}</p>
      <div className="actions">{children}</div>
    </div>
  );
}
