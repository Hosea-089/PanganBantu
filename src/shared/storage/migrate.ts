/*
=============================
migrate
--> Migrasi dapur format lama tanpa menimpa data akun yang sudah dipisahkan.
=============================
*/

import { kitchenKey } from '@/features/pantry/kitchen';
import { defaultPrefs } from '@/features/planning/model';
import { read, write } from './storage';
import { isChecks, isPrefs, isSavedPlan, isSession, isStock } from './validators';

// Hanya sesi lama yang aktif memiliki data global lama. Akun lain mulai dengan dapur kosong.
export function migrateLegacyKitchen() {
  const done = read('scoped-storage-v1', false, (v): v is boolean => typeof v === 'boolean');
  if (done) return;
  const user = read('session', null, isSession);
  if (!user) {
    write('scoped-storage-v1', true);
    return;
  }
  const values = {
    stock: read('stock', {}, isStock),
    prefs: read('prefs', defaultPrefs, isPrefs),
    plan: read('plan', null, isSavedPlan),
    checked: read('checked', {}, isChecks),
  };
  const saved = Object.entries(values).map(([key, value]) => {
    const scoped = kitchenKey(user.email, key);
    try {
      if (localStorage.getItem(`pb-${scoped}`) !== null) return true;
    } catch {
      return false;
    }
    return write(scoped, value);
  });
  if (saved.every(Boolean)) write('scoped-storage-v1', true);
}
