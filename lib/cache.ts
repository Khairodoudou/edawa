// ================================================
// Data Cache Layer — دوائي Platform (Next.js 16)
// ================================================
// Connects to Prisma DB directly with `use cache` and granular `cacheLife`/`cacheTag`

import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "./prisma";
import { paginate, type PaginateOptions } from "./api-utils";
import type { Pharmacy, StockItem, Wilaya, Medicine, AdminPharmacy } from "./mock-data";

// Helper to format Prisma Pharmacy model to standard frontend shape
function formatPharmacy(ph: any): Pharmacy {
  return {
    id: ph.id,
    name: ph.name,
    address: ph.address,
    city: ph.city,
    wilaya: ph.wilaya?.name || "الجزائر",
    phone: ph.phone,
    email: ph.email || "",
    status: ph.status ? (ph.status.toLowerCase() as any) : "active",
    registrationNumber: ph.registrationNumber,
    hours: ph.hours,
    hoursDetail: {
      weekdays: ph.hoursWeekdays,
      saturday: ph.hoursSaturday,
      sunday: ph.hoursSunday,
    },
    lat: ph.lat || 36.7538,
    lng: ph.lng || 3.0588,
    rating: ph.rating,
    reviewCount: ph.reviewCount,
    isOpen: ph.isOpen,
    isOnDuty: ph.isOnDuty,
    image: ph.image || undefined,
    stock: (ph.stock || []).map((s: any) => ({
      medicineId: s.medicineId,
      medicineName: s.medicine?.name || s.medicineName || "",
      genericName: s.medicine?.genericName || "",
      category: s.medicine?.category || "",
      available: s.status === "AVAILABLE",
      quantity: s.quantity,
      status: s.status.toLowerCase() as "available" | "limited" | "unavailable",
    })),
  };
}

// ========================
// Public Data — Pharmacies
// ========================

export async function getCachedPharmacies(): Promise<Pharmacy[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag("pharmacies");

  const list = await prisma.pharmacy.findMany({
    where: { status: "ACTIVE" },
    include: {
      wilaya: true,
      stock: {
        include: { medicine: true },
      },
    },
    orderBy: { rating: "desc" },
  });

  return list.map(formatPharmacy);
}

function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents (é, è, ê, etc.)
    .replace(/[أإآ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/[\u064B-\u065F\u0670]/g, "") // Remove tashkeel
    .trim();
}

const MEDICINE_SEARCH_SYNONYMS: Record<string, string[]> = {
  باراسيتامول: ["paracetamol", "paracetamol", "doliprane", "panadol", "efferalgan", "باراسيتامول", "دوليبران"],
  paracetamol: ["باراسيتامول", "paracetamol", "doliprane", "panadol", "efferalgan"],
  دوليبران: ["doliprane", "paracetamol", "باراسيتامول"],
  doliprane: ["دوليبران", "paracetamol", "باراسيتامول"],
  اموكسيسيلين: ["amoxicillin", "amoxicilline", "augmentin", "اموكسيسيلين", "اوجمنتين"],
  amoxicilline: ["اموكسيسيلين", "amoxicillin", "augmentin", "clamoxyl"],
  amoxicillin: ["اموكسيسيلين", "amoxicillin", "augmentin"],
  اوجمنتين: ["augmentin", "amoxicilline", "amoxicillin", "اوجمنتين"],
  augmentin: ["اوجمنتين", "amoxicilline", "amoxicillin"],
  اسبيجيك: ["aspegic", "aspirine", "aspirin", "اسبيجيك", "اسبرين"],
  aspegic: ["اسبيجيك", "aspirine", "aspirin"],
};

export async function getCachedPharmacyById(id: string): Promise<Pharmacy | null> {
  "use cache";
  cacheLife("minutes");
  cacheTag("pharmacies", `pharmacy:${id}`);

  const ph = await prisma.pharmacy.findUnique({
    where: { id },
    include: {
      wilaya: true,
      stock: {
        include: { medicine: true },
      },
    },
  });

  // Strict: Only ACTIVE pharmacies can be viewed publicly
  if (!ph || ph.status !== "ACTIVE") return null;
  return formatPharmacy(ph);
}

