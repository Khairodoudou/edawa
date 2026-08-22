import type { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const q = url.searchParams.get("q") || "";

    const where: any = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (q) {
      where.OR = [
        { medicineName: { contains: q } },
        { genericName: { contains: q } },
        { fromPharmacy: { name: { contains: q } } },
        { toPharmacy: { name: { contains: q } } },
        { fromPharmacy: { city: { contains: q } } },
        { toPharmacy: { city: { contains: q } } },
      ];
    }

    const exchanges = await prisma.exchangeRequest.findMany({
      where,
      include: {
        fromPharmacy: {
          include: { wilaya: true },
        },
        toPharmacy: {
          include: { wilaya: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = exchanges.map((e) => ({
      id: e.id,
      medicineName: e.medicineName,
      genericName: e.genericName,
      requestedQuantity: e.requestedQuantity,
      offeredMedicineName: e.offeredMedicine || undefined,
      offeredQuantity: e.offeredQuantity || undefined,
      status: e.status.toLowerCase() as "pending" | "approved" | "rejected" | "completed",
      notes: e.notes || undefined,
      createdAt: e.createdAt.toISOString().split("T")[0],
      fromPharmacy: {
        id: e.fromPharmacy.id,
        name: e.fromPharmacy.name,
        city: e.fromPharmacy.city,
        wilaya: e.fromPharmacy.wilaya?.name || "الجزائر",
        phone: e.fromPharmacy.phone,
      },
      toPharmacy: {
        id: e.toPharmacy.id,
        name: e.toPharmacy.name,
        city: e.toPharmacy.city,
        wilaya: e.toPharmacy.wilaya?.name || "الجزائر",
        phone: e.toPharmacy.phone,
      },
    }));

    // Stats calculations safely via findMany
    const allRecords = await prisma.exchangeRequest.findMany({
      select: { status: true },
    });

    const stats = {
      total: allRecords.length,
      completed: allRecords.filter((s) => s.status === "COMPLETED").length,
      approved: allRecords.filter((s) => s.status === "APPROVED").length,
      pending: allRecords.filter((s) => s.status === "PENDING").length,
      rejected: allRecords.filter((s) => s.status === "REJECTED").length,
    };

    return successResponse({
      exchanges: formatted,
      stats,
    });
  } catch (err) {
    console.error("[Admin Exchanges GET Error]:", err);
    return errorResponse("حدث خطأ أثناء جلب أرشيف التبادلات الوطني", 500);
  }
}
