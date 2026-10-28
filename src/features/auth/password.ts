/*
=============================
password
--> Membuat dan memverifikasi hash PBKDF2 dengan salt unik untuk akun simulasi.
=============================
*/

import type { Account } from './types';

const hex = (bytes: ArrayBuffer) =>
  Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');

export async function passwordDigest(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bytes = Uint8Array.from(salt.match(/.{2}/g) ?? [], (pair) => parseInt(pair, 16));
  return hex(
    await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt: bytes, iterations: 600000, hash: 'SHA-256' },
      key,
      256,
    ),
  );
}

export async function createCredentials(password: string) {
  const salt = hex(crypto.getRandomValues(new Uint8Array(16)).buffer);
  return { salt, digest: await passwordDigest(password, salt) };
}

export async function verifyPassword(password: string, account: Account) {
  // Akun SHA-256 lama tetap bisa masuk; kredensial dimigrasikan setelah verifikasi.
  const digest = account.salt
    ? await passwordDigest(password, account.salt)
    : hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)));
  return digest === account.digest;
}