/**
 * Real-time (no cache) version — used by the public pharmacy detail page
 * so that المخزون المتاح always reflects the actual DB state.
 */
export async function getPharmacyByIdRealtime(id: string): Promise<Pharmacy | null> {
  const ph = await prisma.pharmacy.findUnique({
    where: { id },
    include: {
      wilaya: true,
      stock: {
        include: { medicine: true },
        orderBy: { medicine: { name: "asc" } },
      },
    },
  });

  // Strict: Only ACTIVE pharmacies can be viewed publicly
  if (!ph || ph.status !== "ACTIVE") return null;
  return formatPharmacy(ph);
}

export async function getCachedPharmaciesPaginated(
  opts: PaginateOptions & {
    wilaya?: string;
    query?: string;
    isOpen?: boolean;
    isOnDuty?: boolean;
    sort?: string;
    category?: string;
  }
) {
  "use cache";
  cacheLife("minutes");
  cacheTag("pharmacies");

  const where: any = { status: "ACTIVE" };

  if (opts.wilaya && opts.wilaya !== "all") {
    where.wilaya = { name: { contains: opts.wilaya } };
  }
  if (opts.isOpen !== undefined) {
    where.isOpen = opts.isOpen;
  }
  if (opts.isOnDuty !== undefined) {
    where.isOnDuty = opts.isOnDuty;
  }

  const allActive = await prisma.pharmacy.findMany({
    where,
    include: {
      wilaya: true,
      stock: {
        include: { medicine: true },
      },
    },
  });

  let formatted = allActive.map(formatPharmacy);

  // Search query filter (matches medicine name, generic name, pharmacy name, city, or address)
  if (opts.query) {
    const rawQ = opts.query.trim();
    const normQ = normalizeText(rawQ);

    // Find any expanded synonym words — compare normalized versions on both sides
    let searchTerms = [normQ];
    for (const [key, synonyms] of Object.entries(MEDICINE_SEARCH_SYNONYMS)) {
      const normKey = normalizeText(key);
      if (normQ.includes(normKey) || normKey.includes(normQ)) {
        synonyms.forEach((s) => searchTerms.push(normalizeText(s)));
      }
    }
    searchTerms = Array.from(new Set(searchTerms));

    formatted = formatted.filter((p) => {
      const pNameNorm = normalizeText(p.name);
      const pAddrNorm = normalizeText(p.address);
      const pCityNorm = normalizeText(p.city);
      const pWilayaNorm = normalizeText(p.wilaya);

      // Check pharmacy info
      if (
        searchTerms.some(
          (t) =>
            pNameNorm.includes(t) ||
            pAddrNorm.includes(t) ||
            pCityNorm.includes(t) ||
            pWilayaNorm.includes(t)
        )
      ) {
        return true;
      }

      // Check pharmacy stock (medicine name, genericName DCI, or category)
      return (p.stock || []).some((s) => {
        const medNameNorm = normalizeText(s.medicineName);
        const medGenericNorm = normalizeText(s.genericName || "");
        const medCategoryNorm = normalizeText(s.category || "");

        return searchTerms.some(
          (t) =>
            medNameNorm.includes(t) ||
            medGenericNorm.includes(t) ||
            medCategoryNorm.includes(t)
        );
      });
    });
  }

  // Category filter
  if (opts.category && opts.category !== "all") {
    const normCategory = normalizeText(opts.category);
    formatted = formatted.filter((p) =>
      (p.stock || []).some(
        (s) =>
          normalizeText(s.category || "").includes(normCategory) ||
          normalizeText(s.medicineName).includes(normCategory)
      )
    );
  }

  // Sort
  if (opts.sort === "rating") {
    formatted.sort((a, b) => b.rating - a.rating);
  } else if (opts.sort === "name") {
    formatted.sort((a, b) => a.name.localeCompare(b.name, "ar"));
  }

  return paginate(formatted, { page: opts.page, limit: opts.limit });
}

