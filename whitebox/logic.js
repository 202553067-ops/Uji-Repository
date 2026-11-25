const TAX_RATE = 0.08;

function bulatkan(n) {
  return Math.round(n * 100) / 100;
}

function hitungTotal(harga) {
  if (!Array.isArray(harga)) throw new Error('Harga harus berupa array');
  const subtotal = harga.reduce((a, b) => a + b, 0);
  const tax = bulatkan(subtotal * TAX_RATE);
  return { subtotal: bulatkan(subtotal), tax, total: bulatkan(subtotal + tax) };
}

function validasiCheckout({ firstName, lastName, postalCode }) {
  if (!firstName) return 'First Name is required';
  if (!lastName) return 'Last Name is required';
  if (!postalCode) return 'Postal Code is required';
  return null;
}

function urutkanHarga(items, mode) {
  const salinan = [...items];
  if (mode === 'lohi') return salinan.sort((a, b) => a.harga - b.harga);
  if (mode === 'hilo') return salinan.sort((a, b) => b.harga - a.harga);
  throw new Error('Mode urutan tidak dikenal');
}

function tambahKeKeranjang(keranjang, produk) {
  if (keranjang.includes(produk)) return keranjang;
  return [...keranjang, produk];
}

module.exports = { hitungTotal, validasiCheckout, urutkanHarga, tambahKeKeranjang };