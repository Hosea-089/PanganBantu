# PanganBantu

Prototipe frontend React dan TypeScript berbahasa Indonesia untuk perencanaan makan 1–7 hari. Data akun, stok, preferensi, rencana, dan cek belanja disimpan di `localStorage` per akun. Asisten resep memakai API server-side opsional; tidak ada layanan harga langsung.

## Menjalankan

```sh
pnpm install
pnpm dev
```

Memerlukan Node.js 22.12+ dan pnpm 10+. Build: `pnpm build`. Pemeriksaan lengkap: `pnpm check`. Uji browser desktop/ponsel: `pnpm test:e2e` (Microsoft Edge).

Pilih **Jelajahi demo** untuk rencana contoh, atau daftar dengan data fiktif untuk memulai dari kondisi kosong. Kredensial baru memakai PBKDF2 SHA-256 dengan salt acak; hash lama dimigrasikan setelah login berhasil. Ini akun simulasi lokal, bukan autentikasi produksi. Gunakan kata sandi contoh.


## Asisten resep (opsional)

Asisten menjawab pertanyaan resep dengan RAG ringan: pencarian kata kunci memilih maksimal tiga resep dari katalog lokal. Pada halaman hasil, menu terjadwal, tanggal, jumlah porsi, dan hari yang sedang dipilih juga menjadi konteks jawaban. Pertanyaan, resep konteks, dan jadwal rencana dikirim ke provider LLM.

Stok dapur, preferensi, dan anggaran tidak dikirim. Asisten tidak memvalidasi alergi, harga, atau gizi; perhitungan planner tetap sumber kebenaran. Tidak memakai embeddings atau vector DB.

Salin `.env.example` menjadi `.env` (`Copy-Item .env.example .env` pada PowerShell), lalu isi `LLM_API_URL`, `LLM_API_KEY`, dan `LLM_MODEL` (default `gpt-6-luna`). Simpan API key di `.env` server, bukan di variabel `VITE_*` atau kode frontend. Jalankan dua terminal:

Terminal 1:

```sh
pnpm api
```

Terminal 2:

```sh
pnpm dev
```

Vite meneruskan `/api/assistant/recipes` ke API lokal di `127.0.0.1:8787`. API server dapat berjalan tanpa key, tetapi pertanyaan dengan resep cocok akan membalas bahwa AI belum dikonfigurasi. Untuk deploy, jalankan server API dan reverse-proxy rute `/api/` kepadanya; build frontend statis saja tidak menyediakan backend.

API server default hanya bind ke `127.0.0.1` dan belum punya autentikasi pengguna. Jangan ekspos endpoint ke internet tanpa autentikasi serta rate limiter bersama lintas proses.

Asisten tampil di halaman **Rencana Makan**. Pertanyaan maksimal 300 karakter; API membatasi 10 permintaan per menit berdasarkan alamat yang terlihat oleh proses API. Retrieval memakai pencocokan kata terhadap resep lokal dan menambahkan menu pada rencana aktif sebagai konteks.

## Mengubah komponen

Lihat [panduan komponen dan arsitektur](docs/KOMPONEN.md) untuk lokasi setiap bagian halaman, pembagian state, stylesheet, dan pemeriksaan kode. Sumber telah dipisahkan berdasarkan fitur; halaman/dialog memakai lazy loading dan pencarian menu berjalan di Web Worker.

```sh
pnpm blocks                 # Semua blok komponen dan penjelasannya
pnpm blocks Navbar          # Cari navigasi beranda dan aplikasi
pnpm blocks MealCard        # Cari kartu menu
pnpm blocks planning        # Cari modul fitur perencanaan
```

Komentar blok menggunakan format:

```text
=============================
Navbar
--> Navigasi beranda, pengumuman, menu ponsel, dan akses masuk atau daftar.
=============================
```

## Perhitungan

- Semua kuantitas resep adalah per porsi, dengan beras dalam berat mentah.
- Stok dialokasikan sekali, secara kronologis. Kebutuhan belanja adalah maksimum dari nol dan selisih kebutuhan dengan stok.
- Harga per gram/ml/butir memiliki batas minimum dan maksimum tetap. Biaya makanan, ringkasan harian, dan daftar belanja memakai hasil perhitungan yang sama.
- Kecukupan anggaran ditentukan oleh batas atas estimasi.
- Alternatif termurah diperoleh lewat enumerasi distribusi jumlah resep per waktu makan, sehingga dapat memperhitungkan stok bersama. Ruang pencarian hanya katalog sembilan resep fiktif, bukan seluruh makanan Indonesia.
- Favorit merupakan preferensi lunak. Bahan dihindari, pola makan, dan alergi merupakan pengecualian wajib.
- Membeli bahan pada daftar hanya mengubah centang, tidak mengubah stok atau total kebutuhan.

## Sumber foto

Foto hanya ilustrasi penyajian; resep, kandungan gizi, serta harga di aplikasi adalah data simulasi sendiri. Pelengkap dalam foto tidak termasuk resep atau perhitungan.

- Nasi goreng: https://pupswithchopsticks.com/nasi-goreng-indonesian-fried-rice/
- Soto: https://www.orami.co.id/tools/resep/resep-soto-ayam-bumbu-kuning
- Tahu wortel: https://cookpad.com/id/resep/2031291 (Andry)
- Ayam kecap: https://karawangpost.pikiran-rakyat.com/resep/pr-14210077721/resep-ayam-kecap-sederhana-yang-mantap
- Tempe: https://www.briliofood.net/resep/10-resep-olahan-tempe-bakar-enak-dan-simpel-210606l.html
- Sup sayur: https://cookpad.com/id/resep/13177509 (Oci)
- Nasi tempe: https://toasttohome.com/tempeh-recipe/
- Bubur sayur: https://aromaresepmasakan.blogspot.com/2021/07/29-resep-bubur-nasi-campur-sayur.html (foto Cookpad)

Tanggal data simulasi: 12 Oktober 2026. Foto digunakan sebagai referensi visual prototipe; tinjau lisensi sebelum penggunaan komersial.
