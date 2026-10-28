/*
=============================
Benefits
--> Tiga manfaat perencanaan menu, penggunaan stok, dan preferensi keluarga.
=============================
*/

import { Heart, Sprout, Wallet } from 'lucide-react';

export function Benefits() {
  return (
    <div className="landing-strip">
      <div className="strip-item">
        <Wallet />
        <div>
          <strong>Hemat dimulai dari rencana</strong>
          <small>Menu menyesuaikan anggaran Anda</small>
        </div>
      </div>
      <div className="strip-item">
        <Sprout />
        <div>
          <strong>Lebih bijak, lebih sedikit terbuang</strong>
          <small>Utamakan bahan yang sudah tersedia</small>
        </div>
      </div>
      <div className="strip-item">
        <Heart />
        <div>
          <strong>Selera keluarga, tetap nomor satu</strong>
          <small>Sesuaikan preferensi dan alergi</small>
        </div>
      </div>
    </div>
  );
}
