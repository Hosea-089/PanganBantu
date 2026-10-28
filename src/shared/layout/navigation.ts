/*
=============================
navigation
--> Konfigurasi navigasi dan perpindahan URL halaman aplikasi.
=============================
*/

import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  CalendarDays,
  LayoutDashboard,
  Package,
  ShoppingBasket,
  SlidersHorizontal,
  User,
} from 'lucide-react';
export const navItems: [string, string, LucideIcon][] = [
  ['/dashboard', 'Dapur Saya', LayoutDashboard],
  ['/rencana', 'Rencana Makan', BookOpen],
  ['/buat-rencana', 'Buat Rencana', CalendarDays],
  ['/stok', 'Stok Bahan', Package],
  ['/preferensi', 'Preferensi', SlidersHorizontal],
  ['/belanja', 'Daftar Belanja', ShoppingBasket],
  ['/profil', 'Profil', User],
];
