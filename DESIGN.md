# UI PanganBantu

Referensi tata letak: [halaman produk Allianz Indonesia](https://www.allianz.co.id/produk.html).
Adaptasi menggunakan prinsip konsistensi komponen, grid 4 px, tipografi, dan reduced motion dari skill linear-design-design.

## Identitas

Warna mengikuti beranda yang sudah ada: hijau tua `#013237`, mint `#EAF9E7`, sage `#C0E6BA`, hijau `#4CA771`, teks sekunder `#536E65`, dan putih.
Font Inter lokal dipakai untuk antarmuka baru; logo mempertahankan tipografi merek.

## Penerapan

- Header dua tingkat: merek dan akun, lalu navigasi dengan garis penanda halaman aktif.
- Judul terpusat pada bidang mint, kartu dengan radius 4 px, ruang antarseksi yang lapang.
- Kartu makanan memakai foto penuh sebagai latar; judul, porsi, harga, gizi, dan tombol ditumpuk di atas gradasi hijau tua agar terbaca. Foto tetap memiliki teks alternatif.
- Tiga menu harian disatukan dalam satu carousel pada hasil rencana. Dapur Saya menampilkan ringkasan, pintasan, dan stok tanpa mengulang menu harian. Pilih waktu makan, gunakan panah navigasi, tombol panah keyboard saat carousel terfokus, atau geser foto pada ponsel. Pergantian hari kembali ke menu sarapan; carousel tidak berganti otomatis.
- Header Rencana Makan memakai foto menu sebagai latar yang berganti otomatis setiap 6 detik dengan transisi memudar. Judul dan tombol tetap di tempat; tersedia pemilih foto dan tombol jeda. Preferensi reduced motion menonaktifkan pemutaran otomatis secara default.
- Header Stok Bahan, Preferensi, Daftar Belanja, dan Profil memakai carousel yang sama dengan Rencana Makan, termasuk saat belum ada rencana.
- Banner foto pada kelima halaman membentang penuh dari tepi kiri hingga kanan layar, dimulai tepat di bawah navbar. Breadcrumb dan tanggal berada di atas foto dalam carousel, dengan teks terang. Tingginya 416 px di desktop dan 480 px di ponsel. Kelas bersama `page-fullwidth-header` menjaga isi halaman di bawahnya pada kontainer 1120 px dengan jarak tepi 40 px di desktop dan 24 px di ponsel.
- Komponen ringkasan pada dasbor dan hasil rencana berupa tiga kolom transparan tanpa kartu, dengan garis vertikal di antara kolom. Pada layar sempit, baris tetap terdiri dari tiga kolom dan dapat digulir mendatar, termasuk melalui keyboard.
- Berlaku untuk dasbor, pembuatan/hasil rencana, stok, preferensi, daftar belanja, profil, daftar akun, serta dialog dan keadaan kosong.
- Navigasi ponsel dibuka melalui tombol menu; tabel belanja tetap dapat digulir secara horizontal.
- Beranda dan login tidak memakai kelas `allianz-surface`. Komponen Landing dan Auth serta stylesheet semula dipertahankan.

Gaya tambahan berada di `src/allianz.css` dan dibatasi oleh kelas `.allianz-surface`. Model perhitungan dan penyimpanan tidak diubah.
