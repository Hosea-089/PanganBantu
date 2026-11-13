/*
=============================
useAuthForm
--> Mengirim kredensial ke API akun dan membuka sesi bertoken.
=============================
*/

import { go } from '@/app/navigation';
import { api, setApiToken } from '@/shared/api';
import type { User } from './types';
import { useFeedback } from '@/shared/ui/feedback';
import { isRecord } from '@/shared/typeguards';
import { isUser } from '@/shared/storage/validators';
import { useState, type FormEvent } from 'react';
import { useSession } from './session';

interface AuthReply {
  access_token: string;
  token_type: 'bearer';
  user: User;
}

function isAuthReply(value: unknown): value is AuthReply {
  return (
    isRecord(value) &&
    typeof value.access_token === 'string' &&
    value.access_token.length > 0 &&
    value.token_type === 'bearer' &&
    isUser(value.user)
  );
}

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
    if (password.length < 8) {
      setError('Kata sandi harus berisi minimal 8 karakter.');
      return;
    }
    setLoading(true);
    try {
      const payload = register
        ? { name: name.trim(), email: email.trim().toLowerCase(), password }
        : { identifier: email.trim(), password };
      const reply: unknown = await api(register ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: payload,
      });
      if (!isAuthReply(reply)) throw new Error('Balasan autentikasi server tidak valid.');
      setApiToken(reply.access_token);
      setUser(reply.user);
      notify(register ? 'Akun berhasil dibuat. Selamat datang!' : 'Berhasil masuk. Selamat datang kembali!');
      go('/dashboard');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Akun belum dapat diproses.');
    } finally {
      setLoading(false);
    }
  }

  return { name, setName, email, setEmail, password, setPassword, error, loading, submit };
}
