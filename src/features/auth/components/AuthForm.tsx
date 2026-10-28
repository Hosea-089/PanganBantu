/*
=============================
AuthForm
--> Input nama, email, kata sandi, validasi, dan pilihan demo.
=============================
*/

import { useSession } from '@/features/auth/session';
import { useAuthForm } from '@/features/auth/useAuthForm';
import { Btn } from '@/shared/ui/Btn';
import { Logo } from '@/shared/ui/Logo';
import { Note } from '@/shared/ui/Note';
import { ArrowLeft, ArrowRight, ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { useId, useState } from 'react';

export function AuthForm({ register }: { register: boolean }) {
  const passwordId = useId();
  const { name, setName, email, setEmail, password, setPassword, error, loading, submit } =
    useAuthForm(register);
  const { demo } = useSession();
  const [show, setShow] = useState(false);
  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <Logo />
      <a href="#/" className="text-link muted">
        <ArrowLeft size={15} />
        Kembali ke beranda
      </a>
      <h2>{register ? 'Buat akun Anda' : 'Selamat datang kembali'}</h2>
      <p>
        {register
          ? 'Buat akun dan rencanakan makan sesuai kebutuhan Anda.'
          : 'Masuk untuk melanjutkan rencana makan Anda.'}
      </p>
      {register && (
        <label className="field">
          <span>Nama pengguna</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama panggilan Anda"
            autoComplete="username"
            maxLength={30}
          />
        </label>
      )}
      <label className="field">
        <span>{register ? 'Alamat email' : 'Nama pengguna atau email'}</span>
        <input
          type={register ? 'email' : 'text'}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={register ? 'nama@email.com' : 'Masukkan nama pengguna atau email'}
          autoComplete={register ? 'email' : 'username'}
        />
      </label>
      <div className="field">
        <label htmlFor={passwordId}>Kata sandi</label>
        <div className="password-field">
          <input
            id={passwordId}
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 6 karakter"
            autoComplete={register ? 'new-password' : 'current-password'}
          />
          <button
            type="button"
            aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            onClick={() => setShow(!show)}
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      {error && (
        <div className="field-error" role="alert">
          {error}
        </div>
      )}
      <button type="submit" className="btn primary full" disabled={loading}>
        {loading ? 'Mohon tunggu…' : register ? 'Daftar Gratis' : 'Masuk'}
        <ArrowRight size={17} />
      </button>
      <div className="divider">ATAU COBA TERLEBIH DAHULU</div>
      <Btn onClick={demo} variant="outline" className="full">
        Jelajahi dengan Akun Demo
        <ArrowUpRight size={16} />
      </Btn>
      <div className="auth-switch">
        {register ? 'Sudah punya akun?' : 'Belum punya akun?'}{' '}
        <a href={register ? '#/masuk' : '#/daftar'}>{register ? 'Masuk' : 'Daftar gratis'}</a>
      </div>
      <Note>
        Ini akun simulasi. Gunakan kata sandi contoh. Data disimpan di peramban ini, bukan layanan
        akun sungguhan.
      </Note>
    </form>
  );
}
