import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createHash } from "crypto";
import path from "path";

const dbPath = path.resolve(process.cwd(), "prisma/dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath.replace(/\\/g, "/")}` });
const prisma = new PrismaClient({ adapter } as any);

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("🧨 Wiping all database tables (Keeping only Admin account)...");

  // 1. Delete all operational data
  await prisma.stockItem.deleteMany({});
  console.log("  ✔ Emptied stock_items");

  await prisma.exchangeRequest.deleteMany({});
  console.log("  ✔ Emptied exchange_requests");

  await prisma.payment.deleteMany({});
  console.log("  ✔ Emptied payments");

  await prisma.subscription.deleteMany({});
  console.log("  ✔ Emptied subscriptions");

  await prisma.report.deleteMany({});
  console.log("  ✔ Emptied reports");

  await prisma.pharmacy.deleteMany({});
  console.log("  ✔ Emptied pharmacies");

  await prisma.medicine.deleteMany({});
  console.log("  ✔ Emptied medicines");

  await prisma.platformStat.deleteMany({});
  console.log("  ✔ Emptied platform_stats");

  // 2. Delete all non-admin users
  await prisma.user.deleteMany({
    where: {
      email: { not: "admin@gmail.com" },
    },
  });
  console.log("  ✔ Deleted all non-admin user accounts");

  // 3. Ensure Admin account exists with requested credentials
  const adminPasswordHash = hashPassword("admin1234");
  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      passwordHash: adminPasswordHash,
      name: "مدير النظام",
      role: UserRole.ADMIN,
    },
    create: {
      email: "admin@gmail.com",
      passwordHash: adminPasswordHash,
      name: "مدير النظام",
      role: UserRole.ADMIN,
    },
  });
  console.log("  ✔ Confirmed Admin account:", admin.email, admin.role);

  // 4. Ensure Wilayas exist for pharmacy registration dropdowns (if empty, populate)
  const wilayaCount = await prisma.wilaya.count();
  if (wilayaCount === 0) {
    const wilayasData = [
      { code: 1, name: "أدرار" },
      { code: 2, name: "الشلف" },
      { code: 3, name: "الأغواط" },
      { code: 4, name: "أم البواقي" },
      { code: 5, name: "باتنة" },
      { code: 6, name: "بجاية" },
      { code: 7, name: "بسكرة" },
      { code: 9, name: "البليدة" },
      { code: 15, name: "تيزي وزو" },
      { code: 16, name: "الجزائر العاصمة" },
      { code: 19, name: "سطيف" },
      { code: 23, name: "عنابة" },
      { code: 25, name: "قسنطينة" },
      { code: 31, name: "وهران" },
      { code: 34, name: "برج بوعريريج" },
      { code: 35, name: "بومرداس" },
      { code: 36, name: "الطارف" },
      { code: 38, name: "تيسمسيلت" },
      { code: 41, name: "سوق أهراس" },
      { code: 42, name: "تيبازة" },
      { code: 44, name: "ميلة" },
      { code: 46, name: "عين الدفلى" },
    ];
    for (const w of wilayasData) {
      await prisma.wilaya.create({ data: w });
    }
    console.log("  ✔ Initialized Algerian Wilayas for registration dropdowns");
  }

  // 5. Final summary
  const counts = {
    users: await prisma.user.count(),
    pharmacies: await prisma.pharmacy.count(),
    medicines: await prisma.medicine.count(),
    stockItems: await prisma.stockItem.count(),
    exchangeRequests: await prisma.exchangeRequest.count(),
    subscriptions: await prisma.subscription.count(),
    payments: await prisma.payment.count(),
    reports: await prisma.report.count(),
    platformStats: await prisma.platformStat.count(),
  };

  console.log("\n📊 Final Database Summary:");
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .then(() => {
    console.log("\n✨ All tables successfully wiped, only Admin account remains!");
    process.exit(0);
  })
  .catch((e) => {
    console.error("❌ Error during wipe:", e);
    process.exit(1);
  });
