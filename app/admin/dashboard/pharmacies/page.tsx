"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/shared/Pagination";
import {
  Search,
  Eye,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import type { AdminPharmacy } from "@/lib/mock-data";
import type { PaginationMeta } from "@/lib/api-utils";

export default function AdminPharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<AdminPharmacy[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [wilayaFilter, setWilayaFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    pharmacy: AdminPharmacy | null;
    deleting: boolean;
  }>({
    isOpen: false,
    pharmacy: null,
    deleting: false,
  });
  const [feedback, setFeedback] = useState<string | null>(null);

  const fetchPharmacies = useCallback(async (page = 1, q = search, status = statusFilter, wilaya = wilayaFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "8",
      });
      if (q) params.append("search", q);
      if (status !== "all") params.append("status", status);
      if (wilaya !== "all") params.append("wilaya", wilaya);

      const res = await fetch(`/api/admin/pharmacies?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPharmacies(json.data);
        if (json.meta) setMeta(json.meta);
      }
    } catch (err) {
      console.error("Failed to fetch admin pharmacies", err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, wilayaFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPharmacies(1, search, statusFilter, wilayaFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, wilayaFilter, fetchPharmacies]);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "suspend" : "activate";
    try {
      const res = await fetch(`/api/admin/pharmacies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        fetchPharmacies(meta.page);
        setFeedback(action === "suspend" ? "تم تجميد الصيدلية بنجاح" : "تم تفعيل الصيدلية بنجاح");
        setTimeout(() => setFeedback(null), 3500);
      }
    } catch (err) {
      console.error("Failed to toggle pharmacy status", err);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.pharmacy) return;
    setDeleteModal((prev) => ({ ...prev, deleting: true }));

    try {
      const res = await fetch(`/api/admin/pharmacies/${deleteModal.pharmacy.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        setFeedback(`تم حذف صيدلية "${deleteModal.pharmacy.name}" وجميع بياناتها بنجاح`);
        setTimeout(() => setFeedback(null), 4000);
        setDeleteModal({ isOpen: false, pharmacy: null, deleting: false });
        fetchPharmacies(meta.page);
      } else {
        alert(json.error || "حدث خطأ أثناء محاولة الحذف");
        setDeleteModal((prev) => ({ ...prev, deleting: false }));
      }
    } catch (err) {
      console.error("Failed to delete pharmacy", err);
      alert("حدث خطأ أثناء الاتصال بالخادم");
      setDeleteModal((prev) => ({ ...prev, deleting: false }));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الصيدليات المسجلة"
        description="عرض، تصفية، تفعيل، تجميد أو حذف الصيدليات المسجلة في منصة دوائي عبر 69 ولاية"
      />

      {/* Success Feedback Alert */}
      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {feedback}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم، الصيدلي، الهاتف أو الاعتماد..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-[#1A6EBD]"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشطة فقط</option>
            <option value="pending">قيد الانتظار</option>
            <option value="suspended">معطّلة</option>
          </select>

          {/* Wilaya filter */}
          <select
            value={wilayaFilter}
            onChange={(e) => setWilayaFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold focus:outline-none focus:border-[#1A6EBD]"
          >
            <option value="all">جميع الولايات</option>
            <option value="الجزائر">الجزائر العاصمة</option>
            <option value="وهران">وهران</option>
            <option value="قسنطينة">قسنطينة</option>
            <option value="عنابة">عنابة</option>
            <option value="بجاية">بجاية</option>
            <option value="سطيف">سطيف</option>
            <option value="تيزي وزو">تيزي وزو</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
              <tr>
                <th className="p-4">اسم الصيدلية</th>
                <th className="p-4">الصيدلي المسؤول</th>
                <th className="p-4">الولاية / المدينة</th>
                <th className="p-4">رقم الهاتف</th>
                <th className="p-4">رقم الاعتماد</th>
                <th className="p-4">حالة الحساب</th>
                <th className="p-4">الاشتراك</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1A6EBD] mb-2" />
                    جارٍ تحميل الصيدليات...
                  </td>
                </tr>
              ) : pharmacies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    لا توجد صيدليات تطابق الفلاتر.
                  </td>
                </tr>
              ) : (
                pharmacies.map((ph) => (
                  <tr key={ph.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-bold text-foreground">{ph.name}</td>
                    <td className="p-4 text-muted-foreground">{ph.owner}</td>
                    <td className="p-4">
                      {ph.wilaya} ({ph.city})
                    </td>
                    <td className="p-4 font-semibold text-foreground">{ph.phone}</td>
                    <td className="p-4 text-muted-foreground">{ph.registrationNumber}</td>
                    <td className="p-4">
                      <StatusBadge status={ph.status} />
                    </td>
                    <td className="p-4">
                      <StatusBadge status={ph.subscriptionStatus === "active" ? "active" : "expired"} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View Button */}
                        <Link
                          href={`/admin/dashboard/pharmacies/${ph.id}`}
                          className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        {/* Status Toggle Button */}
                        {ph.status === "active" ? (
                          <button
                            onClick={() => toggleStatus(ph.id, ph.status)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold transition-colors text-[11px]"
                            title="تجميد الصيدلية"
                          >
                            تجميد
                          </button>
                        ) : ph.status === "suspended" ? (
                          <button
                            onClick={() => toggleStatus(ph.id, ph.status)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 font-bold transition-colors text-[11px]"
                            title="تفعيل الصيدلية"
                          >
                            تفعيل
                          </button>
                        ) : (
                          <Link
                            href="/admin/dashboard/pharmacies/pending"
                            className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 font-bold text-[11px]"
                          >
                            مراجعة
                          </Link>
                        )}

                        {/* Delete Button */}
                        <button
                          onClick={() =>
                            setDeleteModal({
                              isOpen: true,
                              pharmacy: ph,
                              deleting: false,
                            })
                          }
                          className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors"
                          title="حذف الصيدلية نهائياً"
                        >
                          <Trash2 className="w-4 h-4" />
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
              onPageChange={(p) => fetchPharmacies(p)}
            />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && deleteModal.pharmacy && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                <AlertTriangle className="w-5 h-5" />
                تأكيد حذف الصيدلية
              </div>
              <button
                onClick={() => setDeleteModal({ isOpen: false, pharmacy: null, deleting: false })}
                className="text-muted-foreground hover:text-foreground"
                disabled={deleteModal.deleting}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-foreground">
                هل أنت متأكد من رغبتك في حذف الصيدلية{" "}
                <strong className="text-rose-600 font-bold underline">
                  {deleteModal.pharmacy.name}
                </strong>
                ؟
              </p>
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-700 dark:text-rose-400 space-y-1">
                <p className="font-bold">⚠️ تنبيه إداري هام:</p>
                <p>
                  سيؤدي هذا الإجراء إلى حذف حساب الصيدلية، المخزون، سجل الاشتراكات والمدفوعات المرتبطة بها نهائياً من قاعدة البيانات ولا يمكن التراجع عنه.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, pharmacy: null, deleting: false })}
                disabled={deleteModal.deleting}
                className="px-4 py-2 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteModal.deleting}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
              >
                {deleteModal.deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ الحذف...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    تأكيد الحذف نهائياً
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