// ========================
// Public Data — Medicines
// ========================

export async function getCachedMedicines(): Promise<Medicine[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("medicines");

  const list = await prisma.medicine.findMany({
    orderBy: { name: "asc" },
  });

  return list.map((m) => ({
    id: m.id,
    name: m.name,
    genericName: m.genericName,
    category: m.category,
    form: m.form,
    dosage: m.dosage,
    manufacturer: m.manufacturer,
    image: m.image || undefined,
  }));
}

export async function getCachedCatalogMedicines(
  opts: PaginateOptions & { search?: string; category?: string }
) {
  "use cache";
  cacheLife("hours");
  cacheTag("medicines");

  const where: any = {};
  if (opts.category && opts.category !== "all") {
    where.category = opts.category;
  }
  if (opts.search) {
    where.OR = [
      { name: { contains: opts.search } },
      { genericName: { contains: opts.search } },
      { manufacturer: { contains: opts.search } },
    ];
  }

  const all = await prisma.medicine.findMany({
    where,
    orderBy: { name: "asc" },
  });

  const formatted: Medicine[] = all.map((m) => ({
    id: m.id,
    name: m.name,
    genericName: m.genericName,
    category: m.category,
    form: m.form,
    dosage: m.dosage,
    manufacturer: m.manufacturer,
    image: m.image || undefined,
  }));

  return paginate(formatted, { page: opts.page, limit: opts.limit });
}

export async function getCachedMedicineById(id: string): Promise<Medicine | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("medicines", `medicine:${id}`);

  const m = await prisma.medicine.findUnique({ where: { id } });
  if (!m) return null;

  return {
    id: m.id,
    name: m.name,
    genericName: m.genericName,
    category: m.category,
    form: m.form,
    dosage: m.dosage,
    manufacturer: m.manufacturer,
    image: m.image || undefined,
  };
}

export async function getCachedMedicineCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("medicine-categories");

  const categories = [
    { id: "cat-1", name: "مسكنات الألم", icon: "💊", count: 145 },
    { id: "cat-2", name: "مضادات حيوية", icon: "🦠", count: 213 },
    { id: "cat-3", name: "مضادات الالتهاب", icon: "🔥", count: 89 },
    { id: "cat-4", name: "فيتامينات ومكملات", icon: "🌿", count: 178 },
    { id: "cat-5", name: "أدوية السكري", icon: "🩺", count: 67 },
    { id: "cat-6", name: "أدوية القلب", icon: "❤️", count: 123 },
    { id: "cat-7", name: "أدوية الغدة الدرقية", icon: "🧬", count: 45 },
    { id: "cat-8", name: "مضادات الحساسية", icon: "🌸", count: 98 },
  ];

  return categories;
}

// ========================
// Public Data — Wilayas & Stats
// ========================

export async function getCachedWilayas(): Promise<Wilaya[]> {
  "use cache";
  cacheLife("days");
  cacheTag("wilayas");

  const list = await prisma.wilaya.findMany({
    orderBy: { code: "asc" },
  });

  return list.map((w) => ({
    id: w.id,
    code: w.code,
    name: w.name,
  }));
}

export async function getCachedPlatformStats() {
  "use cache";
  cacheLife("hours");
  cacheTag("platform-stats");

  const totalMedicines = await prisma.medicine.count();
  const totalPharmacies = await prisma.pharmacy.count({ where: { status: "ACTIVE" } });
  const totalWilayas = await prisma.wilaya.count();

  return {
    medicines: totalMedicines > 0 ? totalMedicines : 0,
    pharmacies: totalPharmacies > 0 ? totalPharmacies : 0,
    wilayas: totalWilayas > 0 ? totalWilayas : 0,
    dailySearches: 0,
    satisfactionRate: 100,
  };
}

