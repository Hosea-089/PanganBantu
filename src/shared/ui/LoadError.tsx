/*
=============================
LoadError
--> Keadaan gagal memuat halaman atau dialog dengan tombol mencoba kembali.
=============================
*/
import { Empty } from './Empty';
import { Btn } from './Btn';

export function LoadError() {
  return (
    <Empty
      title="Bagian ini belum dapat dimuat"
      sub="Periksa koneksi lalu muat ulang untuk mencoba kembali."
    >
      <Btn onClick={() => window.location.reload()}>Muat ulang halaman</Btn>
    </Empty>
  );
}
