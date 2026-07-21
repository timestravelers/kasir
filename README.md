# 🛒 APLIKASI POS - Point of Sale System

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-amber?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![PWA](https://img.shields.io/badge/PWA-Ready-blue?style=for-the-badge)
![Deploy](https://img.shields.io/badge/deploy-Vercel-black?style=for-the-badge)

**Sistem Kasir Modern untuk Toko Grosir & Retail**

<a href="https://www.buymeacoffee.com/rakasyailendra"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=rakasyailendra&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>

[🚀 Live Demo](https://kasir-smoky-gamma.vercel.app) • [📖 Dokumentasi](#-dokumentasi) • [💬 WhatsApp](https://wa.me/6287888879016)

</div>

---

## 📋 Daftar Isi

- [Tentang Aplikasi](#-tentang-aplikasi)
- [Fitur Utama](#-fitur-utama)
- [Teknologi](#-teknologi)
- [Screenshot](#-screenshot)
- [Instalasi Lokal](#-instalasi-lokal)
- [Deploy ke Vercel](#-deploy-ke-vercel)
- [Setup Google Apps Script](#-setup-google-apps-script)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Struktur Aplikasi](#-struktur-aplikasi)
- [Roadmap](#-roadmap)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)
- [Kontak](#-kontak)

---

## 🎯 Tentang Aplikasi

**APLIKASI POS** adalah sistem Point of Sale (Kasir) berbasis web yang dirancang khusus untuk toko grosir dan retail di Indonesia. Aplikasi ini dibangun sebagai **Single Page Application (SPA)** dalam satu file HTML yang ringan, mudah di-deploy, dan siap digunakan.

### ✨ Keunggulan

- 🚀 **Ringan & Cepat** - Hanya 1 file HTML, tanpa build tools
- 📱 **PWA Ready** - Bisa di-install seperti aplikasi native di HP
- 🔐 **Multi-User** - Sistem login dengan PIN untuk keamanan
- 📊 **Laporan Lengkap** - Export PDF untuk akuntansi
- ☁️ **Cloud Sync** - Sinkronisasi dengan Google Spreadsheet
- 📷 **Barcode Scanner** - Scan barcode langsung dari kamera HP
- 💰 **Manajemen Hutang** - Fitur khusus untuk toko grosir
- 🌙 **Dark Mode** - Tampilan modern yang nyaman di mata

---

## ⭐ Fitur Utama

### 🔐 Keamanan & Akses
- [x] Login system dengan PIN 4 digit
- [x] Logout & session management
- [x] Pengaturan PIN custom

### 🛒 Manajemen Penjualan
- [x] Kasir dengan mode Retail & Grosir
- [x] Autocomplete nama barang
- [x] Perhitungan kembalian otomatis
- [x] Cetak faktur PDF dengan watermark "LUNAS"
- [x] Riwayat transaksi lengkap

### 📦 Manajemen Stok
- [x] Katalog barang dengan barcode
- [x] Scan barcode via kamera HP
- [x] Peringatan stok minimum
- [x] Input belanja/kulakan otomatis tambah stok
- [x] Pencarian barang real-time

### 💸 Keuangan
- [x] Pencatatan pengeluaran operasional
- [x] Perhitungan laba kotor & bersih
- [x] Grafik keuntungan bulanan (Chart.js)
- [x] Laporan hari ini, kemarin, & bulan ini

### 📒 Hutang & Piutang
- [x] Pencatatan hutang pelanggan
- [x] Pembayaran partial/full
- [x] Notifikasi jatuh tempo
- [x] Total outstanding display

### 📊 Laporan & Export
- [x] Filter laporan berdasarkan tanggal
- [x] Export laporan penjualan ke PDF
- [x] Export laporan stok ke PDF
- [x] Siap untuk akuntan

### ☁️ Sinkronisasi Cloud
- [x] Backup data ke Google Spreadsheet
- [x] Restore data dari Spreadsheet
- [x] Auto-sync setiap jam 23:00
- [x] 4 sheet terpisah (Katalog, Penjualan, Belanja, Pengeluaran)

### 📱 Progressive Web App
- [x] Installable di Android & iOS
- [x] Offline support
- [x] Service Worker
- [x] Splash screen & icon

---

## 🛠️ Teknologi

| Kategori | Teknologi |
|----------|-----------|
| **Frontend** | HTML5, Tailwind CSS, Vanilla JavaScript |
| **Icons** | FontAwesome 6.4 |
| **Charts** | Chart.js |
| **PDF Export** | jsPDF + AutoTable |
| **Barcode Scanner** | html5-qrcode |
| **Database** | LocalStorage + Google Apps Script |
| **Hosting** | Vercel (Recommended) |

---

## 📸 Screenshot

<div align="center">

| Login Screen | Main Menu | Kasir Penjualan |
|:---:|:---:|:---:|
| ![Login](https://placehold.co/300x600/18181b/fbbf24?text=Login+Screen) | ![Menu](https://placehold.co/300x600/18181b/fbbf24?text=Main+Menu) | ![Kasir](https://placehold.co/300x600/18181b/fbbf24?text=Kasir) |

| Laporan Keuntungan | Hutang Pelanggan | Settings |
|:---:|:---:|:---:|
| ![Laporan](https://placehold.co/300x600/18181b/fbbf24?text=Laporan) | ![Hutang](https://placehold.co/300x600/18181b/fbbf24?text=Hutang) | ![Settings](https://placehold.co/300x600/18181b/fbbf24?text=Settings) |

</div>

---

## 📥 Instalasi Lokal

### Prasyarat
- Browser modern (Chrome/Edge/Firefox/Safari)
- Koneksi internet (untuk CDN libraries)
- **HTTPS** diperlukan untuk fitur kamera scanner