export async function getCachedTopSearchedMedicines() {
  "use cache";
  cacheLife("hours");
  cacheTag("top-searches");

  return [];
}

// ========================
// Pharmacist Data Layer
// ========================

export async function getCachedPharmacistStock(
  pharmacyId: string,
  opts: PaginateOptions & {
    search?: string;
    status?: string;
    category?: string;
  }
) {
  "use cache";
  cacheLife("seconds");
  cacheTag(`pharmacy:${pharmacyId}:stock`);

  const where: any = { pharmacyId };

  if (opts.status && opts.status !== "all") {
    where.status = opts.status.toUpperCase();
  }

  const stockList = await prisma.stockItem.findMany({
    where,
    include: { medicine: true },
    orderBy: { createdAt: "desc" },
  });

  let items: StockItem[] = stockList.map((s) => ({
    id: s.id,
    pharmacyId: s.pharmacyId,
    medicineId: s.medicineId,
    name: s.medicine.name,
    genericName: s.medicine.genericName,
    category: s.medicine.category,
    form: s.medicine.form,
    dosage: s.medicine.dosage,
    quantity: s.quantity,
    status: s.status.toLowerCase() as "available" | "limited" | "unavailable",
    expiryDate: s.expiryDate.toISOString().split("T")[0],
    addedAt: s.createdAt.toISOString().split("T")[0],
  }));

  if (opts.search) {
    const q = opts.search.toLowerCase();
    items = items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.genericName.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
    );
  }

  if (opts.category && opts.category !== "all") {
    items = items.filter((i) => i.category === opts.category);
  }

  return paginate(items, { page: opts.page, limit: opts.limit });
}

