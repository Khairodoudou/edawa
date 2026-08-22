import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { ReportActionSchema } from "@/lib/validators";
import { getCachedAdminReports } from "@/lib/cache";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || "all";
    const type = url.searchParams.get("type") || "all";
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const result = await getCachedAdminReports({
      page,
      limit,
      status,
      type,
    });

    return successResponse(result.data, result.meta);
  } catch {
    return errorResponse("حدث خطأ أثناء جلب البلاغات", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;
    if (!id) return errorResponse("معرف البلاغ مطلوب", 400);

    const parsed = ReportActionSchema.safeParse({ status, notes });
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const updated = await prisma.report.update({
      where: { id },
      data: {
        status: parsed.data.status.toUpperCase() as any,
        notes: parsed.data.notes,
      },
    });

    return successResponse(updated);
  } catch {
    return errorResponse("حدث خطأ أثناء تحديث حالة البلاغ", 500);
  }
}
