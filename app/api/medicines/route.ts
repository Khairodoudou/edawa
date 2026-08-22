import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { getCachedCatalogMedicines } from "@/lib/cache";
import { PaginationSchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get("search") || undefined;
    const category = url.searchParams.get("category") || undefined;
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "12", 10);

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
    return errorResponse("حدث خطأ أثناء جلب الأدوية", 500);
  }
}
