-- D1 Schema for Sri Vari & Co backend

DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'staff')) DEFAULT 'staff',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS secondhand_mobiles;
CREATE TABLE secondhand_mobiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    serialNo INTEGER UNIQUE,
    purchaseDate DATETIME NOT NULL,
    modelName TEXT NOT NULL,
    imei1 TEXT NOT NULL UNIQUE,
    imei2 TEXT DEFAULT '',
    purchaseAmountCode TEXT,
    purchaseAmountNumeric REAL NOT NULL CHECK(purchaseAmountNumeric >= 0),
    ramRom TEXT DEFAULT '',
    seller TEXT DEFAULT '',
    salesDate DATETIME,
    salesAmount REAL CHECK(salesAmount >= 0),
    status TEXT CHECK(status IN ('IN_STOCK', 'SOLD', 'RETURNED', 'RETURNED_TO_SELLER')) DEFAULT 'IN_STOCK',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    returned INTEGER DEFAULT 0,
    returned_customer_name TEXT DEFAULT '',
    returned_date DATETIME,
    returned_reason TEXT DEFAULT '',
    returned_to_seller INTEGER DEFAULT 0
);

-- Index for IMEI lookups
CREATE INDEX IF NOT EXISTS idx_imei1 ON secondhand_mobiles(imei1);
CREATE INDEX IF NOT EXISTS idx_imei2 ON secondhand_mobiles(imei2);
