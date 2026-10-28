/*
=============================
kitchen
--> Kontrak state dapur serta pembentukan kunci penyimpanan per akun.
=============================
*/

import type { Plan, Preferences, ShoppingChecks, Stock } from '@/features/planning/types';
import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext } from 'react';

export interface KitchenState {
  stock: Stock;
  setStock: Dispatch<SetStateAction<Stock>>;
  prefs: Preferences;
  setPrefs: Dispatch<SetStateAction<Preferences>>;
  plan: Plan | null;
  setPlan: Dispatch<SetStateAction<Plan | null>>;
  checked: ShoppingChecks;
  setChecked: Dispatch<SetStateAction<ShoppingChecks>>;
}
export const KitchenContext = createContext<KitchenState | null>(null);
export function kitchenKey(email: string, name: string) {
  return `kitchen:${encodeURIComponent(email.toLowerCase())}:${name}`;
}
export function useKitchen() {
  const state = useContext(KitchenContext);
  if (!state) throw new Error('KitchenProvider diperlukan.');
  return state;
}
