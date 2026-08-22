import type { NextRequest } from "next/server";
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-utils";
import { getPharmacyByIdRealtime } from "@/lib/cache";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/pharmacies/[id]">
) {
  try {
    const { id } = await ctx.params;
    const pharmacy = await getPharmacyByIdRealtime(id);
    if (!pharmacy) return notFoundResponse("الصيدلية");
    return successResponse(pharmacy);
  } catch {
    return serverErrorResponse();
  }
}
