# 🏪 APLIKASI POS — Point of Sale System

Aplikasi kasir lengkap berbasis web (single-file HTML) dengan fitur manajemen stok, penjualan, pembelian, hutang/piutang, laporan keuangan, hingga sinkronisasi otomatis ke **Google Spreadsheet**. Siap di-install sebagai aplikasi (PWA) di HP Android/iOS.

> 💾 **LocalStorage-first** — aplikasi tetap cepat & bisa dipakai offline, lalu otomatis backup ke Google Sheet di background.

---

## ✨ Fitur Utama

| Modul | Keterangan |
|---|---|
| 🔐 **Login PIN** | Keamanan akses dengan PIN 4 digit (default: `1234`) |
| 📦 **Katalog Stok** | CRUD barang, barcode, harga pokok/grosir/retail, peringatan stok minimum |
| 🛒 **Belanja Barang** | Input pembelian supplier → otomatis menambah stok |
| 💵 **Penjualan (Kasir)** | Transaksi retail/grosir, keranjang, hitung kembalian, potong stok otomatis |
| 💸 **Pengeluaran Lain** | Catat pengeluaran operasional (PLN, bensin, dll) |
| 📋 **Hutang/Piutang** | Catat hutang pelanggan, cicilan pembayaran, jatuh tempo & status LUNAS |
| 📊 **Laporan Keuntungan** | Laba harian/bulanan + grafik Chart.js per bulan |
| 📄 **Export PDF** | Laporan penjualan, laporan stok, dan faktur penjualan (watermark LUNAS) |
| 📷 **Scan Barcode** | Kamera HP via library `html5-qrcode` (EAN-13, CODE-128, QR, dll) + tombol flash |
| ☁️ **Auto-Sync Google Sheet** | Sinkron otomatis setiap perubahan (throttle 60 detik) + backup penuh jam 23:00 |
| 📱 **PWA Ready** | Install ke layar utama HP seperti aplikasi native |

---

## 🛠️ Teknologi

| Library | Versi | Fungsi |
|---|---|---|
| Tailwind CSS | CDN | Styling |
| Font Awesome | 6.4.0 | Ikon |
| Chart.js | latest | Grafik keuntungan |
| html5-qrcode | 2.3.8 | Scanner barcode/QR |
| jsPDF + autotable | 2.5.1 | Export PDF |
| Google Apps Script | Web App | Backend Google Spreadsheet |

**Storage:** `localStorage` browser (6 key: katalog, belanja, penjualan, pengeluaran, hutang, settings)

---

## 🚀 Cara Install & Menjalankan

### Opsi 1 — Langsung (Desktop)
Buka file `index.html` di browser (Chrome/Edge/Firefox). Login dengan PIN **1234**.

### Opsi 2 — Local Server (untuk test kamera di HP)
