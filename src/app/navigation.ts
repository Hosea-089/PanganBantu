/*
=============================
navigation
--> Konfigurasi navigasi dan perpindahan URL halaman aplikasi.
=============================
*/

export function go(path: string) {
  location.hash = path;
  window.scrollTo({ top: 0, behavior: 'auto' });
}
