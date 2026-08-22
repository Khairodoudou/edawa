/**
 * push-schema-turso.ts
 * Pousse le schéma Prisma sur Turso Cloud via l'adapter libSQL
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/push-schema-turso.ts
 */

import { createClient } from "@libsql/client";

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;

if (!TURSO_URL || !TURSO_TOKEN) {
  console.error("❌ TURSO_DATABASE_URL et TURSO_AUTH_TOKEN sont requis");
  process.exit(1);
}

const SQL_STATEMENTS = `
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS "wilayas" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "code" INTEGER NOT NULL,
  "name" TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "wilayas_code_key" ON "wilayas"("code");

CREATE TABLE IF NOT EXISTS "medicines" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "genericName" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "form" TEXT NOT NULL,
  "dosage" TEXT NOT NULL,
  "manufacturer" TEXT NOT NULL,
  "image" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'PHARMACIST',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

CREATE TABLE IF NOT EXISTS "pharmacies" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "wilayaId" INTEGER NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "registrationNumber" TEXT NOT NULL,
  "hours" TEXT NOT NULL DEFAULT '08:00 — 20:00',
  "hoursWeekdays" TEXT NOT NULL DEFAULT 'الأحد — الخميس: 08:00 — 20:00',
  "hoursSaturday" TEXT NOT NULL DEFAULT 'الجمعة: 09:00 — 18:00',
  "hoursSunday" TEXT NOT NULL DEFAULT 'السبت: 09:00 — 18:00',
  "lat" REAL NOT NULL DEFAULT 36.7538,
  "lng" REAL NOT NULL DEFAULT 3.0588,
  "rating" REAL NOT NULL DEFAULT 0,
  "reviewCount" INTEGER NOT NULL DEFAULT 0,
  "isOpen" INTEGER NOT NULL DEFAULT 0,
  "isOnDuty" INTEGER NOT NULL DEFAULT 0,
  "image" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "ownerId" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "approvedAt" DATETIME,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "pharmacies_wilayaId_fkey" FOREIGN KEY ("wilayaId") REFERENCES "wilayas" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "pharmacies_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "pharmacies_email_key" ON "pharmacies"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "pharmacies_registrationNumber_key" ON "pharmacies"("registrationNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "pharmacies_ownerId_key" ON "pharmacies"("ownerId");

CREATE TABLE IF NOT EXISTS "stock_items" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "pharmacyId" TEXT NOT NULL,
  "medicineId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'UNAVAILABLE',
  "expiryDate" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "stock_items_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "stock_items_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "medicines" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "stock_items_pharmacyId_medicineId_key" ON "stock_items"("pharmacyId", "medicineId");

CREATE TABLE IF NOT EXISTS "exchange_requests" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "fromPharmacyId" TEXT NOT NULL,
  "toPharmacyId" TEXT NOT NULL,
  "medicineName" TEXT NOT NULL,
  "genericName" TEXT NOT NULL,
  "requestedQuantity" INTEGER NOT NULL,
  "offeredMedicine" TEXT,
  "offeredQuantity" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "exchange_requests_fromPharmacyId_fkey" FOREIGN KEY ("fromPharmacyId") REFERENCES "pharmacies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "exchange_requests_toPharmacyId_fkey" FOREIGN KEY ("toPharmacyId") REFERENCES "pharmacies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "pharmacyId" TEXT NOT NULL,
  "plan" TEXT NOT NULL,
  "startDate" DATETIME NOT NULL,
  "endDate" DATETIME NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "amount" INTEGER NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "subscriptions_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_pharmacyId_key" ON "subscriptions"("pharmacyId");

CREATE TABLE IF NOT EXISTS "payments" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "pharmacyId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "period" TEXT NOT NULL,
  "method" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "transactionRef" TEXT,
  "paidAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "payments_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "reports" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "pharmacyId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "reportedBy" TEXT NOT NULL DEFAULT 'مستخدم مجهول',
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "reports_pharmacyId_fkey" FOREIGN KEY ("pharmacyId") REFERENCES "pharmacies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "platform_stats" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "totalSearches" INTEGER NOT NULL DEFAULT 0,
  "totalPharmacies" INTEGER NOT NULL DEFAULT 0,
  "newPharmacies" INTEGER NOT NULL DEFAULT 0
);
`;

async function main() {
  console.log("🔗 Connexion à Turso Cloud...");
  console.log(`   URL: ${TURSO_URL}`);

  const client = createClient({
    url: TURSO_URL!,
    authToken: TURSO_TOKEN!,
  });

  const statements = SQL_STATEMENTS
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  console.log(`\n📋 Exécution de ${statements.length} statements SQL...\n`);

  let success = 0;
  let errors = 0;

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
      const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS "(\w+)"/)?.[1] ||
                        stmt.match(/CREATE UNIQUE INDEX.*ON "(\w+)"/)?.[1] ||
                        stmt.substring(0, 40).replace(/\n/g, " ");
      console.log(`  ✅ ${tableName}`);
      success++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Erreur: ${message}`);
      console.error(`     SQL: ${stmt.substring(0, 80)}...`);
      errors++;
    }
  }

  console.log(`\n📊 Résultat: ${success} succès, ${errors} erreurs`);

  if (errors === 0) {
    console.log("✅ Schéma Turso créé avec succès !");
  } else {
    console.log("⚠️  Certaines tables ont eu des erreurs (peut-être déjà existantes)");
  }

  // Vérification
  const tables = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
  );
  console.log("\n📋 Tables dans Turso:");
  tables.rows.forEach((row) => console.log(`   • ${row.name}`));
}

main().catch(console.error);
