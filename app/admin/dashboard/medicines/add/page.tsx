"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  ArrowRight,
  Save,
  CheckCircle2,
  AlertCircle,
  Pill,
  Loader2,
  Building,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  "مسكنات الألم",
  "مضادات حيوية",
  "مضادات الالتهاب",
  "فيتامينات ومكملات",
  "أدوية القلب والأوعية",
  "أدوية الجهاز الهضمي",
  "أدوية السكري",
  "أدوية الجهاز التنفسي",
  "أدوية الحساسية",
  "أدوية الأعصاب والطب النفسي",
  "أدوية الجلد",
  "أدوية العيون",
];

const FORMS = [
  { label: "أقراص (Comprimés)", value: "أقراص" },
  { label: "كبسولات (Gélules)", value: "كبسولات" },
  { label: "شراب (Sirop)", value: "شراب" },
  { label: "حقن (Injectable)", value: "حقن" },
  { label: "أكياس مسحوق (Sachets)", value: "أكياس مسحوق" },
  { label: "مرهم / كريم (Pommade / Crème)", value: "مرهم / كريم" },
  { label: "بخاخ استنشاق (Inhalateur / Spray)", value: "بخاخ استنشاق" },
  { label: "قطرات (Gouttes)", value: "قطرات" },
  { label: "تحاميل (Suppositoires)", value: "تحاميل" },
];

const POPULAR_MANUFACTURERS = [
  "SAIDAL (الجزائر)",
  "Biopharm (الجزائر)",
  "Sanofi",
  "GSK",
  "AstraZeneca",
  "Merck",
  "Novartis",
  "Pfizer",
  "Pierre Fabre",
  "Hikma",
  "Merinal (الجزائر)",
  "Beker (الجزائر)",
];

export default function AdminAddMedicinePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "مسكنات الألم",
    form: "أقراص",
    dosage: "",
    manufacturer: "SAIDAL (الجزائر)",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/medicines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "فشل حفظ الدواء في الكتالوج");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/dashboard/medicines");
      }, 1200);
    } catch (err: any) {
      console.error("Add medicine error:", err);
      setError(err.message || "حدث خطأ أثناء حفظ الدواء");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/dashboard/medicines"
          className="p-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors shadow-xs"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
        <PageHeader
          title="إضافة دواء جديد إلى الكتالوج الوطني"
          description="تسجيل وإدراج صنف دوائي جديد ليصبح متاحاً للبحث وإدارة المخزون لكافة الصيدليات"
        />
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>تمت إضافة الدواء بنجاح إلى الكتالوج الوطني! جارٍ التحويل إلى القائمة...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs"
      >
        <div className="flex items-center gap-2 pb-4 border-b border-border text-foreground font-black text-sm">
          <Pill className="w-5 h-5 text-[#1A6EBD]" />
          <span>بيانات الصنف الدوائي</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Trade Name */}
          <div>
            <label className="block text-xs font-bold mb-2 text-foreground">
              اسم الدواء التجاري <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: Paracétamol 1g أو Doliprane"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#1A6EBD] transition-all"
            />
          </div>

          {/* DCI Generic Name */}
          <div>
            <label className="block text-xs font-bold mb-2 text-foreground">
              الاسم العلمي (DCI) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: Paracétamol أو Amoxicilline"
              value={form.genericName}
              onChange={(e) => setForm({ ...form, genericName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#1A6EBD] transition-all"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold mb-2 text-foreground">
              الفئة العلاجية <span className="text-red-500">*</span>
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#1A6EBD] transition-all"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Pharmaceutical Form */}
          <div>
            <label className="block text-xs font-bold mb-2 text-foreground">
              الشكل الصيدلاني <span className="text-red-500">*</span>
            </label>
            <select
              value={form.form}
              onChange={(e) => setForm({ ...form, form: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#1A6EBD] transition-all"
            >
              {FORMS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dosage */}
          <div>
            <label className="block text-xs font-bold mb-2 text-foreground">
              الجرعة والتركيز <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: 500mg أو 1g أو 100µg"
              value={form.dosage}
              onChange={(e) => setForm({ ...form, dosage: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#1A6EBD] transition-all"
            />
          </div>

          {/* Manufacturer */}
          <div>
            <label className="block text-xs font-bold mb-2 text-foreground">
              المخبَر / المصنّع <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="مثال: SAIDAL أو Biopharm أو Sanofi"
              value={form.manufacturer}
              onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#1A6EBD] transition-all"
            />
            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {POPULAR_MANUFACTURERS.slice(0, 4).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, manufacturer: m })}
                  className="px-2 py-0.5 rounded-lg bg-muted text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
          <Link
            href="/admin/dashboard/medicines"
            className="px-5 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1A6EBD] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ الحفظ في الكتالوج...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ وإدراج الدواء
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
