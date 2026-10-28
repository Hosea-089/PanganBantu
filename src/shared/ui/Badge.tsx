/*
=============================
Badge
--> Label status singkat dengan variasi warna.
=============================
*/

import type { ReactNode } from 'react';

export function Badge({ children, color = '' }: { children: ReactNode; color?: string }) {
  return <span className={'badge ' + color}>{children}</span>;
}
