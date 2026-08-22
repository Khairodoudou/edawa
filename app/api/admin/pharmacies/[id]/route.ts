import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { PharmacyActionSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/pharmacies/[id]">
) {
  try {
    const { id } = await ctx.params;
    const ph = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        wilaya: true,
        owner: true,
        subscription: true,
        payments: { orderBy: { createdAt: "desc" } },
        stock: { include: { medicine: true } },
      },
    });

    if (!ph) return notFoundResponse("الصيدلية");

    return successResponse(ph);
  } catch {
    return errorResponse("حدث خطأ أثناء جلب الصيدلية", 500);
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/pharmacies/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = PharmacyActionSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { action } = parsed.data;

    let status: "ACTIVE" | "PENDING" | "SUSPENDED" | "REJECTED";
    let approvedAt: Date | undefined = undefined;

    if (action === "approve" || action === "activate") {
      status = "ACTIVE";
      approvedAt = new Date();

      // Mark the pending payment as PAID upon approval
      await prisma.payment.updateMany({
        where: { pharmacyId: id, status: "PENDING" },
        data: { status: "PAID", paidAt: new Date() },
      });

      // Ensure subscription is ACTIVE
      await prisma.subscription.updateMany({
        where: { pharmacyId: id },
        data: { status: "ACTIVE" },
      });
    } else if (action === "suspend") {
      status = "SUSPENDED";
    } else {
      status = "REJECTED";
      await prisma.payment.updateMany({
        where: { pharmacyId: id, status: "PENDING" },
        data: { status: "FAILED" },
      });
    }

    const updated = await prisma.pharmacy.update({
      where: { id },
      data: {
        status,
        ...(approvedAt ? { approvedAt } : {}),
      },
      include: {
        wilaya: true,
        owner: true,
        subscription: true,
        payments: true,
      },
    });

    // Invalidate all caches affected by pharmacy status change
    revalidateTag("admin:pharmacies", "max");
    revalidateTag("admin:stats", "max");
    revalidateTag("admin:payments", "max");
    revalidateTag("admin:subscriptions", "max");
    revalidateTag("pharmacies", "max");
    revalidateTag(`pharmacy:${id}`, "max");

    return successResponse(updated);
  } catch (err) {
    console.error("[Admin Pharmacy PUT Error]:", err);
    return errorResponse("حدث خطأ أثناء تحديث حالة الصيدلية", 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/pharmacies/[id]">
) {
  try {
    const { id } = await ctx.params;

    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      select: { id: true, ownerId: true },
    });

    if (!pharmacy) return notFoundResponse("الصيدلية");

    // Delete related records in transaction
    await prisma.$transaction([
      prisma.stockItem.deleteMany({ where: { pharmacyId: id } }),
      prisma.payment.deleteMany({ where: { pharmacyId: id } }),
      prisma.subscription.deleteMany({ where: { pharmacyId: id } }),
      prisma.report.deleteMany({ where: { pharmacyId: id } }),
      prisma.exchangeRequest.deleteMany({
        where: {
          OR: [{ fromPharmacyId: id }, { toPharmacyId: id }],
        },
      }),
      prisma.pharmacy.delete({ where: { id } }),
      prisma.user.delete({ where: { id: pharmacy.ownerId } }),
    ]);

    // Invalidate all caches after deletion
    revalidateTag("admin:pharmacies", "max");
    revalidateTag("admin:stats", "max");
    revalidateTag("admin:payments", "max");
    revalidateTag("admin:subscriptions", "max");
    revalidateTag("pharmacies", "max");
    revalidateTag(`pharmacy:${id}`, "max");
    revalidateTag(`pharmacy:${id}:stock`, "max");

    return successResponse({ message: "تم حذف الصيدلية بنجاح" });
  } catch (error) {
    console.error("Failed to delete pharmacy:", error);
    return errorResponse("حدث خطأ أثناء حذف الصيدلية", 500);
  }
}
