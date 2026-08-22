import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
  paginate,
} from "@/lib/api-utils";
import { StockFilterSchema, StockItemCreateSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const emailParam =
      url.searchParams.get("email") ||
      request.headers.get("x-user-email") ||
      request.cookies.get("edawa_user_email")?.value;

    let ph = null;
    if (emailParam) {
      ph = await prisma.pharmacy.findFirst({
        where: {
          OR: [{ email: emailParam }, { owner: { email: emailParam } }],
          status: "ACTIVE",
        },
      });
    }

    if (!ph) {
      ph = await prisma.pharmacy.findFirst({
        where: { status: "ACTIVE" },
      });
    }

    if (!ph) {
      return successResponse([], {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      });
    }

    const parsed = StockFilterSchema.safeParse({
      page: url.searchParams.get("page") ?? "1",
      limit: url.searchParams.get("limit") ?? "10",
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? "all",
      category: url.searchParams.get("category") ?? undefined,
    });

    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { page, limit, search, status, category } = parsed.data;

    const where: any = { pharmacyId: ph.id };

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (category && category !== "all") {
      where.medicine = { ...where.medicine, category };
    }

    if (search) {
      where.OR = [
        { medicine: { name: { contains: search } } },
        { medicine: { genericName: { contains: search } } },
        { medicine: { category: { contains: search } } },
      ];
    }

    const [stockList, total] = await Promise.all([
      prisma.stockItem.findMany({
        where,
        include: { medicine: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.stockItem.count({ where }),
    ]);

    const items = stockList.map((s) => ({
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

    const totalPages = Math.ceil(total / limit) || 1;

    return successResponse(items, {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    });
  } catch (err) {
    console.error("[Stock GET API Error]:", err);
    return errorResponse("حدث خطأ أثناء جلب المخزون", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = StockItemCreateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const {
      medicineId,
      name,
      genericName,
      category,
      form,
      dosage,
      quantity,
      status: requestedStatus,
      expiryDate,
    } = parsed.data;

    // Resolve active pharmacy
    const emailParam =
      request.headers.get("x-user-email") ||
      request.cookies.get("edawa_user_email")?.value;

    let primaryPh = null;
    if (emailParam) {
      primaryPh = await prisma.pharmacy.findFirst({
        where: {
          OR: [{ email: emailParam }, { owner: { email: emailParam } }],
          status: "ACTIVE",
        },
      });
    }

    if (!primaryPh) {
      primaryPh = await prisma.pharmacy.findFirst({
        where: { status: "ACTIVE" },
      });
    }

    if (!primaryPh) {
      return errorResponse("لا توجد صيدلية نشطة لإضافة المخزون إليها", 400);
    }

    // Find or create medicine in catalog
    let med = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!med) {
      med = await prisma.medicine.create({
        data: {
          name: name || "دواء جديد",
          genericName: genericName || name || "DCI",
          category: category || "مسكنات الألم",
          form: form || "أقراص",
          dosage: dosage || "500mg",
          manufacturer: "صيدال (الجزائر)",
        },
      });
    }

    // Determine status based on quantity or explicit request
    let finalStatus: "AVAILABLE" | "LIMITED" | "UNAVAILABLE" = "AVAILABLE";
    if (requestedStatus) {
      finalStatus = requestedStatus.toUpperCase() as any;
    } else {
      finalStatus =
        quantity === 0
          ? "UNAVAILABLE"
          : quantity < 10
          ? "LIMITED"
          : "AVAILABLE";
    }

    const stockItem = await prisma.stockItem.upsert({
      where: {
        pharmacyId_medicineId: {
          pharmacyId: primaryPh.id,
          medicineId: med.id,
        },
      },
      update: {
        quantity,
        status: finalStatus,
        expiryDate: new Date(expiryDate),
      },
      create: {
        pharmacyId: primaryPh.id,
        medicineId: med.id,
        quantity,
        status: finalStatus,
        expiryDate: new Date(expiryDate),
      },
      include: { medicine: true },
    });

    // Invalidate stock and pharmacy caches
    revalidateTag(`pharmacy:${primaryPh.id}:stock`, "max");
    revalidateTag(`pharmacy:${primaryPh.id}`, "max");
    revalidateTag("pharmacies", "max");

    return successResponse(stockItem, undefined, 201);
  } catch (err) {
    console.error("[Stock POST API Error]:", err);
    return errorResponse("حدث خطأ أثناء إضافة الدواء للمخزون", 500);
  }
}
