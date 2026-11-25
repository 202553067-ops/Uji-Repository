const test = require('node:test');
const assert = require('node:assert/strict');
const { hitungTotal, validasiCheckout, urutkanHarga, tambahKeKeranjang } = require('./logic.js');

// hitungTotal
test('hitungTotal: satu barang', () => {
  assert.deepEqual(hitungTotal([29.99]), { subtotal: 29.99, tax: 2.4, total: 32.39 });
});
test('hitungTotal: beberapa barang dijumlahkan', () => {
  assert.equal(hitungTotal([10, 20, 30]).subtotal, 60);
});
test('hitungTotal: pajak 8 persen', () => {
  assert.equal(hitungTotal([100]).tax, 8);
});
test('hitungTotal: total = subtotal + pajak', () => {
  assert.equal(hitungTotal([100]).total, 108);
});
test('hitungTotal: keranjang kosong', () => {
  assert.deepEqual(hitungTotal([]), { subtotal: 0, tax: 0, total: 0 });
});
test('hitungTotal: input bukan array melempar error', () => {
  assert.throws(() => hitungTotal('abc'), /array/);
});

// validasiCheckout
test('validasiCheckout: semua terisi', () => {
  assert.equal(validasiCheckout({ firstName: 'Budi', lastName: 'Santoso', postalCode: '59300' }), null);
});
test('validasiCheckout: nama depan kosong', () => {
  assert.equal(validasiCheckout({ firstName: '', lastName: 'S', postalCode: '1' }), 'First Name is required');
});
test('validasiCheckout: nama belakang kosong', () => {
  assert.equal(validasiCheckout({ firstName: 'B', lastName: '', postalCode: '1' }), 'Last Name is required');
});
test('validasiCheckout: kode pos kosong', () => {
  assert.equal(validasiCheckout({ firstName: 'B', lastName: 'S', postalCode: '' }), 'Postal Code is required');
});

// urutkanHarga
const barang = [{ harga: 30 }, { harga: 10 }, { harga: 20 }];
test('urutkanHarga: rendah ke tinggi', () => {
  assert.deepEqual(urutkanHarga(barang, 'lohi').map(b => b.harga), [10, 20, 30]);
});
test('urutkanHarga: tinggi ke rendah', () => {
  assert.deepEqual(urutkanHarga(barang, 'hilo').map(b => b.harga), [30, 20, 10]);
});
test('urutkanHarga: tidak mengubah array asli', () => {
  urutkanHarga(barang, 'lohi');
  assert.deepEqual(barang.map(b => b.harga), [30, 10, 20]);
});
test('urutkanHarga: mode tidak dikenal melempar error', () => {
  assert.throws(() => urutkanHarga(barang, 'xyz'), /tidak dikenal/);
});

// tambahKeKeranjang
test('tambahKeKeranjang: produk baru ditambahkan', () => {
  assert.deepEqual(tambahKeKeranjang(['a'], 'b'), ['a', 'b']);
});
test('tambahKeKeranjang: produk ganda tidak ditambahkan', () => {
  assert.deepEqual(tambahKeKeranjang(['a'], 'a'), ['a']);
});
test('tambahKeKeranjang: keranjang kosong', () => {
  assert.deepEqual(tambahKeKeranjang([], 'a'), ['a']);
});