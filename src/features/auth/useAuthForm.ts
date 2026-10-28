/*
=============================
useAuthForm
--> Mengelola isian akun, pendaftaran, verifikasi, dan migrasi kredensial lama.
=============================
*/

import { go } from '@/app/navigation';
import { read, write } from '@/shared/storage/storage';
import { isAccounts } from '@/shared/storage/validators';
import { useFeedback } from '@/shared/ui/feedback';
import { useState, type FormEvent } from 'react';
import { createCredentials, verifyPassword } from './password';
import { useSession } from './session';

export function useAuthForm(register: boolean) {
  const { setUser } = useSession();
  const { notify } = useFeedback();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    setError('');
    if (register && (!name.trim() || name.trim().length > 30)) {
      setError('Isi nama pengguna maksimal 30 karakter.');
      return;
    }
    if (!email.trim()) {
      setError('Masukkan nama pengguna atau alamat email.');
      return;
    }
    if (register && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Format email belum benar. Contoh: nama@email.com');
      return;
    }
    if (password.length < 6) {
      setError('Kata sandi harus berisi minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      const accounts = read('accounts', [], isAccounts);
      const identity = email.trim().toLowerCase();
      if (register) {
        if (
          accounts.some(
            (a) =>
              a.email.toLowerCase() === identity ||
              a.name.toLowerCase() === name.trim().toLowerCase(),
          )
        ) {
          setError('Email atau nama pengguna sudah terdaftar di perangkat ini. Silakan masuk.');
          return;
        }
        const credentials = await createCredentials(password);
        const account = { name: name.trim(), email: identity, ...credentials };
        if (!write('accounts', [...accounts, account]))
          throw new Error('Penyimpanan tidak tersedia.');
        setUser({ name: account.name, email: account.email });
        notify('Akun simulasi berhasil dibuat. Selamat datang!');
      } else {
        const account = accounts.find(
          (a) => a.email.toLowerCase() === identity || a.name.toLowerCase() === identity,
        );
        if (!account || !(await verifyPassword(password, account))) {
          setError(
            'Nama pengguna/email atau kata sandi tidak cocok. Daftar dahulu atau gunakan akun demo.',
          );
          return;
        }
        if (!account.salt) {
          const credentials = await createCredentials(password);
          if (
            !write(
              'accounts',
              accounts.map((a) => (a === account ? { ...a, ...credentials } : a)),
            )
          )
            throw new Error('Penyimpanan tidak tersedia.');
        }
        setUser({ name: account.name, email: account.email });
        notify('Berhasil masuk. Selamat datang kembali!');
      }
      go('/dashboard');
    } catch {
      setError('Akun belum dapat disimpan. Coba gunakan demo atau aktifkan penyimpanan peramban.');
    } finally {
      setLoading(false);
    }
  }

  return { name, setName, email, setEmail, password, setPassword, error, loading, submit };
}
