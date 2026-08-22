import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
  paginate,
} from "@/lib/api-utils";
import { AdminPharmaciesFilterSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import type { AdminPharmacy } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const parsed = AdminPharmaciesFilterSchema.safeParse({
      page: url.searchParams.get("page") ?? "1",
      limit: url.searchParams.get("limit") ?? "10",
      search: url.searchParams.get("search") ?? undefined,
      status: url.searchParams.get("status") ?? "all",
      wilaya: url.searchParams.get("wilaya") ?? undefined,
      subscriptionStatus: url.searchParams.get("subscriptionStatus") ?? "all",
    });

    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { page, limit, search, status, wilaya } = parsed.data;

    const where: any = {};

    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }

    if (wilaya && wilaya !== "all") {
      where.wilaya = { name: { contains: wilaya } };
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
      owner: p.owner?.name || "غير محدد",
      wilaya: p.wilaya?.name || "الجزائر",
      city: p.city,
      phone: p.phone,
      email: p.email,
      registrationNumber: p.registrationNumber,
      status: (p.status?.toLowerCase() || "pending") as "active" | "pending" | "suspended" | "rejected",
      subscriptionStatus: (p.subscription?.status?.toLowerCase() || "none") as "active" | "expired" | "none",
      createdAt: p.createdAt.toISOString().split("T")[0],
      approvedAt: p.approvedAt ? p.approvedAt.toISOString().split("T")[0] : undefined,
      medicinesCount: p._count.stock,
    }));

    if (search) {
      const q = search.toLowerCase();
      formatted = formatted.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.owner.toLowerCase().includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.registrationNumber.toLowerCase().includes(q)
      );
    }

    const result = paginate(formatted, { page, limit });
    return successResponse(result.data, result.meta);
  } catch (err) {
    console.error("[Admin Pharmacies API Error]:", err);
    return errorResponse("حدث خطأ أثناء جلب الصيدليات للإدارة", 500);
  }
}
