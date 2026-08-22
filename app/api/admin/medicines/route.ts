import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { MedicineCreateSchema, PaginationSchema } from "@/lib/validators";
import { getCachedCatalogMedicines } from "@/lib/cache";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    const parsed = PaginationSchema.safeParse({ page, limit });
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const result = await getCachedCatalogMedicines({
      page: parsed.data.page,
      limit: parsed.data.limit,
      search,
      category,
    });

    return successResponse(result.data, result.meta);
  } catch {
    return errorResponse("حدث خطأ أثناء جلب كتالوج الأدوية", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = MedicineCreateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const created = await prisma.medicine.create({
      data: parsed.data,
    });

    // Invalidate medicine catalogue cache
    revalidateTag("medicines", "max");

    return successResponse(created, undefined, 201);
  } catch {
    return errorResponse("حدث خطأ أثناء إضافة الدواء للكتالوج", 500);
  }
}
