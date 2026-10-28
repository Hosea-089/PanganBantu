# Panduan komponen PanganBantu

Seluruh modul sumber memiliki komentar blok berikut. Pemisahan tanggung jawab dilakukan melalui file komponen, hook, dan modul domain yang berbeda.

```tsx
/*
=============================
Navbar
--> Navigasi beranda, pengumuman, menu ponsel, dan akses masuk atau daftar.
=============================
*/
```

## Perintah

Jalankan dari folder `panganbantu`:

```powershell
pnpm blocks                 # Seluruh blok beserta lokasi file
pnpm blocks Navbar          # Navbar beranda dan navbar aplikasi
pnpm blocks Hero            # Judul utama dan foto beranda
pnpm blocks planning        # Seluruh modul fitur perencanaan
pnpm blocks StockDialog     # Form tambah/ubah stok
pnpm blocks ShoppingTable   # Tabel daftar belanja
pnpm blocks anggaran        # Cari berdasarkan deskripsi
pnpm blocks Gaya            # Lapisan stylesheet

pnpm dev                    # Menjalankan aplikasi lokal
pnpm typecheck              # Memeriksa TypeScript strict
pnpm lint                   # Memeriksa Hooks, key, JSX, dan aksesibilitas
pnpm format                 # Merapikan format sumber aktif
pnpm check                  # Lint, format, tes unit, typecheck, dan build
pnpm test:e2e               # Build dan uji browser desktop/ponsel
```

Pencarian tidak peka huruf besar/kecil. Jika blok tidak ditemukan, perintah memberikan pesan dan exit code 1.

## Peta blok halaman

```text
=============================
Navbar
--> Navigasi beranda, pengumuman, tautan masuk/daftar, dan menu ponsel.
=============================
```

File: `src/features/landing/components/Navbar.tsx`.

```text
=============================
WorkspaceNavbar
--> Menu aplikasi, profil singkat, rencana baru, dan keluar akun.
=============================
```

File: `src/shared/layout/components/WorkspaceNavbar.tsx`. Daftar halaman di `src/shared/layout/navigation.ts`.

```text
=============================
Hero
--> Judul, penjelasan utama, foto makanan, dan tombol demo beranda.
=============================
```

File: `src/features/landing/components/Hero.tsx`. Blok beranda lainnya: `Benefits.tsx`, `HowItWorks.tsx`, `CallToAction.tsx`, dan `PublicFooter.tsx` dalam folder yang sama.

```text
=============================
AuthForm
--> Isian akun, pesan validasi, tombol kata sandi, dan akses demo.
=============================
```

File: `src/features/auth/components/AuthForm.tsx`. Logika akun di `src/features/auth/useAuthForm.ts`; kredensial simulasi di `password.ts`.

```text
=============================
Dashboard
--> Menyusun sambutan, ringkasan biaya, pintasan, dan bahan tersedia.
=============================
```

File: `src/features/dashboard/Dashboard.tsx`. Blok kecilnya di `components/DashboardWelcome.tsx`, `DashboardStats.tsx`, `DashboardShortcuts.tsx`, dan `PantryPreview.tsx` dalam folder fitur tersebut.

```text
=============================
Wizard
--> Lima langkah pembuatan rencana serta tombol lanjut dan kembali.
=============================
```

File: `src/features/planning/Wizard.tsx`.

| Bagian                               | File                                                    |
| ------------------------------------ | ------------------------------------------------------- |
| Individu/keluarga dan jumlah peserta | `src/features/planning/components/ParticipantsStep.tsx` |
| Durasi, tanggal, dan anggaran        | `src/features/planning/components/BudgetStep.tsx`       |
| Stok pada langkah ketiga             | `src/features/pantry/Pantry.tsx`, prop `embedded`       |
| Preferensi pada langkah keempat      | `src/features/preferences/PreferenceEditor.tsx`         |
| Ringkasan sebelum perhitungan        | `src/features/planning/components/ReviewStep.tsx`       |
| Indikator langkah                    | `src/features/planning/components/WizardProgress.tsx`   |
| Ringkasan di samping formulir        | `src/features/planning/components/WizardAside.tsx`      |
| Draf lintas halaman dan worker       | `src/features/planning/PlanningProvider.tsx`            |

```text
=============================
Results
--> Hasil rencana, tab tanggal, menu harian, dan ringkasan biaya.
=============================
```

