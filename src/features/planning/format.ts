/*
=============================
format
--> Format rupiah, jumlah bahan, tanggal, dan rentang tanggal.
=============================
*/

import { ingredients } from './catalog';
import type { PlanForm } from './types';

export function rupiah(n: number) {
  return 'Rp' + Math.round(n).toLocaleString('id-ID');
}

export function range(a: number, b: number) {
  return `${rupiah(a)}–${rupiah(b)}`;
}

export function qty(n: number, id: string) {
  return `${Number(n.toFixed(2)).toLocaleString('id-ID')} ${ingredients[id].unit}`;
}

export function dateLabel(start: string, offset = 0, short = false) {
  const d = new Date(start + 'T12:00:00');
  d.setDate(d.getDate() + offset);

  return d.toLocaleDateString(
    'id-ID',
    short
      ? { day: 'numeric', month: 'short' }
      : { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  );
}

export function dateRange(plan: PlanForm) {
  const end = new Date(plan.start + 'T12:00:00');
  end.setDate(end.getDate() + plan.days - 1);
  const different = end.getFullYear() !== Number(plan.start.slice(0, 4));

  return `${dateLabel(plan.start, 0, true)}${different ? ' ' + plan.start.slice(0, 4) : ''} – ${dateLabel(plan.start, plan.days - 1, true)} ${end.getFullYear()}`;
}
