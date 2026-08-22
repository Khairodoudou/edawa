import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { ExchangeRequestCreateSchema } from "@/lib/validators";
import { getCachedPharmacistExchanges, getCachedExchangeableStock } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

async function resolvePharmacy(request: NextRequest) {
  const url = new URL(request.url);
  const emailParam =
    url.searchParams.get("email") ||
    request.headers.get("x-user-email") ||
    request.cookies.get("edawa_user_email")?.value;

  if (emailParam) {
    const ph = await prisma.pharmacy.findFirst({
      where: {
        OR: [
          { email: emailParam },
          { owner: { email: emailParam } },
        ],
      },
    });
    if (ph) return ph;
  }

  return prisma.pharmacy.findFirst({
    where: { status: "ACTIVE" },
  });
}

export async function GET(request: NextRequest) {
  try {
    const primaryPh = await resolvePharmacy(request);
    if (!primaryPh) return errorResponse("لا توجد صيدلية", 404);

    // Direct live DB query — 100% real-time without cache lag
    const exchanges = await prisma.exchangeRequest.findMany({
      where: {
        OR: [
          { fromPharmacyId: primaryPh.id },
          { toPharmacyId: primaryPh.id },
        ],
      },
      include: {
        fromPharmacy: true,
        toPharmacy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const requests = exchanges.map((e) => {
      const isIncoming = e.toPharmacyId === primaryPh.id;
      const partner = isIncoming ? e.fromPharmacy : e.toPharmacy;

      return {
        id: e.id,
        type: (isIncoming ? "incoming" : "outgoing") as "incoming" | "outgoing",
        fromPharmacy: e.fromPharmacy.name,
        toPharmacy: e.toPharmacy.name,
        fromPharmacyPhone: e.fromPharmacy.phone,
        toPharmacyPhone: e.toPharmacy.phone,
        partnerPhone: partner.phone,
        partnerCity: partner.city,
        medicineName: e.medicineName,
        genericName: e.genericName,
        requestedQuantity: e.requestedQuantity,
        offeredMedicineName: e.offeredMedicine || undefined,
        offeredQuantity: e.offeredQuantity || undefined,
        status: e.status.toLowerCase() as "pending" | "approved" | "rejected" | "completed",
        createdAt: e.createdAt.toISOString().split("T")[0],
        notes: e.notes || undefined,
      };
    });

    const exchangeableStock = await getCachedExchangeableStock();

    return successResponse({
      currentPharmacyId: primaryPh.id,
      currentPharmacyName: primaryPh.name,
      requests,
      exchangeableStock,
    });
  } catch {
    return errorResponse("حدث خطأ أثناء جلب طلبات التبادل", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ExchangeRequestCreateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const primaryPh = await resolvePharmacy(request);
    if (!primaryPh) return errorResponse("لا توجد صيدلية", 404);

    const {
      toPharmacyId,
      medicineName,
      genericName,
      requestedQuantity,
      offeredMedicineName,
      offeredQuantity,
      notes,
    } = parsed.data;

    const exchange = await prisma.exchangeRequest.create({
      data: {
        fromPharmacyId: primaryPh.id,
        toPharmacyId,
        medicineName,
        genericName,
        requestedQuantity,
        offeredMedicine: offeredMedicineName,
        offeredQuantity,
        notes,
        status: "PENDING",
      },
      include: {
        fromPharmacy: true,
        toPharmacy: true,
      },
    });

    return successResponse(exchange, undefined, 201);
  } catch {
    return errorResponse("حدث خطأ أثناء إنشاء طلب التبادل", 500);
  }
}
