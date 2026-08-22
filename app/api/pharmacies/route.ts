import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
  getPageParams,
  parseBoolean,
} from "@/lib/api-utils";
import { PublicSearchSchema } from "@/lib/validators";
import { getCachedPharmaciesPaginated } from "@/lib/cache";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const rawParams = {
      page: url.searchParams.get("page") ?? "1",
      limit: url.searchParams.get("limit") ?? "10",
      q: url.searchParams.get("q") ?? undefined,
      wilaya: url.searchParams.get("wilaya") ?? undefined,
      isOpen: url.searchParams.get("isOpen") ?? undefined,
      isOnDuty: url.searchParams.get("isOnDuty") ?? undefined,
      sort: url.searchParams.get("sort") ?? "nearest",
      category: url.searchParams.get("category") ?? undefined,
    };

    const parsed = PublicSearchSchema.safeParse(rawParams);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { page, limit, q, wilaya, isOpen, isOnDuty, sort } = parsed.data;

    const result = await getCachedPharmaciesPaginated({
      page,
      limit,
      query: q,
      wilaya,
      isOpen,
      isOnDuty,
      sort,
    });

    return successResponse(result.data, result.meta);
  } catch {
    return errorResponse("حدث خطأ أثناء جلب الصيدليات", 500);
  }
}
