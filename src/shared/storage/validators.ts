/*
=============================
validators
--> Validasi data eksternal dari penyimpanan dan isian perencanaan.
=============================
*/

import type { Account, User } from '@/features/auth/types';
import { ingredients, recipes } from '@/features/planning/catalog';
import type { Plan, PlanForm, Preferences, ShoppingChecks, Stock } from '@/features/planning/types';

export const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const knownIngredient = (id: string) => Object.hasOwn(ingredients, id);
const finiteNonnegative = (v: unknown): v is number =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === 'string');

export function isUser(v: unknown): v is User {
  return (
    isRecord(v) &&
    typeof v.name === 'string' &&
    v.name.trim().length > 0 &&
    v.name.length <= 30 &&
    typeof v.email === 'string' &&
    v.email.length > 0 &&
    (v.demo === undefined || typeof v.demo === 'boolean')
  );
}

export function isSession(v: unknown): v is User | null {
  return v === null || isUser(v);
}

export function isAccounts(v: unknown): v is Account[] {
  return (
    Array.isArray(v) &&
    v.every(
      (a) =>
        isUser(a) &&
        isRecord(a) &&
        typeof a.digest === 'string' &&
        /^[a-f0-9]{64}$/.test(a.digest) &&
        (a.salt === undefined || (typeof a.salt === 'string' && /^[a-f0-9]{32}$/.test(a.salt))),
    )
  );
}

export function isStock(v: unknown): v is Stock {
  return (
    isRecord(v) &&
    Object.entries(v).every(
      ([id, q]) =>
        knownIngredient(id) &&
        finiteNonnegative(q) &&
        (ingredients[id].unit !== 'butir' || Number.isInteger(q)),
    )
  );
}

export function isPrefs(v: unknown): v is Preferences {
  if (!isRecord(v)) return false;
  return (
    strings(v.liked) &&
    v.liked.every(knownIngredient) &&
    strings(v.avoided) &&
    v.avoided.every(knownIngredient) &&
    strings(v.allergies) &&
    v.allergies.every((a) =>
      ['Telur', 'Kedelai', 'Gluten', 'Susu', 'Kacang tanah', 'Ikan', 'Kerang'].includes(a),
    ) &&
    ['Bebas', 'Vegetarian', 'Vegan'].includes(String(v.diet))
  );
}

export function isPlanForm(v: unknown): v is PlanForm {
  if (!isRecord(v)) return false;
  const date =
    typeof v.start === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v.start)
      ? new Date(`${v.start}T12:00:00Z`)
      : null;
  return (
    ['Individu', 'Keluarga'].includes(String(v.mode)) &&
    finiteNonnegative(v.people) &&
    Number.isSafeInteger(v.people) &&
    v.people >= 1 &&
    v.people <= 100 &&
    (v.mode !== 'Individu' || v.people === 1) &&
    finiteNonnegative(v.days) &&
    Number.isInteger(v.days) &&
    v.days >= 1 &&
    v.days <= 7 &&
    finiteNonnegative(v.budget) &&
    v.budget > 0 &&
    v.budget <= Number.MAX_SAFE_INTEGER &&
    date !== null &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === v.start
  );
}

export function isPlan(v: unknown): v is Plan {
  if (!isPlanForm(v) || !isRecord(v)) return false;
  return (
    isPrefs(v.prefs) &&
    Array.isArray(v.menu) &&
    v.menu.length === v.days &&
    v.menu.every(
      (day) =>
        Array.isArray(day) &&
        day.length === 3 &&
        day.every((id, slot) => recipes.some((r) => r.id === id && r.slot === slot)),
    ) &&
    (v.alternative === undefined || typeof v.alternative === 'boolean')
  );
}

export function isSavedPlan(v: unknown): v is Plan | null {
  return v === null || isPlan(v);
}
export function isChecks(v: unknown): v is ShoppingChecks {
  return (
    isRecord(v) &&
    Object.entries(v).every(([id, checked]) => knownIngredient(id) && typeof checked === 'boolean')
  );
}
