/*
=============================
App
--> Menyusun provider sesi, dapur, dialog, dan perencanaan serta membuka data demo.
=============================
*/

import { SessionContext } from '@/features/auth/session';
import type { User } from '@/features/auth/types';
import { KitchenProvider } from '@/features/pantry/KitchenProvider';
import { kitchenKey } from '@/features/pantry/kitchen';
import { PlanningProvider } from '@/features/planning/PlanningProvider';
import { defaultForm, defaultPrefs, demoStock, generate } from '@/features/planning/model';
import { write } from '@/shared/storage/storage';
import { useSaved } from '@/shared/storage/useSaved';
import { isSession } from '@/shared/storage/validators';
import { FeedbackProvider, ModalProvider } from '@/shared/ui/FeedbackProvider';
import { Note } from '@/shared/ui/Note';
import { useState } from 'react';
import { Router } from './Router';
import { go } from './navigation';

export function App() {
  const session = useSaved<User | null>('session', null, isSession);
  const [revision, setRevision] = useState(0);
  const demo = () => {
    const result = generate(defaultForm, demoStock, defaultPrefs);
    const email = 'demo@panganbantu.local';
    write(kitchenKey(email, 'stock'), demoStock);
    write(kitchenKey(email, 'prefs'), defaultPrefs);
    write(kitchenKey(email, 'plan'), result.plan ?? null);
    write(kitchenKey(email, 'checked'), {});
    session.setValue({ name: 'Sahabat Pangan', email, demo: true });
    setRevision((value) => value + 1);
    go('/dashboard');
  };
  return (
    <SessionContext value={{ user: session.value, setUser: session.setValue, demo }}>
      <FeedbackProvider>
        {session.saveFailed && (
          <Note warning>
            Sesi belum dapat disimpan di peramban. Aktifkan penyimpanan agar sesi tersedia setelah
            halaman dimuat ulang.
          </Note>
        )}
        <KitchenProvider key={`${session.value?.email ?? 'guest'}:${revision}`}>
          <ModalProvider>
            <PlanningProvider>
              <Router />
            </PlanningProvider>
          </ModalProvider>
        </KitchenProvider>
      </FeedbackProvider>
    </SessionContext>
  );
}