File: `src/features/planning/Results.tsx`. Blok kecilnya di `components/DayTabs.tsx`, `MealCarousel.tsx`, `MealCard.tsx`, dan `DailyCostSummary.tsx`.
Panel Tanya katalog resep berada di `src/features/planning/RecipeAssistant.tsx`; retrieval dan proxy LLM server-side ada di `server/assistant.ts`.

```text
=============================
RecipeDialog
--> Bahan, alokasi stok, cara memasak, dan perkiraan gizi resep.
=============================
```

File: `src/features/planning/components/RecipeDialog.tsx`. Menu pengganti di `SwapDialog.tsx`; penjelasan rencana tidak layak di `src/features/planning/Infeasible.tsx`.

```text
=============================
Pantry
--> Daftar bahan, pencarian, kategori, serta aksi tambah, ubah, dan hapus.
=============================
```

File: `src/features/pantry/Pantry.tsx`. Form stok di `StockDialog.tsx`; konfirmasi penghapusan di `DeleteDialog.tsx`.

```text
=============================
PreferenceEditor
--> Bahan disukai, dihindari, pola makan, dan alergi.
=============================
```

File: `src/features/preferences/PreferenceEditor.tsx`. Halaman `Preferences.tsx` menyimpan draf tersendiri sampai tombol Simpan Preferensi ditekan.

```text
=============================
Grocery
--> Ringkasan biaya, filter pembelian, dan kelompok daftar belanja.
=============================
```

File: `src/features/grocery/Grocery.tsx`. Ringkasan di `components/ShoppingSummary.tsx`; tabel bahan di `components/ShoppingTable.tsx`.

```text
=============================
Profile
--> Nama pengguna, informasi akun, dan ringkasan dapur.
=============================
```

File: `src/features/profile/Profile.tsx`.

```text
=============================
PageHeader
--> Judul halaman, penjelasan, breadcrumb, foto latar, dan tombol tindakan.
=============================
```

File: `src/shared/layout/PageHeader.tsx`. Pergantian foto di `HeaderSlideshow.tsx`; pilihan foto di `headerImages.ts`; jejak halaman di `WorkspaceBreadcrumb.tsx`.

Komponen lintas fitur berada di `src/shared/ui/`: `Btn`, `Badge`, `Note`, `Stat`, `Dialog`, `Empty`, `Logo`, dan `SourceNote`. `Shell.tsx` menyusun kerangka aplikasi, `WorkspaceNavbar`, breadcrumb, area utama, dan `WorkspaceFooter`.

## Struktur dan cara mengedit

```text
server/                  # API server-side opsional untuk RAG resep dan proxy LLM
src/
  app/                   # Komposisi provider dan pemilihan halaman
  features/
    auth/                # Sesi dan akun simulasi
    dashboard/           # Halaman Dapur Saya
    landing/             # Beranda
    planning/            # Wizard, hasil, resep, kalkulasi, worker, dan tipe
    pantry/              # Stok dan penyimpanan dapur per akun
    preferences/         # Editor preferensi dan draf
    grocery/             # Daftar belanja
    profile/             # Profil
  shared/
    layout/              # Kerangka, navigasi, header, dan footer bersama
    storage/             # Validasi, penyimpanan, dan migrasi data
    ui/                  # Komponen UI lintas fitur
  styles/                # Lapisan gaya bersama
```

1. Cari blok dengan `pnpm blocks NamaBlok`, lalu buka file yang ditampilkan.
2. Ubah teks atau susunan JSX pada komponen tersebut. Tempatkan state UI baru pada komponen pemakainya.
3. Cari gaya melalui `className`, misalnya `rg -n 'workspace-header|public-nav' src/styles`.
4. Jalankan `pnpm dev` dan periksa ukuran desktop serta ponsel.
5. Jalankan `pnpm format` lalu `pnpm check`. Untuk perubahan alur, jalankan `pnpm test:e2e`.

Gunakan alias `@/` untuk impor dari `src`, misalnya `import { Btn } from '@/shared/ui/Btn'`. Komponen khusus suatu fitur tetap berada di folder fitur tersebut.

Stylesheet dimuat berurutan: `style.css` → `workspace.css` → `allianz.css` → `accessibility.css`. Urutan ini mempertahankan tampilan yang sudah ada. Gaya lintas halaman tetap menjadi lapisan bersama. Tampilan akhir ruang aplikasi berada di `allianz.css`; fokus, dialog native, dan reduced motion berada di `accessibility.css`.

