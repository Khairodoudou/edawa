"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/shared/Pagination";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { StockItem } from "@/lib/mock-data";
import type { PaginationMeta } from "@/lib/api-utils";

export default function PharmacistStockPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStock = useCallback(async (page = 1, query = search, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "8",
        status: status,
      });
      if (query) params.append("search", query);

      const res = await fetch(`/api/pharmacist/stock?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
        if (json.meta) setMeta(json.meta);
      }
    } catch (err) {
      console.error("Failed to fetch stock", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStock(1, search, statusFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, fetchStock]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/pharmacist/stock/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setDeleteId(null);
        fetchStock(meta.page);
      }
    } catch (err) {
      console.error("Failed to delete stock item", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة مخزون الأدوية"
        description="عرض، تحديث، وإضافة الأدوية المتاحة في صيدليتك"
        action={
          <Link
            href="/pharmacist/dashboard/stock/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة دواء للمخزون
          </Link>
        }
      />

      {/* Filters & Search */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث برقم أو اسم الدواء..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E]"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {[
            { id: "all", label: "الكل" },
            { id: "available", label: "متوفر" },
            { id: "limited", label: "محدود" },
            { id: "unavailable", label: "غير متوفر" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? "bg-[#0EA96E] text-white"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
              <tr>
                <th className="p-4">اسم الدواء</th>
                <th className="p-4">الاسم العلمي</th>
                <th className="p-4">الفئة / الشكل</th>
                <th className="p-4">الكمية</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">تاريخ الانتهاء</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0EA96E] mb-2" />
                    جارٍ تحميل المخزون من قاعدة البيانات...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <p className="font-bold text-foreground text-sm mb-1">المخزون فارغ حالياً</p>
                    <p className="text-xs text-muted-foreground mb-4">لم تقم بإضافة أي دواء لصيدليتك بعد أو لا توجد نتائج مطابقة للبحث.</p>
                    <Link
                      href="/pharmacist/dashboard/stock/add"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      إضافة دواء للمخزون الآن
                    </Link>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-bold text-foreground">{item.name}</td>
                    <td className="p-4 text-muted-foreground">{item.genericName}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                        {item.category} ({item.dosage})
                      </span>
                    </td>
                    <td className="p-4 font-bold text-foreground">
                      <span
                        className={
                          item.quantity === 0
                            ? "text-rose-600 font-black"
                            : item.quantity < 20
                            ? "text-amber-600 font-bold"
                            : ""
                        }
                      >
                        {item.quantity} وحدة
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-4 text-muted-foreground">{item.expiryDate}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/pharmacist/dashboard/stock/${item.id}/edit`}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(item.id)}
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Integrated Pagination */}
        {!loading && (
          <div className="p-4 bg-card">
            <Pagination
              meta={meta}
              onPageChange={(p) => fetchStock(p)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="font-black text-base mb-1">حذف دواء من المخزون</h3>
              <p className="text-xs text-muted-foreground">
                هل أنت متأكد من إزالة هذا الدواء من قائمة مخزون صيدليتك؟ لن يظهر للمواطنين في نتائج البحث.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={isDeleting}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "حذف الآن"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
