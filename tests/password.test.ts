import assert from 'node:assert/strict';
import test from 'node:test';
import { createCredentials, verifyPassword } from '../src/features/auth/password';

test('credentials use unique salts and verify only the correct password', async () => {
  const first = await createCredentials('contoh123');
  const second = await createCredentials('contoh123');
  assert.notEqual(first.salt, second.salt);
  assert.notEqual(first.digest, second.digest);
  const account = { name: 'Test', email: 'test@example.test', ...first };
  assert.equal(await verifyPassword('contoh123', account), true);
  assert.equal(await verifyPassword('salah123', account), false);
});

test('legacy credentials remain readable for migration', async () => {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('contoh123'));
  const digest = Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');
  assert.equal(
    await verifyPassword('contoh123', { name: 'Test', email: 'test@example.test', digest }),
    true,
  );
});
