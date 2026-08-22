import type { NextRequest } from "next/server";
import { successResponse, errorResponse, paginate } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const where: any = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        pharmacy: { include: { wilaya: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = subscriptions.map((s) => ({
      id: s.id,
      pharmacyName: s.pharmacy?.name || "صيدلية",
      wilaya: s.pharmacy?.wilaya?.name || "الجزائر",
      plan: s.plan?.toLowerCase() || "monthly",
      startDate: s.startDate.toISOString().split("T")[0],
      endDate: s.endDate.toISOString().split("T")[0],
      status: (s.status?.toLowerCase() || "active") as "active" | "expired",
      amount: s.amount,
    }));

    const result = paginate(formatted, { page, limit });
    return successResponse(result.data, result.meta);
  } catch (err) {
    console.error("[Admin Subscriptions API Error]:", err);
    return errorResponse("حدث خطأ أثناء جلب الاشتراكات", 500);
  }
}
