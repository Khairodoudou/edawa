"use client";

import { ChevronRight, ChevronLeft, MoreHorizontal } from "lucide-react";
import type { PaginationMeta } from "@/lib/api-utils";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({
  meta,
  onPageChange,
  className = "",
}: PaginationProps) {
  const { page, totalPages, total, limit } = meta;

  if (totalPages <= 1) {
    return (
      <div className={`flex items-center justify-between text-xs text-muted-foreground pt-4 ${className}`}>
        <span>إجمالي النتائج: <strong className="text-foreground">{total}</strong></span>
        <span>صفحة 1 من 1</span>
      </div>
    );
  }

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/60 ${className}`}>
      {/* Results counter */}
      <div className="text-xs text-muted-foreground">
        عرض <strong className="text-foreground">{startItem}—{endItem}</strong> من أصل{" "}
        <strong className="text-foreground">{total}</strong> سجل
      </div>

      {/* Pagination buttons */}
      <div className="flex items-center gap-1.5" dir="rtl">
        {/* Next in RTL = Arrow Left */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={!meta.hasPrev}
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-border bg-card text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
          title="الصفحة السابقة"
          aria-label="Previous Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="w-8 h-8 flex items-center justify-center text-muted-foreground text-xs"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </span>
            );
          }

          const pageNum = p as number;
          const isActive = pageNum === page;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? "bg-[#0EA96E] text-white shadow-md shadow-[#0EA96E]/20"
                  : "border border-border bg-card text-foreground hover:bg-muted/80"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Prev in RTL = Arrow Right */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!meta.hasNext}
          className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-border bg-card text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed text-xs transition-colors"
          title="الصفحة التالية"
          aria-label="Next Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
