import { expect, test, type Page } from '@playwright/test';

async function openDemo(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Jelajahi demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Halo, Sahabat/ })).toBeVisible();
}

test('demo, tab keyboard, carousel, recipe focus and grocery persistence', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openDemo(page);
  await page.goto('/#/rencana');
  await expect(page.getByRole('heading', { name: 'Rencana Makan Anda' })).toBeVisible();
  await page.getByRole('tab', { name: /Hari 1/ }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: /Hari 2/ })).toHaveAttribute('aria-selected', 'true');
  const breakfast = page.getByRole('button', { name: /Sarapan/ });
  await breakfast.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('button', { name: /Makan Siang/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Lihat Resep' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Cara memasak' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Lihat Resep' })).toBeFocused();
  await page.goto('/#/belanja');
  const first = page.getByRole('checkbox').first();
  const label = await first.getAttribute('aria-label');
  await first.check();
  await page.reload();
  await expect(page.getByRole('checkbox', { name: label ?? '' })).toBeChecked();
  if (test.info().project.name === 'mobile') {
    const table = page.getByRole('region', { name: 'Rincian belanja Sayuran' });
    await table.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(() => table.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
  await page.screenshot({
    path: `test-results/grocery-${test.info().project.name}.png`,
    fullPage: true,
  });
});

test('pantry validates quantities, updates totals and deletes ingredients', async ({ page }) => {
  await openDemo(page);
  await page.goto('/#/stok');
  await page.getByRole('button', { name: 'Ubah Beras', exact: true }).click();
  let dialog = page.getByRole('dialog');
  await dialog.getByRole('spinbutton').fill('-1');
  await dialog.getByRole('button', { name: 'Simpan Bahan' }).click();
  await expect(dialog.getByRole('alert')).toContainText('tidak boleh negatif');
  await dialog.getByRole('spinbutton').fill('2000');
  await dialog.getByRole('button', { name: 'Simpan Bahan' }).click();
  await expect(page.getByText('2.000 g')).toBeVisible();
  await page.reload();
  await expect(page.getByText('2.000 g')).toBeVisible();
  await page.getByRole('button', { name: 'Hapus Beras', exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Hapus Bahan' }).click();
  await expect(page.getByRole('heading', { name: 'Beras', exact: true })).toHaveCount(0);
});

test('wizard computes seven days using worker and preserves chosen portions', async ({ page }) => {
  await openDemo(page);
  await page.goto('/#/buat-rencana');
  await page.getByRole('spinbutton').fill('3');
  await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await page.getByRole('button', { name: '7 hari', exact: true }).click();
  await page.getByLabel(/Total anggaran belanja/).fill('1000000');
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await page.getByRole('button', { name: 'Buat Rencana Makan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Rencana Makan Anda' })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(7);
  await expect(page.getByText('3 porsi setiap menu')).toBeVisible();
});

test('restrictions remain mandatory and preference draft only saves on request', async ({
  page,
}) => {
  await openDemo(page);
  await page.goto('/#/preferensi');
  await page.getByRole('button', { name: 'Beras', exact: true }).last().click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Beras', exact: true }).last()).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await page.getByRole('button', { name: 'Beras', exact: true }).last().click();
  await page.getByRole('button', { name: 'Simpan Preferensi', exact: true }).first().click();
  await page.goto('/#/buat-rencana');
  for (let i = 0; i < 4; i++)
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await page.getByRole('button', { name: 'Buat Rencana Makan', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Belum ada menu yang sesuai.' })).toBeVisible();
  await page.getByRole('button', { name: 'Tinjau Preferensi' }).click();
  await expect(page.getByRole('button', { name: 'Beras', exact: true }).last()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('small budget clearly labels cheapest alternative as over budget', async ({ page }) => {
  await openDemo(page);
  await page.goto('/#/buat-rencana');
  await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await page.getByLabel(/Total anggaran belanja/).fill('1');
  for (let i = 0; i < 3; i++)
    await page.getByRole('button', { name: 'Lanjut', exact: true }).click();
  await page.getByRole('button', { name: 'Buat Rencana Makan', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Anggaran belum mencukupi untuk rencana ini.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Lihat Alternatif Termurah' }).click();
  await expect(page.getByText('Alternatif ini masih melebihi anggaran.')).toBeVisible();
});

test('registration isolates pantry from demo and login restores its own data', async ({ page }) => {
  await openDemo(page);
  await page.goto('/#/daftar');
  await page.getByLabel('Nama pengguna', { exact: true }).fill('Penguji');
  await page.getByLabel('Alamat email', { exact: true }).fill('penguji@example.test');
  await page.getByLabel('Kata sandi', { exact: true }).fill('contoh123');
  await page.getByRole('button', { name: 'Daftar Gratis', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Halo, Penguji/ })).toBeVisible();
  await page.goto('/#/stok');
  await expect(page.getByRole('heading', { name: 'Dapur Anda siap diisi' })).toBeVisible();
  await page.getByRole('button', { name: 'Tambah Bahan', exact: true }).click();
  await page.getByRole('dialog').getByRole('spinbutton').fill('321');
  await page.getByRole('dialog').getByRole('button', { name: 'Simpan Bahan' }).click();
  await page.goto('/#/masuk');
  await page.getByRole('button', { name: /Jelajahi dengan Akun Demo/ }).click();
  await page.goto('/#/stok');
  await expect(page.getByText('1.000 g')).toBeVisible();
  await page.goto('/#/masuk');
  await page.getByLabel('Nama pengguna atau email', { exact: true }).fill('penguji@example.test');
  await page.getByLabel('Kata sandi', { exact: true }).fill('contoh123');
  await page.getByRole('button', { name: 'Masuk', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Halo, Penguji/ })).toBeVisible();
  await page.goto('/#/stok');
  await expect(page.getByText('321 g')).toBeVisible();
  await page.reload();
  await expect(page.getByText('321 g')).toBeVisible();
});

test('invalid saved objects and unavailable storage do not crash startup', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('pb-session', '{"name":42}');
    localStorage.setItem('pb-stock', '{"unknown":12}');
  });
  await page.goto('/#/stok');
  await expect(page.getByRole('heading', { name: 'Selamat datang kembali' })).toBeVisible();
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('disabled', 'QuotaExceededError');
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Jelajahi demo', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Halo, Sahabat/ })).toBeVisible();
  await expect(page.getByText(/Sesi belum dapat disimpan/)).toBeVisible();
  await page.getByRole('link', { name: 'Lihat Rencana', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Rencana Makan Anda' })).toBeVisible();
});

test('failed lazy page provides a retry action', async ({ page }) => {
  await openDemo(page);
  await page.route('**/assets/Profile-*.js', (route) => route.abort());
  await page.goto('/#/profil');
  await expect(page.getByRole('heading', { name: 'Bagian ini belum dapat dimuat' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Muat ulang halaman' })).toBeVisible();
});
