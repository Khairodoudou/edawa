import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { StockItemUpdateSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/pharmacist/stock/[id]">
) {
  try {
    const { id } = await ctx.params;
    const item = await prisma.stockItem.findUnique({
      where: { id },
      include: { medicine: true },
    });
    if (!item) return notFoundResponse("عنصر المخزون");

    return successResponse({
      id: item.id,
      medicineId: item.medicineId,
      name: item.medicine.name,
      genericName: item.medicine.genericName,
      category: item.medicine.category,
      form: item.medicine.form,
      dosage: item.medicine.dosage,
      quantity: item.quantity,
      status: item.status.toLowerCase(),
      expiryDate: item.expiryDate.toISOString().split("T")[0],
    });
  } catch {
    return errorResponse("حدث خطأ أثناء جلب عنصر المخزون", 500);
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/pharmacist/stock/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = StockItemUpdateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const data: any = {};
    if (parsed.data.quantity !== undefined) {
      data.quantity = parsed.data.quantity;
      data.status =
        data.quantity === 0
          ? "UNAVAILABLE"
          : data.quantity < 10
          ? "LIMITED"
          : "AVAILABLE";
    }
    if (parsed.data.status) {
      data.status = parsed.data.status.toUpperCase();
    }
    if (parsed.data.expiryDate) {
      data.expiryDate = new Date(parsed.data.expiryDate);
    }

    const updated = await prisma.stockItem.update({
      where: { id },
      data,
      include: { medicine: true },
    });

    // Invalidate stock cache for this pharmacy
    revalidateTag(`pharmacy:${updated.pharmacyId}:stock`, "max");
    revalidateTag(`pharmacy:${updated.pharmacyId}`, "max");
    revalidateTag("pharmacies", "max");

    return successResponse(updated);
  } catch {
    return errorResponse("حدث خطأ أثناء تحديث عنصر المخزون", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/pharmacist/stock/[id]">
) {
  try {
    const { id } = await ctx.params;
    // Get the item first to know which pharmacy to invalidate
    const item = await prisma.stockItem.findUnique({ where: { id }, select: { pharmacyId: true } });
    await prisma.stockItem.delete({ where: { id } });

    if (item) {
      revalidateTag(`pharmacy:${item.pharmacyId}:stock`, "max");
      revalidateTag(`pharmacy:${item.pharmacyId}`, "max");
      revalidateTag("pharmacies", "max");
    }

    return successResponse({ message: "تم حذف الدواء من المخزون بنجاح" });
  } catch {
    return errorResponse("حدث خطأ أثناء حذف الدواء", 500);
  }
}
