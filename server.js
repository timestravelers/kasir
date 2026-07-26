// ============================================================
// server.js - THORIQ POS v9.0
// SQLite Edition
// Logic dan struktur data dipertahankan
// ============================================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const Database = require('better-sqlite3');


// ============================================================
// EXPRESS & SOCKET.IO
// ============================================================

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json({
    limit: '100mb'
}));

app.use(express.static(
    path.join(__dirname, 'public')
));


// ============================================================
// DATABASE SQLITE
// ============================================================

const DB_FILE = path.join(
    __dirname,
    'thoriq_pos.db'
);

const LEGACY_DATA_FILE = path.join(
    __dirname,
    'database.json'
);


// Membuka database SQLite
const db = new Database(DB_FILE);


// Aktifkan WAL mode
// Lebih aman untuk aplikasi yang memiliki
// banyak proses baca/tulis
db.pragma('journal_mode = WAL');


// Membuat tabel penyimpanan utama
db.exec(`
    CREATE TABLE IF NOT EXISTS app_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);


// ============================================================
// DATA GLOBAL
// ============================================================

let appData = {};


// ============================================================
// HASH PASSWORD
// ============================================================

function hashPassword(message) {

    return crypto
        .createHash('sha256')
        .update(message)
        .digest('hex');

}


// ============================================================
// DEFAULT DATA
// ============================================================

const DEFAULT_DATA = {

    settings: {

        storeName: "THORIQ POS",

        storeAddress: "Jl. Contoh No. 1",

        storePhone: "0812-3456-7890",

        storeFooter:
            "Terima kasih atas kunjungan Anda.",

        helpContent:
            "PANDUAN THORIQ POS v9.0\n\n" +

            "[TRANSAKSI]\n" +

            "- F2: Ke Transaksi\n" +

            "- F4: Bayar\n" +

            "- F9: Batal\n" +

            "- F10: Keluar\n\n" +

            "[RETUR]\n" +

            "- Kasir: Ajukan retur (butuh approval)\n" +

            "- Admin: Approve/Reject retur\n\n" +

            "=== Dikembangkan oleh Muhamad Thorik ===",

        categories: [

            "MAKANAN",

            "MINUMAN",

            "SNACK"

        ],

        taxRate: 0,

        taxEnabled: false,

        discountRate: 0,

        discountEnabled: false,

        printerType: "THERMAL_58",

        barcodePrefix: "ID",

        lowStockThreshold: 10,

        memberDiscount: {

            UMUM: 0,

            SILVER: 2,

            GOLD: 5,

            PLATINUM: 10

        }

    },


    users: {

        admin: {

            username: "admin",

            password: "admin123",

            passwordHash: "",

            role: "admin",

            isDefault: true,

            fullName: "Administrator"

        },


        kasir: {

            username: "kasir",

            password: "kasir123",

            passwordHash: "",

            role: "kasir",

            isDefault: true,

            fullName: "Kasir"

        }

    },


    warehouses: [

        {

            id: "WH-MAIN",

            name: "GUDANG UTAMA",

            address: "Toko Utama",

            isDefault: true

        }

    ],


    suppliers: [],


    customers: [

        {

            id: "CUST-001",

            name: "UMUM",

            phone: "-",

            email: "-",

            level: "UMUM",

            totalPurchase: 0,

            totalTransaction: 0,

            joinDate: new Date().toISOString(),

            points: 0

        }

    ],


    products: [

        {

            id: "PROD-001",

            name: "INDOMIE GORENG",

            category: "MAKANAN",

            baseUnit: "PCS",

            stock: 100,

            costPrice: 2800,

            price: 3500,

            barcode: "8991001",

            minStock: 20,


            locations: {

                "WH-MAIN": 100

            },


            units: [

                {

                    name: "PCS",

                    ratio: 1,

                    barcode: "8991001",

                    price: 3500,

                    costPrice: 2800

                }

            ]

        }

    ],


    displaySettings: {

        announcements: [

            {

                id: 1,

                text: "SELAMAT DATANG DI THORIQ POS",

                color: "#FFFF00",

                duration: 5000

            }

        ],


        todayDiscounts: [

            {

                id: 1,

                text: "DISKON 10% SEMUA MINUMAN",

                color: "#00FF00",

                duration: 5000

            }

        ],


        rewards: [

            {

                id: 1,

                text: "BELI 10 GRATIS 1 INDOMIE",

                color: "#FF8800",

                duration: 5000

            }

        ],


        backgroundColor: "#0000AA",

        textColor: "#FFFFFF",

        slideInterval: 5000,

        showClock: true,

        showStoreName: true

    },


    transactions: [],

    purchases: [],

    returns: [],

    purchaseReturns: [],

    pendingApprovals: [],

    stockMovements: [],

    stockOpnames: [],

    expenses: [],

    debts: [],

    receivables: [],


    auth: {

        isLoggedIn: false,

        username: "",

        role: ""

    }

};


// ============================================================
// SQLITE HELPER
// ============================================================


// Mengambil data dari SQLite
function readFromDatabase() {

    const row = db
        .prepare(`
            SELECT data
            FROM app_state
            WHERE id = 1
        `)
        .get();


    if (!row) {

        return null;

    }


    try {

        return JSON.parse(row.data);

    } catch (error) {

        console.error(
            '❌ Gagal membaca data SQLite:',
            error.message
        );

        return null;

    }

}


// Menyimpan data ke SQLite
function writeToDatabase(data) {

    const jsonData =
        JSON.stringify(data);


    db.prepare(`
        INSERT INTO app_state (
            id,
            data,
            updated_at
        )

        VALUES (
            1,
            ?,
            CURRENT_TIMESTAMP
        )

        ON CONFLICT(id)

        DO UPDATE SET

            data = excluded.data,

            updated_at = CURRENT_TIMESTAMP

    `).run(jsonData);

}


// ============================================================
// LOAD DATA
// ============================================================

function loadData() {

    let needSave = false;


    // ========================================================
    // 1. COBA BACA SQLITE
    // ========================================================

    const sqliteData =
        readFromDatabase();


    if (sqliteData) {

        appData = sqliteData;

        console.log(
            '✅ Data dimuat dari SQLite'
        );

    }


    // ========================================================
    // 2. JIKA SQLITE KOSONG
    //    COBA MIGRASI database.json
    // ========================================================

    else if (
        fs.existsSync(LEGACY_DATA_FILE)
    ) {

        try {

            console.log(
                '🔄 Memigrasikan database.json ke SQLite...'
            );


            appData = JSON.parse(
                fs.readFileSync(
                    LEGACY_DATA_FILE,
                    'utf8'
                )
            );


            writeToDatabase(appData);


            console.log(
                '✅ Migrasi database.json → SQLite berhasil'
            );


        } catch (error) {

            console.error(
                '❌ Gagal migrasi database.json:',
                error.message
            );


            appData =
                JSON.parse(
                    JSON.stringify(DEFAULT_DATA)
                );

        }

    }


    // ========================================================
    // 3. JIKA SEMUANYA BELUM ADA
    // ========================================================

    else {

        appData =
            JSON.parse(
                JSON.stringify(DEFAULT_DATA)
            );


        needSave = true;

    }


    // ========================================================
    // VALIDASI STRUKTUR DATA
    // ========================================================

    if (!appData.settings) {

        appData.settings =
            JSON.parse(
                JSON.stringify(
                    DEFAULT_DATA.settings
                )
            );

        needSave = true;

    }


    if (!appData.users) {

        appData.users =
            JSON.parse(
                JSON.stringify(
                    DEFAULT_DATA.users
                )
            );

        needSave = true;

    }


    if (!appData.products) {

        appData.products = [];

        needSave = true;

    }


    if (!appData.transactions) {

        appData.transactions = [];

        needSave = true;

    }


    if (!appData.purchases) {

        appData.purchases = [];

        needSave = true;

    }


    if (!appData.returns) {

        appData.returns = [];

        needSave = true;

    }


    if (!appData.purchaseReturns) {

        appData.purchaseReturns = [];

        needSave = true;

    }


    if (!appData.pendingApprovals) {

        appData.pendingApprovals = [];

        needSave = true;

    }


    if (!appData.stockMovements) {

        appData.stockMovements = [];

        needSave = true;

    }


    if (!appData.stockOpnames) {

        appData.stockOpnames = [];

        needSave = true;

    }


    if (!appData.expenses) {

        appData.expenses = [];

        needSave = true;

    }


    if (!appData.debts) {

        appData.debts = [];

        needSave = true;

    }


    if (!appData.receivables) {

        appData.receivables = [];

        needSave = true;

    }


    if (!appData.warehouses) {

        appData.warehouses =

            JSON.parse(
                JSON.stringify(
                    DEFAULT_DATA.warehouses
                )
            );

        needSave = true;

    }


    if (!appData.suppliers) {

        appData.suppliers = [];

        needSave = true;

    }


    if (!appData.customers) {

        appData.customers =

            JSON.parse(
                JSON.stringify(
                    DEFAULT_DATA.customers
                )
            );

        needSave = true;

    }


    if (!appData.displaySettings) {

        appData.displaySettings =

            JSON.parse(
                JSON.stringify(
                    DEFAULT_DATA.displaySettings
                )
            );

        needSave = true;

    }


    if (
        !appData.settings.lowStockThreshold
    ) {

        appData.settings.lowStockThreshold = 10;

        needSave = true;

    }


    if (
        !appData.settings.printerType
    ) {

        appData.settings.printerType =
            "THERMAL_58";

        needSave = true;

    }


    if (
        !appData.settings.memberDiscount
    ) {

        appData.settings.memberDiscount =

            JSON.parse(
                JSON.stringify(
                    DEFAULT_DATA.settings.memberDiscount
                )
            );

        needSave = true;

    }


    // ========================================================
    // NORMALISASI USER
    // ========================================================

    Object.keys(
        appData.users
    ).forEach(key => {

        const user =
            appData.users[key];


        if (
            !user.passwordHash &&
            user.password
        ) {

            user.passwordHash =
                hashPassword(
                    user.password
                );


            needSave = true;

        }

    });


    // ========================================================
    // NORMALISASI PRODUK
    // ========================================================

    appData.products.forEach(product => {


        if (!product.locations) {

            product.locations = {

                "WH-MAIN":
                    product.stock || 0

            };


            needSave = true;

        }


        if (
            !product.units ||
            product.units.length === 0
        ) {

            product.units = [

                {

                    name:
                        product.baseUnit ||
                        'PCS',

                    ratio: 1,

                    barcode:
                        product.barcode,

                    price:
                        product.price,

                    costPrice:
                        product.costPrice || 0

                }

            ];


            needSave = true;

        }


        if (!product.minStock) {

            product.minStock = 10;

            needSave = true;

        }


        if (
            product.status === undefined
        ) {

            product.status = 'ACTIVE';

            needSave = true;

        }

    });


    // ========================================================
    // NORMALISASI TRANSAKSI
    // ========================================================

    appData.transactions.forEach(
        transaction => {

            if (
                transaction.status === undefined
            ) {

                transaction.status = 'ACTIVE';

                needSave = true;

            }

        }
    );


    // ========================================================
    // NORMALISASI PEMBELIAN
    // ========================================================

    appData.purchases.forEach(
        purchase => {

            if (
                purchase.status === undefined
            ) {

                purchase.status = 'ACTIVE';

                needSave = true;

            }

        }
    );


    // ========================================================
    // SIMPAN PERUBAHAN
    // ========================================================

    if (needSave) {

        saveData(true);

    }

}


// ============================================================
// SAVE DATA
// ============================================================

function saveData(silent = false) {


    // SIMPAN KE SQLITE

    writeToDatabase(
        appData
    );


    // NOTIFIKASI CLIENT

    if (!silent) {

        io.emit(
            'data_updated',
            appData
        );


        io.emit(
            'display_updated',
            appData.displaySettings
        );

    }

}


// ============================================================
// API DATA
// ============================================================

app.get(
    '/api/data',
    (req, res) => {

        res.json(
            appData
        );

    }
);


app.get(
    '/api/display',
    (req, res) => {

        res.json(
            appData.displaySettings
        );

    }
);


app.post(
    '/api/data',
    (req, res) => {

        appData =
            req.body;


        saveData();


        res.json({

            success: true

        });

    }
);


app.post(
    '/api/display',
    (req, res) => {

        appData.displaySettings =
            req.body;


        saveData();


        res.json({

            success: true

        });

    }
);


// ============================================================
// SOCKET.IO
// ============================================================

io.on(
    'connection',
    (socket) => {


        console.log(
            '✅ Klien terhubung:',
            socket.id
        );


        socket.emit(
            'data_updated',
            appData
        );


        socket.emit(
            'display_updated',
            appData.displaySettings
        );


        socket.on(
            'save_data',
            (newData) => {

                appData =
                    newData;


                saveData();

            }
        );


        socket.on(
            'update_display',
            (newDisplay) => {

                appData.displaySettings =
                    newDisplay;


                saveData();

            }
        );


        socket.on(
            'disconnect',
            () => {

                console.log(
                    '❌ Klien terputus:',
                    socket.id
                );

            }
        );

    }
);


// ============================================================
// LOAD DATA SEBELUM SERVER START
// ============================================================

loadData();


// ============================================================
// SERVER
// ============================================================

const PORT = 8000;


server.listen(
    PORT,
    '0.0.0.0',
    () => {


        console.log(
            `\n══════════════════════════════════════════════╗`
        );


        console.log(
            `║   THORIQ POS v9.0 - RETUR & APPROVAL        ║`
        );


        console.log(
            `║   Dikembangkan oleh: Muhamad Thorik         ║`
        );


        console.log(
            `══════════════════════════════════════════════`
        );


        console.log(
            `║   Aplikasi  : http://localhost:${PORT}         `
        );


        console.log(
            `║   Display 2 : http://localhost:${PORT}/display.html`
        );


        console.log(
            `║   Produk    : ${String(appData.products.length).padEnd(28)}║`
        );


        console.log(
            `══════════════════════════════════════════════╝\n`
        );


    }
);