export async function getCachedPharmacistExchanges(
  pharmacyId: string,
  opts: PaginateOptions & { type?: string; status?: string }
) {
  "use cache";
  cacheLife("seconds");
  cacheTag(`pharmacy:${pharmacyId}:exchanges`);

  const exchanges = await prisma.exchangeRequest.findMany({
    where: {
      OR: [{ fromPharmacyId: pharmacyId }, { toPharmacyId: pharmacyId }],
    },
    include: {
      fromPharmacy: true,
      toPharmacy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let formatted = exchanges.map((e) => ({
    id: e.id,
    type: (e.toPharmacyId === pharmacyId ? "incoming" : "outgoing") as "incoming" | "outgoing",
    fromPharmacy: e.fromPharmacy.name,
    toPharmacy: e.toPharmacy.name,
    medicineName: e.medicineName,
    genericName: e.genericName,
    requestedQuantity: e.requestedQuantity,
    offeredMedicineName: e.offeredMedicine || undefined,
    offeredQuantity: e.offeredQuantity || undefined,
    status: e.status.toLowerCase() as "pending" | "approved" | "rejected" | "completed",
    createdAt: e.createdAt.toISOString().split("T")[0],
    notes: e.notes || undefined,
  }));

  if (opts.type && opts.type !== "all") {
    formatted = formatted.filter((e) => e.type === opts.type);
  }
  if (opts.status && opts.status !== "all") {
    formatted = formatted.filter((e) => e.status === opts.status);
  }

  return paginate(formatted, { page: opts.page, limit: opts.limit });
}

export async function getCachedPharmacistDashboardStats(pharmacyId: string) {
  "use cache";
  cacheLife("seconds");
  cacheTag(`pharmacy:${pharmacyId}:stats`);

  const stockCounts = await prisma.stockItem.groupBy({
    by: ["status"],
    where: { pharmacyId },
    _count: { id: true },
  });

  const availableCount = stockCounts.find((c) => c.status === "AVAILABLE")?._count.id || 0;
  const limitedCount = stockCounts.find((c) => c.status === "LIMITED")?._count.id || 0;
  const unavailableCount = stockCounts.find((c) => c.status === "UNAVAILABLE")?._count.id || 0;
  const totalCount = availableCount + limitedCount + unavailableCount;

  const subscription = await prisma.subscription.findUnique({
    where: { pharmacyId },
  });

  return {
    totalMedicines: totalCount || 42,
    available: availableCount || 31,
    limited: limitedCount || 6,
    unavailable: unavailableCount || 5,
    monthlySearches: 1247,
    weeklySearches: 312,
    profileViews: 3891,
    subscriptionStatus: (subscription?.status.toLowerCase() || "active") as "active" | "expired" | "pending",
    subscriptionExpiry: subscription?.endDate.toISOString().split("T")[0] || "2026-12-31",
    subscriptionPlan: subscription?.plan === "YEARLY" ? "سنوي" : "شهري",
  };
}

export async function getCachedExchangeableStock() {
  "use cache";
  cacheLife("minutes");
  cacheTag("exchangeable-stock");

  const stockItems = await prisma.stockItem.findMany({
    where: {
      status: "AVAILABLE",
      quantity: { gt: 20 },
    },
    include: {
      pharmacy: { include: { wilaya: true } },
      medicine: true,
    },
    take: 20,
  });

  return stockItems.map((s) => ({
    id: s.id,
    pharmacyName: s.pharmacy.name,
    owner: "د. صيدلي مسؤول",
    wilaya: s.pharmacy.wilaya.name,
    city: s.pharmacy.city,
    phone: s.pharmacy.phone,
    medicineName: s.medicine.name,
    genericName: s.medicine.genericName,
    dosage: s.medicine.dosage,
    availableForExchange: Math.floor(s.quantity / 2),
  }));
}

// ========================
// Admin Data Layer
// ========================

export async function getCachedAdminPharmacies(
  opts: PaginateOptions & {
    search?: string;
    status?: string;
    wilaya?: string;
    subscriptionStatus?: string;
  }
) {
  "use cache";
  cacheLife("seconds");
  cacheTag("admin:pharmacies");

  const where: any = {};
  if (opts.status && opts.status !== "all") {
    where.status = opts.status.toUpperCase();
  }
  if (opts.wilaya && opts.wilaya !== "all") {
    where.wilaya = { name: opts.wilaya };
  }

  const list = await prisma.pharmacy.findMany({
    where,
    include: {
      wilaya: true,
      owner: true,
      subscription: true,
      _count: { select: { stock: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let formatted: AdminPharmacy[] = list.map((p) => ({
    id: p.id,
    name: p.name,
    owner: p.owner.name,
    wilaya: p.wilaya.name,
    city: p.city,
    phone: p.phone,
    email: p.email,
    registrationNumber: p.registrationNumber,
    status: p.status.toLowerCase() as "active" | "pending" | "suspended" | "rejected",
    subscriptionStatus: (p.subscription?.status.toLowerCase() || "none") as "active" | "expired" | "none",
    createdAt: p.createdAt.toISOString().split("T")[0],
    approvedAt: p.approvedAt ? p.approvedAt.toISOString().split("T")[0] : undefined,
    medicinesCount: p._count.stock,
  }));

  if (opts.search) {
    const q = opts.search.toLowerCase();
    formatted = formatted.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.owner.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.registrationNumber.toLowerCase().includes(q)
    );
  }

  return paginate(formatted, { page: opts.page, limit: opts.limit });
}

export async function getCachedAdminPayments(
  opts: PaginateOptions & { status?: string; wilaya?: string }
) {
  "use cache";
  cacheLife("seconds");
  cacheTag("admin:payments");

  const payments = await prisma.payment.findMany({
    include: {
      pharmacy: { include: { wilaya: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let formatted = payments.map((p) => ({
    id: p.id,
    pharmacyName: p.pharmacy.name,
    wilaya: p.pharmacy.wilaya.name,
    amount: p.amount,
    date: p.createdAt.toISOString().split("T")[0],
    method: p.method === "BARIDIMOB" ? "BaridiMob" : p.method === "CIB" ? "CIB" : "تحويل بنكي",
    status: p.status.toLowerCase() as "paid" | "pending" | "failed",
  }));

  if (opts.status && opts.status !== "all") {
    formatted = formatted.filter((p) => p.status === opts.status);
  }
  if (opts.wilaya && opts.wilaya !== "all") {
    formatted = formatted.filter((p) => p.wilaya === opts.wilaya);
  }

  return paginate(formatted, { page: opts.page, limit: opts.limit });
}

export async function getCachedAdminSubscriptions(
  opts: PaginateOptions & { status?: string }
) {
  "use cache";
  cacheLife("seconds");
  cacheTag("admin:subscriptions");

  const subscriptions = await prisma.subscription.findMany({
    include: {
      pharmacy: { include: { wilaya: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  let formatted = subscriptions.map((s) => ({
    id: s.id,
    pharmacyName: s.pharmacy.name,
    wilaya: s.pharmacy.wilaya.name,
    plan: s.plan === "YEARLY" ? "سنوي" : "شهري",
    startDate: s.startDate.toISOString().split("T")[0],
    endDate: s.endDate.toISOString().split("T")[0],
    status: s.status.toLowerCase() as "active" | "expired",
    amount: s.amount,
  }));

  if (opts.status && opts.status !== "all") {
    formatted = formatted.filter((s) => s.status === opts.status);
  }

  return paginate(formatted, { page: opts.page, limit: opts.limit });
}

export async function getCachedAdminReports(
  opts: PaginateOptions & { status?: string; type?: string }
) {
  "use cache";
  cacheLife("seconds");
  cacheTag("admin:reports");

  const reports = await prisma.report.findMany({
    include: {
      pharmacy: true,
    },
    orderBy: { createdAt: "desc" },
  });

  let formatted = reports.map((r) => ({
    id: r.id,
    type: r.type.toLowerCase(),
    pharmacyName: r.pharmacy.name,
    reportedBy: r.reportedBy,
    description: r.description,
    status: r.status.toLowerCase() as "pending" | "reviewing" | "resolved",
    createdAt: r.createdAt.toISOString().split("T")[0],
  }));

  if (opts.status && opts.status !== "all") {
    formatted = formatted.filter((r) => r.status === opts.status);
  }
  if (opts.type && opts.type !== "all") {
    formatted = formatted.filter((r) => r.type === opts.type);
  }

  return paginate(formatted, { page: opts.page, limit: opts.limit });
}

export async function getCachedAdminOverviewStats() {
  "use cache";
  cacheLife("seconds");
  cacheTag("admin:stats");

  const totalPharmacies = await prisma.pharmacy.count();
  const activePharmacies = await prisma.pharmacy.count({ where: { status: "ACTIVE" } });
  const pendingPharmacies = await prisma.pharmacy.count({ where: { status: "PENDING" } });
  const suspendedPharmacies = await prisma.pharmacy.count({ where: { status: "SUSPENDED" } });
  const totalMedicines = await prisma.medicine.count();
  const activeSubscriptions = await prisma.subscription.count({ where: { status: "ACTIVE" } });
  const expiredSubscriptions = await prisma.subscription.count({ where: { status: "EXPIRED" } });

  const paymentsSum = await prisma.payment.aggregate({
    where: { status: "PAID" },
    _sum: { amount: true },
  });

  return {
    totalPharmacies: totalPharmacies,
    activePharmacies: activePharmacies,
    pendingPharmacies: pendingPharmacies,
    suspendedPharmacies: suspendedPharmacies,
    totalMedicines: totalMedicines,
    monthlySearches: 0,
    activeSubscriptions: activeSubscriptions,
    expiredSubscriptions: expiredSubscriptions,
    monthlyRevenue: 0,
    totalRevenue: paymentsSum._sum.amount || 0,
  };
}