## Penerapan praktik kode

- Seluruh komponen aplikasi adalah function components dengan props bertipe. TypeScript menggunakan mode `strict` tanpa `any` eksplisit atau penonaktifan pemeriksaan.
- Sesi, dapur, draf perencanaan, dan dialog memakai konteks terpisah. Pencarian, filter, tab, carousel, menu ponsel, dan error formulir tetap lokal.
- Biaya, ringkasan harian, stok terpakai, dan status pembelian dihitung dari data sumber. Draf preferensi merupakan isian yang belum disimpan, sehingga sengaja terpisah dari preferensi aktif.
- Draf wizard dipakai beberapa halaman, termasuk ketika kembali dari hasil yang tidak layak. Draf tersebut berada di provider fitur perencanaan.
- Data akun, dapur, preferensi, dan rencana tetap berada di `localStorage`/client state. API opsional di `server/assistant.ts` hanya menerima pertanyaan dan mengambil maksimal tiga resep dari katalog lokal; tidak mengirim stok atau preferensi akun ke LLM. Endpoint server-state lain harus memakai layanan tersendiri dan tidak menyalin cache API ke konteks dapur.
- `model.ts` mengekspor modul domain: `catalog.ts`, `calculations.ts`, `generate.ts`, dan `format.ts`. Perhitungan tidak membaca React, DOM, atau penyimpanan.
- React `key` mengikuti identitas data: ID bahan/resep, nama pilihan, URL foto unik, dan tanggal. ESLint menolak `key` yang hilang atau berasal dari indeks array.
- Belum ada `React.memo`, `useMemo`, atau `useCallback` karena belum ada pengukuran yang membuktikan kebutuhan. Pencarian menu dijalankan di Web Worker agar loop kombinasi tidak memblokir interaksi halaman.
- Halaman dan dialog memakai `React.lazy`, `Suspense`, keadaan memuat, serta pesan pemulihan jika modul gagal dimuat. Worker dihentikan setelah selesai dan saat provider dibongkar.
- Tombol memakai `<button>`; perpindahan halaman memakai tautan. Tab hari mendukung panah, Home, End, serta fokus aktif. Dialog memakai elemen native `<dialog>` dengan fokus terkunci dan Escape. Preferensi reduced motion dihormati.
- Teks dirender melalui JSX. ESLint menolak `dangerouslySetInnerHTML` dan pelanggaran Hooks; Prettier menjaga format konsisten.

## Penyimpanan dan akun simulasi

Data dapur dipisahkan dengan kunci per akun. Migrasi format lama hanya memakai sesi lama yang aktif dan tidak menimpa data akun yang sudah dipisahkan. Pembacaan penyimpanan memvalidasi struktur, tanggal, resep, satuan, dan angka. Jika penulisan gagal, aplikasi memberi pesan; perubahan tetap ada dalam memori sampai halaman ditutup.

Kredensial simulasi baru memakai PBKDF2 SHA-256, 600.000 iterasi, dan salt acak 16 byte. Hash SHA-256 lama dimigrasikan setelah login berhasil. Ini tetap simulasi lokal: hash dan pemisahan kunci tidak menggantikan autentikasi atau otorisasi server. Gunakan data dan kata sandi contoh.

`pnpm test` mencakup perhitungan, batas input, penyimpanan rusak, kegagalan penyimpanan, migrasi, dan kompatibilitas kredensial. `pnpm test:e2e` menguji build produksi pada desktop 1440 px dan ponsel 390 px menggunakan Microsoft Edge. Jika Edge tidak tersedia, pasang Chromium dengan `pnpm exec playwright install chromium`, lalu hapus pengaturan `channel: 'msedge'` pada `playwright.config.ts`.

Arsip kode lama, screenshot pengembangan, paket deploy lama, dan cache lokal yang tidak aktif sudah dihapus. Direktori `dist/` merupakan hasil build yang digunakan pratinjau dan konfigurasi hosting. Hasil pengujian di `test-results/` akan dibuat kembali saat pengujian browser dijalankan. Pemeriksaan mencakup `src`, `tests`, konfigurasi, dan `scripts`.

Rujukan: [state turunan dan Effect React](https://react.dev/learn/you-might-not-need-an-effect), [React.lazy](https://react.dev/reference/react/lazy), [TypeScript strict](https://www.typescriptlang.org/tsconfig/strict.html), dan [tab keyboard WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
