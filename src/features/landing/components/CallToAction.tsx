/*
=============================
CallToAction
--> Ajakan penutup beranda untuk membuat rencana makan.
=============================
*/

import { useSession } from '@/features/auth/session';
import { Btn } from '@/shared/ui/Btn';
import { ArrowUpRight } from 'lucide-react';

export function CallToAction() {
  const { user } = useSession();
  return (
    <section className="cta-panel">
      <div>
        <h2>
          Besok masak apa?
          <br />
          Kita rencanakan hari ini.
        </h2>
        <p>Lebih sedikit bingung. Lebih banyak waktu di meja makan.</p>
      </div>
      <Btn to={user ? '/buat-rencana' : '/daftar'} variant="white">
        Buat Rencana Pertama
        <ArrowUpRight size={18} />
      </Btn>
    </section>
  );
}
