/*
=============================
Note
--> Kotak informasi, peringatan, atau konfirmasi keberhasilan.
=============================
*/

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { ReactNode } from 'react';

export function Note({
  children,
  warning = false,
  success = false,
}: {
  children: ReactNode;
  warning?: boolean;
  success?: boolean;
}) {
  return (
    <div className={'info-box ' + (warning ? 'warning' : '') + (success ? ' success-box' : '')}>
      {warning ? (
        <AlertTriangle size={18} />
      ) : success ? (
        <CheckCircle2 size={18} />
      ) : (
        <Info size={18} />
      )}
      <div>{children}</div>
    </div>
  );
}
