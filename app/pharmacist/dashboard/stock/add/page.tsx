"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  ArrowRight,
  Save,
  CheckCircle2,
  Pill,
  Loader2,
  AlertCircle,
  Search,
  Package,
} from "lucide-react";

type MedicineOption = {
  id: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  dosage: string;
  manufacturer: string;
};

// Auto-detect status from quantity
function quantityToStatus(q: number): "available" | "limited" | "unavailable" {
  if (q === 0) return "unavailable";
  if (q < 10) return "limited";
  return "available";
}

const STATUS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  available: { label: "متوفر", emoji: "🟢", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
  limited: { label: "محدود", emoji: "🟡", color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
  unavailable: { label: "غير متوفر", emoji: "🔴", color: "text-rose-600 bg-rose-500/10 border-rose-500/30" },
};

export default function AddStockItemPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [medicinesList, setMedicinesList] = useState<MedicineOption[]>([]);
  const [selectedMed, setSelectedMed] = useState<MedicineOption | null>(null);

  const [quantity, setQuantity] = useState<string>("50");
  const [expiryDate, setExpiryDate] = useState<string>("2027-12-31");

  // Auto-computed status
  const autoStatus = quantityToStatus(parseInt(quantity, 10) || 0);
  const statusInfo = STATUS_LABELS[autoStatus];

  // Load medicines from catalog
  useEffect(() => {
    async function loadMedicines() {
      try {
        // Fetch all pages up to 100 per page, deduplicate by id
        const [res1, res2] = await Promise.all([
          fetch("/api/medicines?limit=100&page=1"),
          fetch("/api/medicines?limit=100&page=2"),
        ]);
        const [j1, j2] = await Promise.all([res1.json(), res2.json()]);
        const combined = [
          ...(j1.success ? j1.data : []),
          ...(j2.success ? j2.data : []),
        ];
        // Deduplicate by id — page 2 may repeat page 1 if total < 100
        const seen = new Set<string>();
        const unique = combined.filter((m) => {
          if (seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });
        if (unique.length > 0) {
          setMedicinesList(unique);
          setSelectedMed(unique[0]);
        } else {
          setError("تعذّر تحميل الكتالوج. تأكد من اتصالك بالخادم.");
        }
      } catch (err) {
        console.error("Failed to load medicines", err);
        setError("حدث خطأ أثناء تحميل قائمة الأدوية.");
      } finally {
        setLoading(false);
      }
    }
    loadMedicines();
  }, []);

  const filteredMedicines = medicinesList.filter((m) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(q) ||
      m.genericName.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMed) {
      setError("يرجى اختيار دواء من الكتالوج أولاً");
      return;
    }
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setError("يرجى إدخال كمية صحيحة (0 أو أكثر)");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/pharmacist/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: selectedMed.id,
          quantity: qty,
          status: autoStatus,
          expiryDate,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "فشل حفظ الدواء في المخزون");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/pharmacist/dashboard/stock");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error("Failed to add stock:", err);
      setError(err.message || "حدث خطأ أثناء حفظ المخزون");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/pharmacist/dashboard/stock"
          className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
        <PageHeader
          title="إضافة دواء جديد إلى المخزون"
          description="اختر دواءً من الكتالوج الوطني، حدّد الكمية المتوفرة وتاريخ الصلاحية"
        />
      </div>

      {/* Success Banner */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          تمت إضافة الدواء بنجاح إلى مخزون صيدليتك! جارٍ التحويل...
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-3xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0EA96E] mb-3" />
          جارٍ تحميل قائمة الأدوية من الكتالوج الوطني...
        </div>
      ) : medicinesList.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-3xl space-y-3">
          <Pill className="w-10 h-10 mx-auto opacity-50" />
          <p className="font-bold text-sm text-foreground">لا توجد أدوية في الكتالوج الوطني حالياً</p>
          <p className="text-xs">اطلب من إدارة تطبيق الويب إضافة الأدوية إلى الكتالوج أولاً.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Pick Medicine */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <div className="w-7 h-7 rounded-lg bg-[#0EA96E] text-white flex items-center justify-center text-xs font-black">١</div>
              <span className="font-black text-sm text-foreground">اختر الدواء من الكتالوج الوطني</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن الدواء بالاسم أو الاسم العلمي أو الفئة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            {/* Medicine List */}
            <div className="max-h-48 overflow-y-auto rounded-xl border border-border divide-y divide-border">
              {filteredMedicines.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  لا توجد نتائج تطابق &ldquo;{searchQuery}&rdquo;
                </div>
              ) : (
                filteredMedicines.map((med) => (
                  <button
                    key={med.id}
                    type="button"
                    onClick={() => setSelectedMed(med)}
                    className={`w-full px-4 py-3 text-right flex items-center gap-3 transition-colors ${
                      selectedMed?.id === med.id
                        ? "bg-[#0EA96E]/10 border-r-2 border-[#0EA96E]"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        selectedMed?.id === med.id
                          ? "bg-[#0EA96E] text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Pill className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-foreground truncate">{med.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {med.genericName} · {med.category} · {med.form} ({med.dosage})
                      </p>
                    </div>
                    {selectedMed?.id === med.id && (
                      <CheckCircle2 className="w-4 h-4 text-[#0EA96E] shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Selected Preview */}
            {selectedMed && (
              <div className="bg-[#0EA96E]/5 border border-[#0EA96E]/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#0EA96E]/20 text-[#0EA96E] flex items-center justify-center">
                  <Pill className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-black text-sm text-foreground">{selectedMed.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {selectedMed.genericName} · {selectedMed.category} · {selectedMed.form} ({selectedMed.dosage})
                  </p>
                  <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                    المصنّع: {selectedMed.manufacturer}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Quantity & Status */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <div className="w-7 h-7 rounded-lg bg-[#0EA96E] text-white flex items-center justify-center text-xs font-black">٢</div>
              <span className="font-black text-sm text-foreground">الكمية وتاريخ الصلاحية</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold mb-2 text-foreground">
                  الكمية المتوفرة (بالعلبة) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm font-bold focus:outline-none focus:border-[#0EA96E] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-foreground">
                  تاريخ نهاية الصلاحية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
                />
              </div>
            </div>

            {/* Auto Status Preview */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
              <Package className="w-5 h-5 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-foreground">حالة التوفر التلقائية</p>
                <p className="text-[11px] text-muted-foreground">
                  محسوبة أوتوماتيكياً بناءً على الكمية المدخلة
                </p>
              </div>
              <span className={`px-3 py-1.5 rounded-xl border text-xs font-black ${statusInfo.color}`}>
                {statusInfo.emoji} {statusInfo.label}
              </span>
            </div>

            {/* Status Guide */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { range: "≥ 10 علبة", status: "available", label: "متوفر 🟢" },
                { range: "1 – 9 علب", status: "limited", label: "محدود 🟡" },
                { range: "0 علبة", status: "unavailable", label: "غير متوفر 🔴" },
              ].map((g) => (
                <div
                  key={g.status}
                  className={`p-2.5 rounded-xl text-center text-[10px] border ${
                    autoStatus === g.status
                      ? STATUS_LABELS[g.status].color + " font-black"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <div className="font-bold">{g.label}</div>
                  <div className="text-[10px] mt-0.5 opacity-70">{g.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/pharmacist/dashboard/stock"
              className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-colors"
            >
              إلغاء
            </Link>
            <button
              type="submit"
              disabled={submitting || success || !selectedMed}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ الحفظ...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  حفظ في المخزون
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
