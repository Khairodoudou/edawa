"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  Loader2,
  Search,
  X,
  Printer,
  RefreshCw,
  Phone,
  Building2,
  Calendar,
  ArrowLeft,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";

interface AdminExchangeItem {
  id: string;
  medicineName: string;
  genericName?: string;
  requestedQuantity: number;
  offeredMedicineName?: string;
  offeredQuantity?: number;
  status: "pending" | "approved" | "rejected" | "completed";
  notes?: string;
  createdAt: string;
  fromPharmacy: {
    id: string;
    name: string;
    city: string;
    wilaya: string;
    phone: string;
  };
  toPharmacy: {
    id: string;
    name: string;
    city: string;
    wilaya: string;
    phone: string;
  };
}

interface StatsData {
  total: number;
  completed: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function AdminExchangesPage() {
  const [exchanges, setExchanges] = useState<AdminExchangeItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<AdminExchangeItem | null>(null);
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    completed: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchExchanges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/exchanges?status=${statusFilter}&q=${encodeURIComponent(search)}&t=${Date.now()}`
      );
      if (res.ok) {
        const json = await res.json();
        setExchanges(json.data?.exchanges || []);
        if (json.data?.stats) {
          setStats(json.data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch admin exchanges", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="🗄️ الأرشيف الوطني لتبادل الأدوية بين الصيدليات"
        description="متابعة وتوثيق جميع عمليات تبادل ومقايضة الأدوية المنجزة وقيد التنفيذ بين الصيدليات عبر المنصة"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchExchanges()}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تحديث
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              طباعة التقرير
            </button>
          </div>
        }
      />

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {[
          { label: "إجمالي العمليات", value: stats.total, color: "blue", emoji: "🔄" },
          { label: "مكتملة ومؤرشفة", value: stats.completed, color: "emerald", emoji: "✅" },
          { label: "مقبولة (قيد الشحن)", value: stats.approved, color: "teal", emoji: "🟢" },
          { label: "قيد الانتظار", value: stats.pending, color: "amber", emoji: "⏳" },
          { label: "مرفوضة", value: stats.rejected, color: "rose", emoji: "❌" },
        ].map((card) => {
          const colorMap: Record<string, string> = {
            blue: "bg-blue-500/10 text-blue-600",
            emerald: "bg-emerald-500/10 text-emerald-600",
            teal: "bg-teal-500/10 text-teal-600",
            amber: "bg-amber-500/10 text-amber-600",
            rose: "bg-rose-500/10 text-rose-600",
          };
          const valueColor: Record<string, string> = {
            blue: "text-foreground",
            emerald: "text-emerald-600",
            teal: "text-teal-600",
            amber: "text-amber-600",
            rose: "text-rose-600",
          };
          return (
            <div key={card.label} className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] text-muted-foreground block mb-0.5">{card.label}</span>
                <span className={`text-2xl font-black ${valueColor[card.color]}`}>{card.value}</span>
              </div>
              <div className={`w-10 h-10 rounded-xl ${colorMap[card.color]} text-xl flex items-center justify-center`}>
                {card.emoji}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="flex-1 relative flex items-center">
            <span className="absolute right-3.5 text-base text-muted-foreground pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الدواء، اسم الصيدلية الطالبة أو المستهدفة، أو الولاية..."
              className="w-full pr-10 pl-9 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E]"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl overflow-x-auto">
            {[
              { key: "all", label: `الكل (${stats.total})` },
              { key: "completed", label: `✅ مكتمل (${stats.completed})` },
              { key: "approved", label: `🟢 مقبول (${stats.approved})` },
              { key: "pending", label: `⏳ قيد الانتظار (${stats.pending})` },
              { key: "rejected", label: `❌ مرفوض (${stats.rejected})` },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setStatusFilter(btn.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === btn.key
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="bg-card border border-border rounded-2xl p-16 flex items-center justify-center shadow-xs">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-[#0EA96E]" />
            <span className="text-xs font-semibold">جارٍ جلب أرشيف التبادلات الوطني... 🔄</span>
          </div>
        </div>
      ) : exchanges.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center text-3xl">
            🗄️
          </div>
          <h4 className="font-bold text-sm text-foreground">لا توجد عمليات تبادل مطابقة</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            لم يتم العثور على أي سجلات تبادل تطابق معايير البحث أو الفلتر المحدد.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold">
                  <th className="py-4 px-5">الدواء المطلوب</th>
                  <th className="py-4 px-4 text-center">الكمية</th>
                  <th className="py-4 px-5">الصيدلية الطالبة (المُرسل)</th>
                  <th className="py-4 px-5">الصيدلية المستهدفة (المُستقبل)</th>
                  <th className="py-4 px-4 text-center">تاريخ الطلب</th>
                  <th className="py-4 px-4 text-center">الحالة</th>
                  <th className="py-4 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exchanges.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                    {/* Medicine */}
                    <td className="py-4 px-5 font-bold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-base">
                          💊
                        </div>
                        <div>
                          <p className="font-bold text-xs text-foreground">{item.medicineName}</p>
                          {item.genericName && item.genericName !== item.medicineName && (
                            <p className="text-[11px] text-muted-foreground font-normal">
                              {item.genericName}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-muted text-foreground font-black text-xs">
                        {item.requestedQuantity} وحدة
                      </span>
                    </td>

                    {/* From Pharmacy */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                          <span>🏥</span>
                          <span>{item.fromPharmacy.name}</span>
                          <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {item.fromPharmacy.wilaya}
                          </span>
                        </div>
                        <div className="pt-0.5">
                          <a
                            href={`tel:${item.fromPharmacy.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0EA96E] hover:underline bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/15"
                            dir="ltr"
                          >
                            <Phone className="w-3 h-3" />
                            {item.fromPharmacy.phone}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* To Pharmacy */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                          <span>🏥</span>
                          <span>{item.toPharmacy.name}</span>
                          <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            {item.toPharmacy.wilaya}
                          </span>
                        </div>
                        <div className="pt-0.5">
                          <a
                            href={`tel:${item.toPharmacy.phone}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0EA96E] hover:underline bg-emerald-500/5 px-2 py-0.5 rounded-md border border-emerald-500/15"
                            dir="ltr"
                          >
                            <Phone className="w-3 h-3" />
                            {item.toPharmacy.phone}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-center text-muted-foreground whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 text-xs">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{item.createdAt}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {item.status === "completed" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                          <span>✅</span>
                          مكتمل
                        </span>
                      ) : item.status === "approved" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-500/10 text-teal-700 dark:text-teal-400 font-bold text-xs border border-teal-500/20">
                          <span>🟢</span>
                          مقبول
                        </span>
                      ) : item.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                          <span>⏳</span>
                          قيد الانتظار
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 font-bold text-xs border border-rose-500/20">
                          <span>❌</span>
                          مرفوض
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base flex items-center gap-2">
                <span>🔄</span>
                تفاصيل عملية التبادل
              </h3>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Medicine Card */}
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold uppercase block">
                  الدواء والكمية
                </span>
                <p className="text-base font-black text-foreground">
                  💊 {selectedItem.medicineName}
                </p>
                {selectedItem.genericName && (
                  <p className="text-muted-foreground">الاسم العلمي: {selectedItem.genericName}</p>
                )}
                <p className="font-bold text-emerald-700 dark:text-emerald-400 pt-1">
                  الكمية المطلوبة: {selectedItem.requestedQuantity} وحدة
                </p>
              </div>

              {/* Both Pharmacies Flow */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="text-[10px] text-blue-600 font-bold uppercase block">
                    📥 الصيدلية الطالبة (من)
                  </span>
                  <p className="font-bold text-sm">{selectedItem.fromPharmacy.name}</p>
                  <p className="text-muted-foreground">📍 {selectedItem.fromPharmacy.wilaya} — {selectedItem.fromPharmacy.city}</p>
                  <a
                    href={`tel:${selectedItem.fromPharmacy.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-[#0EA96E] font-bold text-xs hover:bg-emerald-500/20 transition-colors"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {selectedItem.fromPharmacy.phone}
                  </a>
                </div>

                <div className="p-3.5 rounded-xl bg-muted/40 border border-border space-y-2">
                  <span className="text-[10px] text-purple-600 font-bold uppercase block">
                    📤 الصيدلية المستهدفة (إلى)
                  </span>
                  <p className="font-bold text-sm">{selectedItem.toPharmacy.name}</p>
                  <p className="text-muted-foreground">📍 {selectedItem.toPharmacy.wilaya} — {selectedItem.toPharmacy.city}</p>
                  <a
                    href={`tel:${selectedItem.toPharmacy.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-[#0EA96E] font-bold text-xs hover:bg-emerald-500/20 transition-colors"
                    dir="ltr"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {selectedItem.toPharmacy.phone}
                  </a>
                </div>
              </div>

              {/* Notes */}
              {selectedItem.notes && (
                <div className="p-3 rounded-xl bg-muted/30 border border-border space-y-1">
                  <span className="text-[10px] text-muted-foreground font-bold block">
                    📝 ملاحظات الطلب والتنسيق:
                  </span>
                  <p className="text-foreground italic">&ldquo;{selectedItem.notes}&rdquo;</p>
                </div>
              )}

              {/* Date & Status */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-muted-foreground">تاريخ الطلب: {selectedItem.createdAt}</span>
                <span className="font-bold text-foreground capitalize">
                  {selectedItem.status === "completed"
                    ? "✅ مكتمل"
                    : selectedItem.status === "approved"
                    ? "🟢 مقبول"
                    : selectedItem.status === "pending"
                    ? "⏳ قيد الانتظار"
                    : "❌ مرفوض"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="w-full py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
