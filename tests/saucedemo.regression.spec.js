// Simpan di folder "tests" pada proyek Playwright yang sama dengan Tugas 2.
// Jalankan: npx playwright test saucedemo.regression.spec.js --project=chromium --workers=2 --reporter=list
// Cara membaca hasil: tes yang GAGAL pada akun selain standard_user = regresi terdeteksi.
import { test, expect } from '@playwright/test';

const URL = 'https://www.saucedemo.com';
const PASSWORD = 'secret_sauce';
const USERS = ['standard_user', 'problem_user', 'error_user', 'visual_user', 'performance_glitch_user'];
const dt = (page, name) => page.locator(`[data-test="${name}"]`);

async function login(page, user) {
  await page.goto(URL);
  await dt(page, 'username').fill(user);
  await dt(page, 'password').fill(PASSWORD);
  await dt(page, 'login-button').click();
  // timeout panjang karena performance_glitch_user sengaja lambat
  await expect(page).toHaveURL(/inventory/, { timeout: 30000 });
}

async function fillCheckout(page) {
  await dt(page, 'shopping-cart-link').click();
  await dt(page, 'checkout').click();
  await dt(page, 'firstName').fill('Budi');
  await dt(page, 'lastName').fill('Santoso');
  await dt(page, 'postalCode').fill('59300');
  await dt(page, 'continue').click();
}

for (const user of USERS) {
  test.describe(`Regresi [${user}]`, () => {
    test.setTimeout(90000);

    test(`R-01 Login [${user}]`, async ({ page }) => {
      const start = Date.now();
      await login(page, user);
      console.log(`WAKTU LOGIN ${user}: ${((Date.now() - start) / 1000).toFixed(1)} detik`);
    });

    test(`R-02 Urutkan harga rendah ke tinggi [${user}]`, async ({ page }) => {
      await login(page, user);
      await dt(page, 'product-sort-container').selectOption('lohi');
      const texts = await page.locator('[data-test="inventory-item-price"]').allTextContents();
      const prices = texts.map(t => parseFloat(t.replace('$', '')));
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    test(`R-03 Tambah satu produk [${user}]`, async ({ page }) => {
      await login(page, user);
      await dt(page, 'add-to-cart-sauce-labs-backpack').click();
      await expect(dt(page, 'shopping-cart-badge')).toHaveText('1');
    });

    test(`R-04 Tambah 3 produk, hapus 1 [${user}]`, async ({ page }) => {
      await login(page, user);
      await dt(page, 'add-to-cart-sauce-labs-backpack').click();
      await dt(page, 'add-to-cart-sauce-labs-bike-light').click();
      await dt(page, 'add-to-cart-sauce-labs-bolt-t-shirt').click();
      await dt(page, 'remove-sauce-labs-bike-light').click();
      await expect(dt(page, 'shopping-cart-badge')).toHaveText('2');
    });

    test(`R-05 Checkout sampai selesai [${user}]`, async ({ page }) => {
      await login(page, user);
      await dt(page, 'add-to-cart-sauce-labs-backpack').click();
      await fillCheckout(page);
      await dt(page, 'finish').click();
      await expect(dt(page, 'complete-header')).toBeVisible();
    });

    test(`R-06 Total harga = barang + pajak [${user}]`, async ({ page }) => {
      await login(page, user);
      await dt(page, 'add-to-cart-sauce-labs-backpack').click();
      await fillCheckout(page);
      const num = async (name) =>
        parseFloat((await dt(page, name).textContent()).match(/\$([\d.]+)/)[1]);
      const subtotal = await num('subtotal-label');
      const tax = await num('tax-label');
      const total = await num('total-label');
      expect(Math.abs(subtotal + tax - total)).toBeLessThan(0.011);
      expect(Math.abs(tax - subtotal * 0.08)).toBeLessThan(0.011);
    });

    test(`R-07 Logout [${user}]`, async ({ page }) => {
      await login(page, user);
      await page.locator('#react-burger-menu-btn').click();
      await dt(page, 'logout-sidebar-link').click();
      await expect(dt(page, 'login-button')).toBeVisible();
    });

    test(`R-08 Gambar produk unik [${user}]`, async ({ page }) => {
      await login(page, user);
      const srcs = await page.locator('img.inventory_item_img')
        .evaluateAll(imgs => imgs.map(i => i.getAttribute('src')));
      expect(srcs.length).toBe(6);
      expect(new Set(srcs).size).toBe(6);
    });
  });
}

test('R-09 Akses inventory tanpa login', async ({ page }) => {
  await page.goto(URL + '/inventory.html');
  await expect(page).not.toHaveURL(/inventory/);
  await expect(dt(page, 'error')).toBeVisible();
});