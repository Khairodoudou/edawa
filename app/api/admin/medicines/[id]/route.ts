import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { MedicineUpdateSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/medicines/[id]">
) {
  try {
    const { id } = await ctx.params;
    const med = await prisma.medicine.findUnique({ where: { id } });
    if (!med) return notFoundResponse("الدواء");
    return successResponse(med);
  } catch {
    return errorResponse("حدث خطأ أثناء جلب الدواء", 500);
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/medicines/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = MedicineUpdateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const updated = await prisma.medicine.update({
      where: { id },
      data: parsed.data,
    });

    return successResponse(updated);
  } catch {
    return errorResponse("حدث خطأ أثناء تعديل الدواء", 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/admin/medicines/[id]">
) {
  try {
    const { id } = await ctx.params;
    await prisma.medicine.delete({ where: { id } });
    return successResponse({ message: "تم حذف الدواء بنجاح" });
  } catch {
    return errorResponse("حدث خطأ أثناء حذف الدواء", 500);
  }
}
