const fs = require('fs');
const { spawnSync } = require('child_process');

const FILE = 'whitebox/logic.js';
const TEST = 'whitebox/logic.test.js';

const MUTAN = [
  { nama: 'M1 tarif pajak 0.08 -> 0.07', dari: 'const TAX_RATE = 0.08;', ke: 'const TAX_RATE = 0.07;' },
  { nama: 'M2 penjumlahan jadi pengurangan', dari: '(a, b) => a + b, 0', ke: '(a, b) => a - b, 0' },
  { nama: 'M3 cek nama depan dibalik', dari: 'if (!firstName)', ke: 'if (firstName)' },
  { nama: 'M4 cek nama belakang dihapus', dari: 'if (!lastName)', ke: 'if (false)' },
  { nama: 'M5 urutan lohi dibalik', dari: 'a.harga - b.harga', ke: 'b.harga - a.harga' },
  { nama: 'M6 mode hilo diganti lohi', dari: "mode === 'hilo'", ke: "mode === 'lohi'" },
  { nama: 'M7 cek duplikat keranjang dibalik', dari: 'keranjang.includes(produk)', ke: '!keranjang.includes(produk)' },
];

const asli = fs.readFileSync(FILE, 'utf8');
let terbunuh = 0;

try {
  for (const m of MUTAN) {
    if (!asli.includes(m.dari)) throw new Error('Teks mutan tidak ditemukan: ' + m.nama);
    fs.writeFileSync(FILE, asli.replace(m.dari, m.ke));
    const r = spawnSync(process.execPath, ['--test', TEST], { encoding: 'utf8' });
    const mati = r.status !== 0;
    if (mati) terbunuh++;
    console.log(`${mati ? 'TERBUNUH ' : 'SELAMAT  '} ${m.nama}`);
  }
} finally {
  fs.writeFileSync(FILE, asli); // selalu pulihkan file asli
}

console.log(`\nHasil: ${terbunuh} dari ${MUTAN.length} mutan terbunuh`);
console.log(`Skor mutasi: ${((terbunuh / MUTAN.length) * 100).toFixed(0)}%`);