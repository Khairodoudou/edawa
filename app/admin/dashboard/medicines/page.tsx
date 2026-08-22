"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import Pagination from "@/components/shared/Pagination";
import {
  Pill,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Medicine } from "@/lib/mock-data";
import type { PaginationMeta } from "@/lib/api-utils";

export default function AdminMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categories = [
    "مسكنات الألم",
    "مضادات حيوية",
    "مضادات الالتهاب",
    "فيتامينات ومكملات",
    "أدوية السكري",
    "أدوية القلب",
    "أدوية الغدة الدرقية",
    "مضادات الحساسية",
  ];

  const fetchMedicines = useCallback(async (page = 1, q = search, cat = categoryFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (q) params.append("search", q);
      if (cat !== "all") params.append("category", cat);

      const res = await fetch(`/api/admin/medicines?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setMedicines(json.data);
        if (json.meta) setMeta(json.meta);
      }
    } catch (err) {
      console.error("Failed to fetch admin medicines", err);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedicines(1, search, categoryFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, fetchMedicines]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/medicines/${id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteId(null);
        fetchMedicines(meta.page);
      }
    } catch (err) {
      console.error("Failed to delete medicine", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الكتالوج الوطني للأدوية"
        description="إضافة، تعديل، وحذف الأدوية المتاحة في قاعدة البيانات الوطنية للمنصة"
        action={
          <Link
            href="/admin/dashboard/medicines/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1A6EBD] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة دواء جديد للكتالوج
          </Link>
        }
      />

      {/* Search & Filter */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن اسم الدواء، التركيز أو المصنّع..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-[#1A6EBD]"
          >
            <option value="all">جميع الفئات</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
              <tr>
                <th className="p-4">اسم الدواء التجاري</th>
                <th className="p-4">الاسم العلمي (DCI)</th>
                <th className="p-4">الفئة العلاجية</th>
                <th className="p-4">الشكل</th>
                <th className="p-4">الجرعة / التركيز</th>
                <th className="p-4">المخبَر المصنّع</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1A6EBD] mb-2" />
                    جارٍ تحميل الأدوية...
                  </td>
                </tr>
              ) : medicines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    لا توجد أدوية تطابق البحث.
                  </td>
                </tr>
              ) : (
                medicines.map((med) => (
                  <tr key={med.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-bold text-foreground flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                        <Pill className="w-3.5 h-3.5" />
                      </div>
                      {med.name}
                    </td>
                    <td className="p-4 text-muted-foreground">{med.genericName}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-semibold">
                        {med.category}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{med.form}</td>
                    <td className="p-4 font-bold text-foreground">{med.dosage}</td>
                    <td className="p-4 font-semibold text-foreground">{med.manufacturer}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/admin/dashboard/medicines/${med.id}/edit`}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                          title="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(med.id)}
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

        {/* Pagination */}
        {!loading && (
          <div className="p-4 bg-card">
            <Pagination
              meta={meta}
              onPageChange={(p) => fetchMedicines(p)}
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
              <h3 className="font-black text-base mb-1">حذف دواء من الكتالوج الوطني</h3>
              <p className="text-xs text-muted-foreground">
                هل أنت متأكد من إزالة هذا الدواء نهائياً من الكتالوج الوطني؟
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
