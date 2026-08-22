"use client";

import { useState, use, Suspense, useEffect } from "react";
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
  Package,
} from "lucide-react";

type StockItemData = {
  id: string;
  medicineId: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  dosage: string;
  quantity: number;
  status: string;
  expiryDate: string;
};

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

function EditStockContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [stockItem, setStockItem] = useState<StockItemData | null>(null);
  const [quantity, setQuantity] = useState<string>("20");
  const [expiryDate, setExpiryDate] = useState<string>("2027-06-30");

  // Auto-computed status based on current quantity input
  const autoStatus = quantityToStatus(parseInt(quantity, 10) || 0);
  const statusInfo = STATUS_LABELS[autoStatus];

  useEffect(() => {
    async function loadItem() {
      try {
        const res = await fetch(`/api/pharmacist/stock/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setStockItem(json.data);
          setQuantity(json.data.quantity.toString());
          setExpiryDate(json.data.expiryDate);
        }
      } catch (err) {
        console.error("Failed to load stock item", err);
        setError("تعذّر تحميل بيانات الدواء من المخزون");
      } finally {
        setLoading(false);
      }
    }
    loadItem();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setError("يرجى إدخال كمية صحيحة (0 أو أكثر)");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/pharmacist/stock/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quantity: qty,
          status: autoStatus,
          expiryDate,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "فشل تحديث المخزون");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/pharmacist/dashboard/stock");
        router.refresh();
      }, 1000);
    } catch (err: any) {
      console.error("Failed to save stock item", err);
      setError(err.message || "حدث خطأ أثناء تحديث المخزون");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-3xl">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0EA96E] mb-3" />
        جارٍ تحميل بيانات المخزون...
      </div>
    );
  }

  if (!stockItem) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-3xl">
        <AlertCircle className="w-8 h-8 mx-auto mb-3 text-rose-500" />
        <p className="font-bold text-sm">لم يتم العثور على الدواء في المخزون</p>
        <Link href="/pharmacist/dashboard/stock" className="text-xs text-[#0EA96E] font-bold mt-2 block">
          العودة لقائمة المخزون
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Medicine Info Card */}
      <div className="bg-card border border-border rounded-3xl p-5 flex items-center gap-4 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-[#0EA96E]/10 text-[#0EA96E] flex items-center justify-center">
          <Pill className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-base text-foreground">{stockItem.name}</h3>
          <p className="text-xs text-muted-foreground">
            {stockItem.genericName} · {stockItem.category} · {stockItem.form} ({stockItem.dosage})
          </p>
        </div>
        <span className="text-[11px] px-3 py-1.5 rounded-xl bg-muted border border-border font-semibold text-muted-foreground shrink-0">
          الكمية الحالية: <strong className="text-foreground">{stockItem.quantity}</strong>
        </span>
      </div>

      {/* Success / Error alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          تم تحديث المخزون بنجاح! الحالة تغيّرت تلقائياً. جارٍ التحويل...
        </div>
      )}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-6 space-y-5 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-border">
          <Package className="w-5 h-5 text-[#0EA96E]" />
          <span className="font-black text-sm text-foreground">تعديل الكمية وتاريخ الصلاحية</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-foreground mb-2 block">
              الكمية الجديدة (بالعلبة) <span className="text-rose-500">*</span>
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
            <label className="text-xs font-bold text-foreground mb-2 block">
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

        {/* Auto status preview */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/30 border border-border">
          <Package className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold text-foreground">حالة التوفر المحدّثة (تلقائية)</p>
            <p className="text-[11px] text-muted-foreground">
              تُحسب أوتوماتيكياً من الكمية — لا تحتاج لاختيار يدوي
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

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <Link
            href="/pharmacist/dashboard/stock"
            className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={saving || success}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditStockItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/pharmacist/dashboard/stock"
          className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
        <PageHeader
          title="تعديل مخزون الدواء"
          description="تحديث الكميات المتوفرة — الحالة تتغيّر تلقائياً بناءً على الكمية"
        />
      </div>

      <Suspense
        fallback={
          <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-3xl">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0EA96E] mb-3" />
            جارٍ التحميل...
          </div>
        }
      >
        <EditStockContent params={params} />
      </Suspense>
    </div>
  );
}
