/*
=============================
HowItWorks
--> Penjelasan tiga langkah penggunaan PanganBantu.
=============================
*/

import { Btn } from '@/shared/ui/Btn';
import { ArrowUpRight } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="how-section" id="cara-kerja">
      <div className="container how-grid">
        <div>
          <h2>
            Tiga langkah kecil.
            <br />
            Seminggu lebih tenang.
          </h2>
          <p>
            Tidak perlu bingung lagi menjawab,
            <br />
            “Hari ini masak apa, ya?”
          </p>
          <Btn to="/daftar" variant="outline">
            Yuk, mulai merencanakan
            <ArrowUpRight size={17} />
          </Btn>
        </div>
        <div>
          {[
            [
              'Ceritakan kebutuhan Anda',
              'Pilih jumlah orang, durasi, dan anggaran. Tambahkan stok dapur serta makanan yang disukai.',
            ],
            [
              'Temukan menu yang pas',
              'Dapatkan rencana makan dengan resep, informasi gizi, dan kisaran biaya yang jelas.',
            ],
            [
              'Belanja seperlunya, masak dengan tenang',
              'Buka daftar belanja yang sudah memperhitungkan stok. Ikuti resep, lalu nikmati bersama.',
            ],
          ].map(([t, p], i) => (
            <div className="how-step" key={t}>
              <span className="step-no">0{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p>{p}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
