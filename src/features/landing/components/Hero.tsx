/*
=============================
Hero
--> Judul utama beranda, foto makanan, ajakan merencanakan menu, dan demo.
=============================
*/

import { useSession } from '@/features/auth/session';
import { Btn } from '@/shared/ui/Btn';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';

export function Hero() {
  const { user, demo } = useSession();
  return (
    <section className="hero">
      <div className="hero-copy">
        <h1>
          Makan Terencana,
          <br />
          <span>
            Pengeluaran
            <br />
            Terjaga.
          </span>
        </h1>
        <p>
          Menu rumahan yang pas di selera, pas di kantong. Rencanakan makan harian dari anggaran dan
          bahan yang sudah ada di dapur Anda.
        </p>
        <div className="hero-actions">
          <Btn to={user ? '/buat-rencana' : '/daftar'}>
            Mulai Rencanakan Menu
            <ArrowUpRight size={18} />
          </Btn>
          <button className="text-link" onClick={demo}>
            Jelajahi demo
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="hero-note">
          <span>
            <Check size={12} />
            Gratis untuk dicoba
          </span>
          <span>
            <Check size={12} />
            Untuk sendiri & keluarga
          </span>
        </div>
      </div>
      <div className="hero-image">
        <img
          src="/assets/nasi-goreng.webp"
          alt="Sepiring nasi goreng Indonesia dengan telur dan sayuran"
          fetchPriority="high"
        />
        <span className="image-credit">Foto: Pups with Chopsticks · Ilustrasi</span>
      </div>
    </section>
  );
}
