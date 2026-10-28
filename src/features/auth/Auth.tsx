/*
=============================
Auth
--> Tata letak halaman masuk atau daftar beserta ilustrasi dapur.
=============================
*/

import { KitchenIllustration } from '@/shared/ui/KitchenIllustration';
import { Logo } from '@/shared/ui/Logo';
import { AuthForm } from './components/AuthForm';

export function Auth({ register }: { register: boolean }) {
  return (
    <main className="auth-page">
      <div className="auth-visual">
        <Logo />
        <h1>
          Besok masak apa?
          <br />
          <span>Rencanakan dari sini.</span>
        </h1>
        <p>Susun menu, manfaatkan stok dapur, dan siapkan daftar belanja Anda.</p>
        <KitchenIllustration />
        <p className="demo-label" style={{ marginTop: 20, marginBottom: 0 }}>
          PanganBantu · Teman merencanakan makan sehari-hari.
        </p>
      </div>
      <div className="auth-form-wrap">
        <AuthForm register={register} />
      </div>
    </main>
  );
}
