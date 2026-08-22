import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { ExchangeStatusUpdateSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/pharmacist/exchange/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await request.json();
    const parsed = ExchangeStatusUpdateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { status, notes } = parsed.data;

    const exchange = await prisma.exchangeRequest.update({
      where: { id },
      data: {
        status: status.toUpperCase() as "APPROVED" | "REJECTED" | "COMPLETED",
        ...(notes && { notes }),
      },
      include: {
        fromPharmacy: true,
        toPharmacy: true,
      },
    });

    return successResponse({
      id: exchange.id,
      status: exchange.status.toLowerCase(),
      fromPharmacy: exchange.fromPharmacy.name,
      toPharmacy: exchange.toPharmacy.name,
    });
  } catch {
    return errorResponse("حدث خطأ أثناء تحديث حالة الطلب", 500);
  }
}
