import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
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
      category: url.searchParams.get("category") ?? undefined,
      wilaya: url.searchParams.get("wilaya") ?? undefined,
      isOpen: url.searchParams.get("isOpen") ?? undefined,
      isOnDuty: url.searchParams.get("isOnDuty") ?? undefined,
      sort: url.searchParams.get("sort") ?? "nearest",
    };

    const parsed = PublicSearchSchema.safeParse(rawParams);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { page, limit, q, category, wilaya, isOpen, isOnDuty, sort } =
      parsed.data;

    const result = await getCachedPharmaciesPaginated({
      page,
      limit,
      query: q,
      category,
      wilaya,
      isOpen,
      isOnDuty,
      sort,
    });

    return successResponse(result.data, result.meta);
  } catch {
    return errorResponse("حدث خطأ أثناء البحث", 500);
  }
}
