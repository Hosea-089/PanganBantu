/*
=============================
headerImages
--> Pemilihan foto latar dari menu rencana atau katalog contoh.
=============================
*/

import { getRecipe } from '@/features/planning/model';
import type { Plan } from '@/features/planning/types';
const defaultHeaderImages = [
  '/assets/nasi-goreng.webp',
  '/assets/soto-ayam.jpg',
  '/assets/ayam-kecap.jpg',
];
export function planHeaderImages(plan: Plan | null) {
  return plan ? plan.menu[0].map((id) => getRecipe(id).image) : defaultHeaderImages;
}
