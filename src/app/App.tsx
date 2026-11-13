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
import { isCatalog, installCatalog } from '@/features/planning/catalog';
import { api, getApiToken, setApiToken } from '@/shared/api';
import { read, write } from '@/shared/storage/storage';
import { isSession, isUser } from '@/shared/storage/validators';
import { FeedbackProvider, ModalProvider } from '@/shared/ui/FeedbackProvider';
import { Note } from '@/shared/ui/Note';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Router } from './Router';
import { go } from './navigation';

export function App() {
  const [demoUser, setDemoUser] = useState<User | null>(() => {
    if (getApiToken()) return null;
    const stored = read('session', null, isSession);
    return stored?.demo ? stored : null;
  });
  const [remoteUser, setRemoteUser] = useState<User | null>(null);
  const [revision, setRevision] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const [booting, setBooting] = useState(true);
  const [bootError, setBootError] = useState('');
  const user = demoUser ?? remoteUser;

  useEffect(() => {
    let active = true;
    async function initialize() {
      setBooting(true);
      setBootError('');
      try {
        const catalog: unknown = await api('/api/v1/catalog');
        if (!isCatalog(catalog)) throw new Error('Format katalog dari server tidak valid.');
        installCatalog(catalog);
        if (getApiToken()) {
          try {
            const account: unknown = await api('/api/auth/me');
            if (!isUser(account)) throw new Error('Data sesi server tidak valid.');
            if (active) {
              setRemoteUser(account);
              setDemoUser(null);
              write('session', null);
            }
          } catch (error) {
            if (getApiToken()) throw error;
            if (active) setRemoteUser(null);
          }
        }
        if (active) setBooting(false);
      } catch (error) {
        if (active) {
          setBootError(error instanceof Error ? error.message : 'Server belum tersedia.');
          setBooting(false);
        }
      }
    }
    void initialize();
    return () => {
      active = false;
    };
  }, [attempt]);

  const setUser: Dispatch<SetStateAction<User | null>> = (next) => {
    const value = typeof next === 'function' ? next(user) : next;
    if (value?.demo) {
      try {
        setApiToken(null);
      } catch {
        // Demo remains usable for this page even when session storage is blocked.
      }
      write('session', value);
      setDemoUser(value);
      setRemoteUser(null);
    } else {
      write('session', null);
      setDemoUser(null);
      setRemoteUser(value);
      if (!value) {
        try {
          setApiToken(null);
        } catch {
          // Logout still clears in-memory session when browser storage is unavailable.
        }
      }
    }
  };

  const demo = () => {
    const result = generate(defaultForm, demoStock, defaultPrefs);
    const email = 'demo@panganbantu.local';
    write(kitchenKey(email, 'stock'), demoStock);
    write(kitchenKey(email, 'prefs'), defaultPrefs);
    write(kitchenKey(email, 'plan'), result.plan ?? null);
    write(kitchenKey(email, 'checked'), {});
    setUser({ name: 'Sahabat Pangan', email, demo: true });
    setRevision((value) => value + 1);
    go('/dashboard');
  };

  if (booting) return <p className="loading" role="status">Memuat katalog dan sesi…</p>;
  if (bootError)
    return (
      <main className="public-surface">
        <Note warning>{bootError} Jalankan API dan coba lagi.</Note>
        <button className="btn primary" onClick={() => setAttempt((value) => value + 1)}>
          Coba lagi
        </button>
      </main>
    );

  return (
    <SessionContext value={{ user, setUser, demo }}>
      <FeedbackProvider>
        <KitchenProvider key={`${user?.email ?? 'guest'}:${revision}`}>
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
