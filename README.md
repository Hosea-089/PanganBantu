# PanganBantu

Prototipe frontend React berbahasa Indonesia untuk perencanaan makan 1–7 hari. Data akun, stok, preferensi, rencana, dan cek belanja disimpan di localStorage. Tidak menggunakan backend atau layanan harga langsung.

## Menjalankan

```sh
pnpm install
pnpm dev
```

Build: `pnpm build`. Pemeriksaan perhitungan: `pnpm test`.

Pilih **Jelajahi demo** untuk rencana contoh, atau daftar dengan data fiktif untuk memulai dari kondisi kosong. Kata sandi simulasi disimpan sebagai hash SHA-256 lokal; ini bukan autentikasi produksi. Data dapur pada prototipe merupakan data lokal per peramban.

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
