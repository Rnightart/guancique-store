# Gancique Store 🔑

Website e-commerce untuk toko keychain custom — dibangun dengan HTML/CSS/JavaScript murni di sisi frontend, dan Node.js + Express + SQLite di sisi backend.

---

## Fitur

**Belanja**
- Halaman produk dengan filter kategori, harga, dan sorting
- Live search
- Detail produk (galeri gambar, pilihan warna, quantity, related products, bundle)
- Keranjang belanja (drawer), wishlist, dark mode, back-to-top, scroll progress

**Akun & Backend**
- Register / Login / Logout (session-based, password di-hash pakai bcrypt)
- Profil pengguna & riwayat pesanan
- Checkout simulasi (jadi order beneran tersimpan di database)
- Admin Panel: tambah / edit / hapus produk & kategori

---

## Struktur Folder

```
gancique-store/
├── index.html, products.html, product-detail.html   ← halaman toko
├── about.html, contact.html, 404.html
├── login.html, register.html, account.html           ← akun pengguna
├── admin.html                                          ← panel admin (khusus admin)
├── css/            → style.css, responsive.css
├── js/
│   ├── main.js      → render produk, navigasi, search, filter
│   ├── cart.js       → logika keranjang & wishlist
│   └── api.js         → penghubung ke backend (fetch API)
└── backend/            ← server Node.js + database
    ├── server.js
    ├── config/database.js     (skema + data awal database)
    ├── controllers/, routes/, middleware/, utils/
    └── db/gancique.sqlite      (dibuat otomatis, jangan diedit manual)
```

---

## Cara Menjalankan (Lokal, di Laptop Sendiri)

Nggak butuh internet, hosting, atau GitHub — cukup di laptop kamu.

```bash
cd backend
npm install                     # sekali aja, install semua library
cp .env.example .env            # bikin file konfigurasi (lihat catatan di bawah)
npm run dev                     # jalankan server
```

Setelah muncul tulisan `Gancique Store API listening on http://localhost:4000`,
buka browser ke **http://localhost:4000** — itu sudah langsung website lengkap
(frontend + backend jalan bareng dalam satu server, satu port).

> **Penting:** server (`npm run dev`) harus tetap nyala selama kamu pakai
> website-nya. Kalau CMD/terminalnya ditutup, server mati dan website nggak
> bisa diakses sampai dijalankan ulang. Data yang sudah tersimpan (produk,
> akun, order) tidak hilang — cukup `npm run dev` lagi untuk menyalakannya.

### Akun admin bawaan
Login admin otomatis dibuat saat pertama kali server jalan, dari nilai di
file `.env`:
```
ADMIN_EMAIL=admin@ganciquestore.com
ADMIN_PASSWORD=ChangeMe123!
```
Login di `/login.html` pakai akun ini untuk mengakses `/admin.html`.

---

## Cara Menambah / Mengedit Produk

**Lewat Admin Panel (cara yang seharusnya dipakai):**
1. Pastikan server nyala (`npm run dev`)
2. Login sebagai admin → buka `localhost:4000/admin.html`
3. Isi form produk/kategori → klik Add/Save
4. Refresh halaman toko → produk baru langsung muncul (tersimpan di database)

**Lewat kode (untuk ubah tampilan/desain, bukan data produk):**
Edit file di `css/` atau `js/` pakai VS Code kapan saja. Perubahan baru
kelihatan setelah: file di-save → server sedang nyala → browser di-refresh.

---

## Dokumentasi Lengkap Backend

Untuk detail lebih dalam — semua endpoint API, cara kerja database,
mode "combined vs split" (satu server vs dua server terpisah), sampai
cara deploy ke VPS pakai PM2 + Nginx kalau nanti sudah siap online —
lihat **[`backend/README.md`](backend/README.md)**.

---

## Troubleshooting Cepat

| Masalah | Solusi |
|---|---|
| `npm install` error soal compile/`node-gyp` | Pastikan pakai `package.json` versi terbaru (better-sqlite3 v13+), biasanya karena versi Node terlalu baru untuk versi lama library ini |
| Error `EPERM` / `operation not permitted` saat install | Pindahkan folder project keluar dari `Documents` (biasanya di-sync OneDrive) ke folder lain seperti `C:\projects` |
| Windows Defender minta izin firewall | Centang "Private networks", klik Allow access — ini normal, bukan error |
| Produk baru dari Admin Panel tidak muncul di toko | Pastikan pakai versi `js/main.js` terbaru — versi lama masih baca data statis, bukan dari database |
| `localhost:4000` tidak bisa diakses | Cek apakah CMD yang menjalankan `npm run dev` masih terbuka dan tidak error |
