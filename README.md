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
****
'python -m http.server 8000'

Buka `http://localhost:8000` (atau `http://IP-KOMPUTER:8000` dari HP di WiFi yang sama).

### Opsi 3 — Hosting Online (WAJIB untuk kamera & PWA di HP)
Upload ke hosting gratis dengan **HTTPS**:
- [Netlify Drop](https://app.netlify.com/drop) — drag & drop folder
- [Vercel](https://vercel.com)
- [GitHub Pages](https://pages.github.com)

> ⚠️ **PENTING:** Kamera & Service Worker **hanya berfungsi di HTTPS atau localhost**. Jika dibuka langsung dari file (`file://...`), fitur scan barcode tidak akan bekerja.

---

## 📷 Menggunakan Scanner Barcode

1. Buka form **Belanja**, **Penjualan**, atau **Tambah Barang**.
2. Klik tombol 📷 **Scan** di samping kolom barcode.
3. Izinkan akses kamera saat browser meminta.
4. Arahkan kamera ke barcode → hasil otomatis masuk ke kolom.
5. Gunakan tombol ⚡ **Senter** jika gelap (jika didukung perangkat).

**Format yang didukung:** QR Code, EAN-13, EAN-8, CODE-128, CODE-39, CODE-93, UPC-A, UPC-E.

---

## ☁️ Setup Sinkronisasi Google Spreadsheet

### Langkah 1 — Buat Apps Script
1. Buat **Google Sheets baru**.
2. Menu **Extensions → Apps Script**.
3. Hapus semua isi, paste kode di bawah ini.
4. Klik **Deploy → New deployment → Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Klik **Deploy**, lalu **copy URL** (`https://script.google.com/macros/s/.../exec`).

### Langkah 2 — Hubungkan Aplikasi
1. Buka aplikasi POS → menu **SINGKRON SPREADSHEET**.
2. Paste URL ke kolom yang tersedia.
3. Klik **Kirim / Backup Data** untuk sync pertama.
4. Semua sheet akan dibuat otomatis di Spreadsheet Anda. ✅

> 💡 Kode Apps Script juga tersedia di dalam aplikasi (menu Singkron Spreadsheet → tombol **Copy Code**).

### Struktur Sheet yang Dibuat Otomatis

| Sheet | Isi | Warna Tab |
|---|---|---|
| 📘 Katalog | Master barang (barcode, stok, harga) | Biru |
| 📗 Penjualan | Transaksi penjualan + laba kotor | Hijau |
| 📙 Belanja | Riwayat pembelian barang | Kuning |
| 📕 Pengeluaran | Pengeluaran operasional | Merah |
| 📙 Hutang | Piutang pelanggan & status lunas | Orange |
| 📕 Settings | PIN, nama toko, alamat, WA | Ungu |
| 📓 SyncLog | Riwayat sync (waktu, status, durasi) | Abu-abu |

### Perilaku Auto-Sync
- Setiap perubahan data (tambah/edit/hapus/transaksi) → otomatis sync ke Sheet.
- **Throttle 60 detik** agar tidak spam request & aplikasi tetap cepat.
- Sync berjalan di background (non-blocking), tidak mengganggu UI.
- Backup penuh terjadwal setiap **jam 23:00**.
- Indikator di header: 🟢 sukses • 🟡 sedang sync • 🔴 gagal/offline.

### Kode Apps Script

```javascript
// ========================================
// APLIKASI POS - GOOGLE SHEETS BACKEND
// ========================================
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    ["Katalog","Penjualan","Belanja","Pengeluaran","Hutang","Settings","SyncLog"]
      .forEach(function(n){ ensureSheetExists(ss, n); });
    var result = {
      status: "success",
      katalogData: getSheetData(ss, "Katalog"),
      penjualanHistory: getSheetData(ss, "Penjualan"),
      belanjaHistory: getSheetData(ss, "Belanja"),
      pengeluaranHistory: getSheetData(ss, "Pengeluaran"),
      hutangHistory: getSheetData(ss, "Hutang"),
      settings: getSheetData(ss, "Settings"),
      lastSync: new Date().toISOString()
    };
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var startTime = new Date();
    ["Katalog","Penjualan","Belanja","Pengeluaran","Hutang","Settings","SyncLog"]
      .forEach(function(n){ ensureSheetExists(ss, n); });
    var syncResults = [];
    if (data.katalogData) {
      syncSheet(ss, "Katalog", ["id","barcode","nama","stok","minStok","satuan","hargaPokok","hargaGrosir","hargaRetail"], data.katalogData);
      syncResults.push("Katalog: " + data.katalogData.length + " items");
    }
    if (data.penjualanHistory) {
      syncSheet(ss, "Penjualan", ["idPenjualan","tanggal","tipeCustomer","namaPembeli","totalHarga","dibayar","kembalian","labaKotor","items"], data.penjualanHistory);
      syncResults.push("Penjualan: " + data.penjualanHistory.length + " transaksi");
    }
    if (data.belanjaHistory) {
      syncSheet(ss, "Belanja", ["idBelanja","tanggal","totalHarga","items"], data.belanjaHistory);
      syncResults.push("Belanja: " + data.belanjaHistory.length + " transaksi");
    }
    if (data.pengeluaranHistory) {
      syncSheet(ss, "Pengeluaran", ["id","tanggal","keterangan","jumlah"], data.pengeluaranHistory);
      syncResults.push("Pengeluaran: " + data.pengeluaranHistory.length + " data");
    }
    if (data.hutangHistory) {
      syncSheet(ss, "Hutang", ["id","tanggal","nama","hp","jumlah","sisa","keterangan","jatuhTempo","lunas"], data.hutangHistory);
      syncResults.push("Hutang: " + data.hutangHistory.length + " data");
    }
    if (data.settings) {
      syncSheet(ss, "Settings", ["pin","namaToko","alamat","wa"], [data.settings]);
      syncResults.push("Settings: updated");
    }
    logSync(ss, startTime, "SUCCESS", syncResults.join(", "));
    return ContentService.createTextOutput(JSON.stringify({
      status: "success", message: "Data tersinkronisasi",
      syncResults: syncResults, timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    try { logSync(SpreadsheetApp.getActiveSpreadsheet(), new Date(), "ERROR", error.toString()); } catch(e) {}
    return ContentService.createTextOutput(JSON.stringify({
      status: "error", message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureSheetExists(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var colors = { "Katalog":"#4285f4","Penjualan":"#0f9d58","Belanja":"#f4b400",
      "Pengeluaran":"#db4437","Hutang":"#ff6d00","Settings":"#9c27b0","SyncLog":"#607d8b" };
    if (colors[sheetName]) sheet.setTabColor(colors[sheetName].substring(1));
  }
  return sheet;
}

function getSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  return data.slice(1).map(function(row){
    var obj = {};
    headers.forEach(function(h, i){
      if (!h) return;
      if ((h === "items" || h === "lunas") && typeof row[i] === "string") {
        if (row[i].startsWith("[") || row[i].startsWith("{")) {
          try { obj[h] = JSON.parse(row[i]); } catch (e) { obj[h] = row[i]; }
        } else if (h === "lunas") {
          obj[h] = String(row[i]).toLowerCase() === "true";
        } else { obj[h] = row[i]; }
      } else { obj[h] = row[i]; }
    });
    return obj;
  }).filter(function(obj){ return Object.keys(obj).length > 0; });
}

function syncSheet(ss, sheetName, headers, dataArray) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;
  sheet.clear();
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setValues([headers]);
  headerRange.setBackground("#1f2937");
  headerRange.setFontColor("#fbbf24");
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  if (dataArray.length === 0) return;
  var outputData = dataArray.map(function(item){
    return headers.map(function(h){
      var val = item[h];
      if (val === undefined || val === null) return "";
      if (typeof val === "object") return JSON.stringify(val);
      if (typeof val === "boolean") return val.toString();
      return val;
    });
  });
  sheet.getRange(2, 1, outputData.length, headers.length).setValues(outputData);
  for (var i = 1; i <= headers.length; i++) sheet.autoResizeColumn(i);
}

function logSync(ss, startTime, status, details) {
  var sheet = ss.getSheetByName("SyncLog");
  if (!sheet) return;
  var endTime = new Date();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Timestamp","Status","Duration","Details","User"]);
    sheet.getRange(1, 1, 1, 5).setBackground("#1f2937").setFontColor("#fbbf24").setFontWeight("bold");
  }
  sheet.appendRow([endTime.toISOString(), status, (endTime - startTime) + "ms", details,
    Session.getActiveUser().getEmail() || "Web App"]);
  if (sheet.getLastRow() > 101) sheet.deleteRow(2);
}

┌─────────────────────────────────────────────┐
│              AKSI PENGGUNA                  │
│   (tambah barang, transaksi, bayar hutang)  │
└──────────────────┬──────────────────────────┘
                   ▼
        ┌─────────────────────┐
        │  saveDataLocally()  │ ← instan, tidak blocking
        │   (localStorage)    │
        └──────────┬──────────┘
                   ▼
      ┌────────────────────────────┐
      │   scheduleCloudSync()      │ ← throttle 60 detik
      └────────────┬───────────────┘
                   ▼
        ┌──────────────────────┐
        │ requestIdleCallback  │ ← jalan saat browser idle
        └──────────┬───────────┘
                   ▼
       ┌───────────────────────┐
       │  executeCloudSync()   │ ← fetch background (keepalive)
       └──────────┬────────────┘
                  ▼
        ┌─────────────────────┐
        │   GOOGLE SHEET      │
        │ (Apps Script WebApp)│
        └─────────────────────┘
