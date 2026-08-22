import type { NextRequest } from "next/server";
import { successResponse, errorResponse, paginate } from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const wilaya = url.searchParams.get("wilaya") || "all";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    // 1. Auto-sync: Ensure every pharmacy with a subscription has a corresponding payment record
    const pharmaciesWithoutPayment = await prisma.pharmacy.findMany({
      where: {
        payments: { none: {} },
        subscription: { isNot: null },
      },
      include: { subscription: true },
    });

    for (const ph of pharmaciesWithoutPayment) {
      if (ph.subscription) {
        const isYearly = ph.subscription.plan === "YEARLY";
        const txRef = `TX-${Math.floor(100000 + Math.random() * 900000)}`;
        await prisma.payment.create({
          data: {
            pharmacyId: ph.id,
            amount: ph.subscription.amount,
            period: isYearly ? "اشتراك سنوي (12 شهر)" : "اشتراك شهري",
            method: "BARIDIMOB",
            status: ph.status === "ACTIVE" ? "PAID" : "PENDING",
            transactionRef: txRef,
            paidAt: ph.status === "ACTIVE" ? ph.approvedAt || ph.createdAt : undefined,
            createdAt: ph.createdAt,
          },
        });
      }
    }

    // 2. Query all payments with real related pharmacy & owner data
    const where: any = {};
    if (status && status !== "all") {
      where.status = status.toUpperCase();
    }
    if (wilaya && wilaya !== "all") {
      where.pharmacy = { wilaya: { name: { contains: wilaya } } };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        pharmacy: {
          include: {
            wilaya: true,
            owner: true,
            subscription: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = payments.map((p) => {
      const ph = p.pharmacy;
      const isYearly = ph?.subscription?.plan === "YEARLY";
      const defaultPeriod = isYearly ? "اشتراك سنوي (12 شهر)" : "اشتراك شهري";

      return {
        id: p.transactionRef || p.id,
        rawId: p.id,
        pharmacyId: ph?.id || "",
        pharmacyName: ph?.name || "صيدلية",
        ownerName: ph?.owner?.name || "الصيدلي المسؤول",
        wilaya: ph?.wilaya?.name || "الجزائر",
        city: ph?.city || "",
        address: ph?.address || "",
        phone: ph?.phone || "",
        email: ph?.email || ph?.owner?.email || "",
        registrationNumber: ph?.registrationNumber || "PH-DZ",
        plan: isYearly ? "yearly" : "monthly",
        period: p.period || defaultPeriod,
        amount: p.amount,
        date: p.createdAt.toISOString().split("T")[0],
        paidAt: p.paidAt ? p.paidAt.toISOString().split("T")[0] : undefined,
        method:
          p.method === "BARIDIMOB"
            ? "BaridiMob"
            : p.method === "CIB"
            ? "CIB / الذهبية"
            : "تحويل بنكي",
        status: (p.status?.toLowerCase() || "pending") as "paid" | "pending" | "failed",
      };
    });

    const result = paginate(formatted, { page, limit });
    return successResponse(result.data, result.meta);
  } catch (err) {
    console.error("[Admin Payments API Error]:", err);
    return errorResponse("حدث خطأ أثناء جلب المدفوعات", 500);
  }
}
