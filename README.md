# PanganBantu

Prototipe React/TypeScript dengan FastAPI, SQLAlchemy, dan Alembic. Akun, stok, preferensi, rencana, dan cek belanja akun disimpan di database per pengguna; mode demo tetap lokal. Katalog bahan, resep, harga referensi, dan nutrisi dibaca dari database. Tidak ada harga toko waktu nyata.

## Menjalankan

Memerlukan Node.js 22.12+, pnpm 10+, dan Python 3.10+.

```sh
pnpm install
python -m pip install -r requirements.txt
```

Salin `.env.example` ke `.env` bila belum ada. Terminal pertama menjalankan migrasi, seed, dan API:

```sh
pnpm backend:dev
```

Terminal kedua menjalankan antarmuka:

```sh
pnpm dev
```

Database lokal memakai SQLite. Untuk MySQL, atur `DATABASE_URL` ke `mysql+pymysql://user:password@host:3306/panganbantu`, lalu jalankan `pnpm db:migrate` dan `pnpm db:seed`. Jangan pakai kredensial produksi untuk demo.

Build: `pnpm build`. Pemeriksaan lengkap: `pnpm check` (frontend dan backend). Uji backend: `pnpm test:backend`. Uji browser desktop/ponsel: `pnpm test:e2e` (Microsoft Edge; Playwright menyiapkan SQLite terpisah).

Pilih **Jelajahi demo** untuk rencana lokal, atau daftar memakai email fiktif dan kata sandi minimal 8 karakter. Akun terdaftar memakai sesi JWT dan dapur tersimpan di backend per akun. Prototipe belum disiapkan untuk deployment: gunakan HTTPS, secret JWT yang kuat, dan kontrol operasional produksi.

## Backend dan katalog

`GET /api/v1/catalog` menyajikan data publik. `GET/PUT /api/v1/me/kitchen` dan `GET/PATCH /api/auth/me` memerlukan token Bearer serta membatasi data ke pemilik token. Migrasi berada di `migrations/`; `backend.seed` hanya menambahkan data contoh yang belum ada agar perubahan database tetap terjaga.

Katalog memakai ID bahan tetap dari database. Harga minimum/maksimum dihitung dari harga BPS 2025 dan konversi per satuan; API menyertakan kuantitas/satuan referensi, sumber, wilayah, periode observasi, tanggal pembaruan, serta sumber dan faktor konversi. Nutrisi bahan memakai TKPI 2020 dan BDD; nutrisi resep dihitung per porsi. Bahan tanpa harga positif, konversi, nutrisi, atau provenance lengkap—serta resep yang merujuk bahan tersebut—tidak masuk katalog optimizer. Perubahan katalog di database tidak mengubah algoritme Web Worker.

## Asisten kuliner (opsional)

Asisten menjawab pertanyaan resep, teknik memasak, penyimpanan/penggantian bahan, serta rencana aktif. Retrieval memakai maksimal tiga resep katalog yang dimuat dari API database saat server dimulai. Pertanyaan, konteks resep, dan jadwal rencana dikirim ke provider LLM; jangan kirim informasi kesehatan atau data sensitif.

Isi `LLM_API_URL`, `LLM_API_KEY`, dan `LLM_MODEL` di `.env`, lalu jalankan `pnpm api` setelah backend siap. Vite meneruskan `/api/assistant/recipes` ke `127.0.0.1:8787`. API dapat berjalan tanpa key, tetapi jawaban yang memerlukan model akan gagal dengan pesan konfigurasi. Kunci LLM hanya berada di server. Mulai ulang assistant setelah katalog berubah.

Stok, preferensi, dan anggaran tidak dikirim ke provider. Asisten tidak menilai alergi/kondisi medis, memberi klaim gizi, atau menghitung harga. Pembatas permintaan saat ini berlaku per alamat pada satu proses.

## Mengubah komponen

Lihat [panduan komponen dan arsitektur](docs/KOMPONEN.md). Halaman/dialog memakai lazy loading; pencarian menu dan optimizer berjalan di Web Worker.

```sh
pnpm blocks                 # Semua blok komponen
pnpm blocks Navbar          # Navigasi beranda dan aplikasi
pnpm blocks MealCard        # Kartu menu
pnpm blocks planning        # Modul perencanaan
```

## Perhitungan

- Kuantitas resep tersimpan per porsi dan diskalakan sesuai jumlah orang.
- Stok dialokasikan sekali secara kronologis; hanya kekurangan masuk daftar belanja dan biaya.
- Harga memakai rentang per satuan; batas atas menentukan kelayakan anggaran.
- Alternatif termurah dienumerasi berdasarkan distribusi resep per waktu makan, termasuk pemakaian stok bersama. Katalog demo memuat enam resep, bukan seluruh makanan Indonesia.
- Pantangan, pola makan, dan alergi wajib dikecualikan; favorit hanya preferensi lunak.
- Centang belanja tidak mengubah stok atau kebutuhan. Pembelian aktual tidak tersedia.

## Sumber data dan foto

Harga memakai *Statistik Harga Konsumen Perdesaan Kelompok Makanan 2025*, BPS, Publikasi 06200.26006, tabel 1.1, 1.41, 1.50, 1.51, 1.53, 1.65, 1.82, dan 1.83: [publikasi BPS](https://www.bps.go.id/id/publication/2026/04/24/bf06c6b8d3adfdefce0a9032/statistik-harga-konsumen-perdesaan-kelompok-makanan-2025.html). Nutrisi mengacu pada TKPI 2020, Kementerian Kesehatan RI: [katalog resmi](https://repository.kemkes.go.id/book/668). Konversi telur dan BDD disimpan bersama provenance API. Harga adalah estimasi agregat, bukan harga aktual toko.

Foto hanya ilustrasi; pelengkap foto tidak selalu termasuk komposisi resep. Tinjau lisensi sebelum penggunaan komersial.

- Nasi goreng: https://pupswithchopsticks.com/nasi-goreng-indonesian-fried-rice/
- Soto: https://www.orami.co.id/tools/resep/resep-soto-ayam-bumbu-kuning
- Tahu wortel: https://cookpad.com/id/resep/2031291 (Andry)
- Ayam kecap: https://karawangpost.pikiran-rakyat.com/resep/pr-14210077721/resep-ayam-kecap-sederhana-yang-mantap
- Tempe: https://www.briliofood.net/resep/10-resep-olahan-tempe-bakar-enak-dan-simpel-210606l.html
- Sup sayur: https://cookpad.com/id/resep/13177509 (Oci)
- Nasi tempe: https://toasttohome.com/tempeh-recipe/
- Bubur sayur: https://aromaresepmasakan.blogspot.com/2021/07/29-resep-bubur-nasi-campur-sayur.html (foto Cookpad)
