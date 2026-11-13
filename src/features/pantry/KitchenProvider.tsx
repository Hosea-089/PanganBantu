/*
=============================
KitchenProvider
--> Menyimpan dapur demo lokal dan dapur akun di backend per pengguna.
=============================
*/

import { useSession } from '@/features/auth/session';
import { api } from '@/shared/api';
import { defaultForm, defaultPrefs, demoStock, generate } from '@/features/planning/model';
import type { Plan, Preferences, ShoppingChecks, Stock } from '@/features/planning/types';
import { useSaved } from '@/shared/storage/useSaved';
import { isChecks, isPrefs, isSavedPlan, isStock } from '@/shared/storage/validators';
import { isRecord } from '@/shared/typeguards';
import { Note } from '@/shared/ui/Note';
import { useEffect, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import { KitchenContext, kitchenKey } from './kitchen';

interface KitchenData {
  stock: Stock;
  prefs: Preferences;
  plan: Plan | null;
  checked: ShoppingChecks;
}

const emptyKitchen = (): KitchenData => ({ stock: {}, prefs: defaultPrefs, plan: null, checked: {} });

function isKitchenData(value: unknown): value is KitchenData {
  return (
    isRecord(value) &&
    isStock(value.stock) &&
    isPrefs(value.prefs) &&
    isSavedPlan(value.plan) &&
    isChecks(value.checked)
  );
}

function LocalKitchenProvider({ user, children }: { user: { email: string; demo?: boolean } | null; children: ReactNode }) {
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
          Perubahan demo belum tersimpan di peramban. Data masih tersedia selama halaman ini terbuka.
          Periksa izin atau ruang penyimpanan sebelum memuat ulang.
        </Note>
      )}
      {children}
    </KitchenContext>
  );
}

function RemoteKitchenProvider({ children }: { children: ReactNode }) {
  const [kitchen, setKitchen] = useState<KitchenData>(emptyKitchen);
  const current = useRef(kitchen);
  const writes = useRef(Promise.resolve());
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [saveFailed, setSaveFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    async function load() {
      setStatus('loading');
      try {
        const value: unknown = await api('/api/v1/me/kitchen');
        if (!isKitchenData(value)) throw new Error('Data dapur dari server tidak valid.');
        if (active) {
          current.current = value;
          setKitchen(value);
          setStatus('ready');
        }
      } catch {
        if (active) setStatus('error');
      }
    }
    void load();
    return () => {
      active = false;
      mounted.current = false;
    };
  }, [attempt]);

  const save = (value: KitchenData) => {
    writes.current = writes.current
      .catch(() => undefined)
      .then(() => api('/api/v1/me/kitchen', { method: 'PUT', body: value }))
      .then(() => {
        if (mounted.current) setSaveFailed(false);
      })
      .catch(() => {
        if (mounted.current) setSaveFailed(true);
      });
  };

  const update = <K extends keyof KitchenData>(field: K): Dispatch<SetStateAction<KitchenData[K]>> =>
    (next) => {
      const previous = current.current[field];
      const value = typeof next === 'function'
        ? (next as (value: KitchenData[K]) => KitchenData[K])(previous)
        : next;
      const updated = { ...current.current, [field]: value };
      current.current = updated;
      setKitchen(updated);
      save(updated);
    };

  if (status === 'loading') return <p className="loading" role="status">Memuat dapur akun…</p>;
  if (status === 'error')
    return (
      <Note warning>
        Data dapur belum dapat dimuat. Periksa koneksi backend lalu{' '}
        <button className="text-link" onClick={() => setAttempt((value) => value + 1)}>coba lagi</button>.
      </Note>
    );

  return (
    <KitchenContext
      value={{
        stock: kitchen.stock,
        setStock: update('stock'),
        prefs: kitchen.prefs,
        setPrefs: update('prefs'),
        plan: kitchen.plan,
        setPlan: update('plan'),
        checked: kitchen.checked,
        setChecked: update('checked'),
      }}
    >
      {saveFailed && <Note warning>Perubahan dapur belum tersimpan di server. Coba ubah kembali setelah koneksi pulih.</Note>}
      {children}
    </KitchenContext>
  );
}

export function KitchenProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  return user && !user.demo ? (
    <RemoteKitchenProvider key={user.email}>{children}</RemoteKitchenProvider>
  ) : (
    <LocalKitchenProvider user={user} key={user?.email ?? 'guest'}>
      {children}
    </LocalKitchenProvider>
  );
}
