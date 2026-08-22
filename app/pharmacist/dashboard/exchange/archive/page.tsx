"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import { Loader2, Search, X, Printer, ArrowRight, Phone, Calendar, Eye } from "lucide-react";

interface CompletedExchange {
  id: string;
  type: "incoming" | "outgoing";
  fromPharmacy: string;
  toPharmacy: string;
  fromPharmacyPhone?: string;
  toPharmacyPhone?: string;
  partnerPhone?: string;
  partnerCity?: string;
  medicineName: string;
  genericName?: string;
  requestedQuantity: number;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  notes?: string;
}

export default function ExchangeArchivePage() {
  const [exchanges, setExchanges] = useState<CompletedExchange[]>([]);
  const [selectedItem, setSelectedItem] = useState<CompletedExchange | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "incoming" | "outgoing">("all");

  const fetchCompletedExchanges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pharmacist/exchange?t=" + Date.now());
      if (res.ok) {
        const json = await res.json();
        const all: CompletedExchange[] = json.data?.requests || [];
        const completedOnly = all.filter((r) => r.status === "completed");
        setExchanges(completedOnly);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompletedExchanges();
  }, [fetchCompletedExchanges]);

  // Filtering
  const filteredExchanges = exchanges.filter((item) => {
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const s = search.toLowerCase();
    const matchesSearch =
      !search.trim() ||
      item.medicineName.toLowerCase().includes(s) ||
      item.fromPharmacy.toLowerCase().includes(s) ||
      item.toPharmacy.toLowerCase().includes(s) ||
      (item.partnerPhone && item.partnerPhone.includes(s));
    return matchesType && matchesSearch;
  });

  const incomingCompleted = exchanges.filter((r) => r.type === "incoming").length;
  const outgoingCompleted = exchanges.filter((r) => r.type === "outgoing").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-[#0EA96E]" />
          <span className="text-sm font-semibold">جارٍ تحميل أرشيف التبادلات المكتملة... 🗄️</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb / Return Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/pharmacist/dashboard/exchange"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0EA96E] hover:underline"
        >
          <ArrowRight className="w-4 h-4" />
          العودة لشبكة التبادل المباشرة
        </Link>
        <span className="text-xs text-muted-foreground">
          سجل التبادلات المكتملة والمؤرشفة
        </span>
      </div>

      <PageHeader
        title="🗄️ أرشيف عمليات التبادل المكتملة"
        description="جدول تفصيلي يوثق جميع عمليات تبادل الأدوية التي تمت بنجاح مع بيانات الاتصال السريعة"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              طباعة الأرشيف
            </button>
            <Link
              href="/pharmacist/dashboard/exchange"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              ➕ طلب تبادل جديد
            </Link>
          </div>
        }
      />

      {/* Overview Metric Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">إجمالي العمليات المكتملة</span>
            <span className="text-2xl font-black text-emerald-600">{exchanges.length}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-xl flex items-center justify-center">
            ✅
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">عمليات واردة تم توفيرها</span>
            <span className="text-2xl font-black text-blue-600">{incomingCompleted}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-xl flex items-center justify-center">
            📥
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground block mb-1">عمليات صادرة تم استلامها</span>
            <span className="text-2xl font-black text-purple-600">{outgoingCompleted}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-xl flex items-center justify-center">
            📤
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="flex-1 relative flex items-center">
            <span className="absolute right-3.5 text-base text-muted-foreground pointer-events-none">
              🔍
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث بالدواء، اسم الصيدلية، أو رقم الهاتف..."
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

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-xl">
            {[
              { key: "all" as const, label: `الكل (${exchanges.length})` },
              { key: "incoming" as const, label: `📥 الواردة (${incomingCompleted})` },
              { key: "outgoing" as const, label: `📤 الصادرة (${outgoingCompleted})` },
            ].map((btn) => (
              <button
                key={btn.key}
                onClick={() => setTypeFilter(btn.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  typeFilter === btn.key
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

      {/* Table Section */}
      {filteredExchanges.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center text-3xl">
            🗄️
          </div>
          <h4 className="font-bold text-sm text-foreground">لا توجد عمليات تبادل مكتملة في الأرشيف</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            حين يتم قبول طلبات التبادل وتأكيد اكتمالها بنجاح، ستتم أرشفتها تلقائياً وتظهر في هذا الجدول.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-muted/40 border-b border-border text-muted-foreground font-bold">
                  <th className="py-4 px-5">نوع العملية</th>
                  <th className="py-4 px-5">الدواء المطلوب</th>
                  <th className="py-4 px-4 text-center">الكمية</th>
                  <th className="py-4 px-5">الصيدلية الطرف الآخر</th>
                  <th className="py-4 px-4 text-center">رقم الهاتف للتواصل</th>
                  <th className="py-4 px-4 text-center">تاريخ الإكمال</th>
                  <th className="py-4 px-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExchanges.map((item) => {
                  const isIncoming = item.type === "incoming";
                  const partnerName = isIncoming ? item.fromPharmacy : item.toPharmacy;
                  const phone =
                    item.partnerPhone ||
                    (isIncoming ? item.fromPharmacyPhone : item.toPharmacyPhone);

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      {/* Direction */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                            isIncoming
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-purple-500/10 text-purple-600"
                          }`}
                        >
                          {isIncoming ? "📥 واردة" : "📤 صادرة"}
                        </span>
                      </td>

                      {/* Medicine */}
                      <td className="py-4 px-5 font-bold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 text-base">
                            💊
                          </div>
                          <div>
                            <p className="font-bold text-xs text-foreground">{item.medicineName}</p>
                            {item.genericName && item.genericName !== item.medicineName && (
                              <p className="text-[10px] text-muted-foreground font-normal">
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

                      {/* Partner Pharmacy */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <span>🏥</span>
                          <span>{partnerName}</span>
                          {item.partnerCity && (
                            <span className="text-[10px] font-normal px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                              {item.partnerCity}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone Number with Quick Call Button */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {phone ? (
                          <a
                            href={`tel:${phone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#0EA96E] font-bold text-xs transition-all border border-emerald-500/20"
                            dir="ltr"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{phone}</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
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
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20">
                          <span>✅</span>
                          مكتمل
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
