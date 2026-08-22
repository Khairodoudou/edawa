// =============================
// API Utils — دوائي Platform
// =============================
// Standardized API responses, pagination utilities, and error types

import { NextResponse } from "next/server";
import { ZodError } from "zod";

// ========================
// Types
// ========================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ========================
// Response Helpers
// ========================

export function successResponse<T>(
  data: T,
  meta?: PaginationMeta,
  status = 200
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json({ success: true, data, meta }, { status });
}

export function errorResponse(
  error: string,
  status = 400,
  details?: unknown,
  code?: string
): NextResponse<ApiError> {
  return NextResponse.json(
    { success: false, error, details, code },
    { status }
  );
}

export function notFoundResponse(resource = "المورد"): NextResponse<ApiError> {
  return errorResponse(`${resource} غير موجود`, 404, undefined, "NOT_FOUND");
}

export function zodErrorResponse(err: ZodError): NextResponse<ApiError> {
  const issues = (err as any).issues || (err as any).errors || [];
  const details = issues.map((e: any) => ({
    field: Array.isArray(e.path) ? e.path.join(".") : String(e.path || ""),
    message: e.message || "قيمة غير صالحة",
  }));
  return errorResponse("بيانات غير صالحة", 422, details, "VALIDATION_ERROR");
}

export function serverErrorResponse(
  message = "خطأ داخلي في الخادم"
): NextResponse<ApiError> {
  return errorResponse(message, 500, undefined, "INTERNAL_ERROR");
}

// ========================
// Pagination Utility
// ========================

export interface PaginateOptions {
  page: number;
  limit: number;
}

export interface PaginateResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export function paginate<T>(
  items: T[],
  { page, limit }: PaginateOptions
): PaginateResult<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const safePage = Math.max(1, Math.min(page, totalPages || 1));
  const start = (safePage - 1) * limit;
  const end = start + limit;

  return {
    data: items.slice(start, end),
    meta: {
      page: safePage,
      limit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  };
}

// ========================
// Query Param Helpers
// ========================

export function getPageParams(url: URL): PaginateOptions {
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const rawLimit = parseInt(url.searchParams.get("limit") || "10", 10);
  const limit = Math.min(100, Math.max(1, rawLimit));
  return { page, limit };
}

export function parseBoolean(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}
