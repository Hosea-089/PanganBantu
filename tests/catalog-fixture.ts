import type { Catalog, Ingredient, Recipe } from '../src/features/planning/types';

const ingredients: Record<string, Ingredient> = {
  beras: { name: 'Beras', unit: 'g', category: 'Bahan Pokok', price: [0.01, 0.02], icon: '' },
  telur: {
    name: 'Telur ayam',
    unit: 'butir',
    category: 'Protein',
    price: [1500, 2000],
    icon: '',
    allergens: ['Telur'],
  },
  tahu: {
    name: 'Tahu putih',
    unit: 'g',
    category: 'Protein',
    price: [0.02, 0.03],
    icon: '',
    allergens: ['Kedelai'],
  },
  tempe: {
    name: 'Tempe',
    unit: 'g',
    category: 'Protein',
    price: [0.03, 0.04],
    icon: '',
    allergens: ['Kedelai'],
  },
  wortel: { name: 'Wortel', unit: 'g', category: 'Sayuran', price: [0.01, 0.02], icon: '' },
  bayam: { name: 'Bayam', unit: 'g', category: 'Sayuran', price: [0.01, 0.02], icon: '' },
  kol: { name: 'Kol', unit: 'g', category: 'Sayuran', price: [0.01, 0.02], icon: '' },
  kentang: { name: 'Kentang', unit: 'g', category: 'Sayuran', price: [0.02, 0.03], icon: '' },
};

const recipe = (
  id: string,
  name: string,
  slot: number,
  items: Record<string, number>,
): Recipe => ({
  id,
  name,
  slot,
  image: '',
  time: 20,
  items,
  nutrition: [100, 4, 20, 2, 3],
  steps: ['Masak sampai matang.'],
  servings: 1,
});

export const testCatalog: Catalog = {
  ingredients,
  recipes: [
    recipe('nasi-telur', 'Nasi Goreng Telur', 0, { beras: 100, telur: 1 }),
    recipe('bubur-sayur', 'Bubur Sayur', 0, { beras: 100, wortel: 30, bayam: 20 }),
    recipe('tahu', 'Tumis Tahu Sayur & Nasi', 1, { beras: 100, tahu: 50, kol: 20 }),
    recipe('sup-telur', 'Sup Telur Sayuran & Nasi', 1, { beras: 100, telur: 1, wortel: 20 }),
    recipe('ayam', 'Ayam Kecap & Nasi Hangat', 2, { beras: 100, tempe: 50 }),
    recipe('tempe-bayam', 'Tempe panggang & sayur bening', 2, { beras: 100, tempe: 50, bayam: 30 }),
  ],
  slots: ['Sarapan', 'Makan Siang', 'Makan Malam'],
};
