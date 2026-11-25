1.12




// Simpan file ini di folder "tests" pada proyek Playwright Anda.
// Catatan: skrip ini belum dijalankan oleh penyusun; jika ada selector yang gagal,
// periksa elemennya lewat F12 dan sesuaikan atribut data-test.
import { test, expect } from '@playwright/test';

const URL = 'https://www.saucedemo.com';
const dt = (page, name) => page.locator(`[data-test="${name}"]`);

async function login(page, user, pass = 'secret_sauce') {
  await page.goto(URL);
  await dt(page, 'username').fill(user);
  await dt(page, 'password').fill(pass);
  await dt(page, 'login-button').click();
}

test('TC-01 Login valid', async ({ page }) => {
  await login(page, 'standard_user');
  await expect(page).toHaveURL(/inventory/);
});

test('TC-02 Password salah', async ({ page }) => {
  await login(page, 'standard_user', 'salah123');
  await expect(dt(page, 'error')).toContainText('do not match');
});

test('TC-03 Akun terkunci', async ({ page }) => {
  await login(page, 'locked_out_user');
  await expect(dt(page, 'error')).toContainText('locked out');
});

test('TC-04 Username kosong', async ({ page }) => {
  await page.goto(URL);
  await dt(page, 'login-button').click();
  await expect(dt(page, 'error')).toContainText('Username is required');
});

test('TC-06 Tambah ke keranjang', async ({ page }) => {
  await login(page, 'standard_user');
  await dt(page, 'add-to-cart-sauce-labs-backpack').click();
  await expect(dt(page, 'shopping-cart-badge')).toHaveText('1');
});

test('TC-08 Checkout tanpa nama depan', async ({ page }) => {
  await login(page, 'standard_user');
  await dt(page, 'add-to-cart-sauce-labs-backpack').click();
  await dt(page, 'shopping-cart-link').click();
  await dt(page, 'checkout').click();
  await dt(page, 'lastName').fill('Santoso');
  await dt(page, 'postalCode').fill('59300');
  await dt(page, 'continue').click();
  await expect(dt(page, 'error')).toContainText('First Name is required');
});

test('TC-09 Checkout sampai selesai', async ({ page }) => {
  await login(page, 'standard_user');
  await dt(page, 'add-to-cart-sauce-labs-backpack').click();
  await dt(page, 'shopping-cart-link').click();
  await dt(page, 'checkout').click();
  await dt(page, 'firstName').fill('Budi');
  await dt(page, 'lastName').fill('Santoso');
  await dt(page, 'postalCode').fill('59300');
  await dt(page, 'continue').click();
  await dt(page, 'finish').click();
  await expect(dt(page, 'complete-header')).toBeVisible();
});

test('TC-11 Akses inventory tanpa login', async ({ page }) => {
  await page.goto(URL + '/inventory.html');
  await expect(page).not.toHaveURL(/inventory/);
  await expect(dt(page, 'error')).toBeVisible();
});

test('TC-12 Logout', async ({ page }) => {
  await login(page, 'standard_user');
  await page.locator('#react-burger-menu-btn').click();
  await dt(page, 'logout-sidebar-link').click();
  await expect(dt(page, 'login-button')).toBeVisible();
});