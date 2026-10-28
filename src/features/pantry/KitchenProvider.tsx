/*
=============================
KitchenProvider
--> Menyimpan stok, preferensi, rencana, dan centang belanja dalam lingkup akun.
=============================
*/

import { useSession } from '@/features/auth/session';
import { defaultForm, defaultPrefs, demoStock, generate } from '@/features/planning/model';
import type { Plan, ShoppingChecks, Stock } from '@/features/planning/types';
import { useSaved } from '@/shared/storage/useSaved';
import { isChecks, isPrefs, isSavedPlan, isStock } from '@/shared/storage/validators';
import { Note } from '@/shared/ui/Note';
import type { ReactNode } from 'react';
import { KitchenContext, kitchenKey } from './kitchen';

export function KitchenProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const key = (name: string) => kitchenKey(user?.email ?? 'guest', name);
  const stock = useSaved<Stock>(key('stock'), user?.demo ? demoStock : {}, isStock);
  const prefs = useSaved(key('prefs'), defaultPrefs, isPrefs);
  const plan = useSaved<Plan | null>(
    key('plan'),
    () => (user?.demo ? (generate(defaultForm, demoStock, defaultPrefs).plan ?? null) : null),
    isSavedPlan,
  );
  const checked = useSaved<ShoppingChecks>(key('checked'), {}, isChecks);
  const failed = stock.saveFailed || prefs.saveFailed || plan.saveFailed || checked.saveFailed;
  return (
    <KitchenContext
      value={{
        stock: stock.value,
        setStock: stock.setValue,
        prefs: prefs.value,
        setPrefs: prefs.setValue,
        plan: plan.value,
        setPlan: plan.setValue,
        checked: checked.value,
        setChecked: checked.setValue,
      }}
    >
      {failed && (
        <Note warning>
          Perubahan belum tersimpan di peramban. Data masih tersedia selama halaman ini terbuka.
          Periksa izin atau ruang penyimpanan sebelum memuat ulang.
        </Note>
      )}
      {children}
    </KitchenContext>
  );
}
