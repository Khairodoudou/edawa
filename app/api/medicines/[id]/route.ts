import type { NextRequest } from "next/server";
import {
  successResponse,
  notFoundResponse,
  serverErrorResponse,
} from "@/lib/api-utils";
import { getCachedMedicineById } from "@/lib/cache";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/medicines/[id]">
) {
  try {
    const { id } = await ctx.params;
    const medicine = await getCachedMedicineById(id);
    if (!medicine) return notFoundResponse("الدواء");
    return successResponse(medicine);
  } catch {
    return serverErrorResponse();
  }
}
