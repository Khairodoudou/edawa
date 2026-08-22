import { successResponse, serverErrorResponse } from "@/lib/api-utils";
import { getCachedPlatformStats, getCachedTopSearchedMedicines } from "@/lib/cache";

export async function GET() {
  try {
    const stats = await getCachedPlatformStats();
    const topSearches = await getCachedTopSearchedMedicines();
    return successResponse({
      ...stats,
      topSearches,
    });
  } catch {
    return serverErrorResponse();
  }
}
