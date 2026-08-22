"use client";

import { useState, use, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import { ArrowRight, Save, CheckCircle2, Loader2 } from "lucide-react";

function EditMedicineForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    genericName: "",
    category: "مسكنات الألم",
    form: "أقراص",
    dosage: "",
    manufacturer: "",
  });

  useEffect(() => {
    async function loadMed() {
      try {
        const res = await fetch(`/api/admin/medicines/${id}`);
        const json = await res.json();
        if (json.success && json.data) {
          setForm({
            name: json.data.name,
            genericName: json.data.genericName,
            category: json.data.category,
            form: json.data.form,
            dosage: json.data.dosage,
            manufacturer: json.data.manufacturer,
          });
        }
      } catch (err) {
        console.error("Failed to load medicine", err);
      } finally {
        setLoading(false);
      }
    }
    loadMed();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/medicines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/dashboard/medicines");
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to save medicine", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1A6EBD] mb-3" />
        جارٍ تحميل بيانات الدواء...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-card border border-border rounded-2xl p-6 shadow-xs">
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center gap-3 text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          تم تحديث بيانات الدواء في الكتالوج الوطني بنجاح! جاري التوجيه...
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-foreground mb-1.5 block">
            اسم الدواء التجاري <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1.5 block">
            الاسم العلمي (DCI) <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.genericName}
            onChange={(e) => setForm({ ...form, genericName: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1.5 block">
            الفئة العلاجية <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          >
            <option value="مسكنات الألم">مسكنات الألم</option>
            <option value="مضادات حيوية">مضادات حيوية</option>
            <option value="مضادات الالتهاب">مضادات الالتهاب</option>
            <option value="فيتامينات ومكملات">فيتامينات ومكملات</option>
            <option value="أدوية السكري">أدوية السكري</option>
            <option value="أدوية القلب">أدوية القلب</option>
            <option value="أدوية الغدة الدرقية">أدوية الغدة الدرقية</option>
            <option value="مضادات الحساسية">مضادات الحساسية</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1.5 block">
            الشكل الصيدلاني <span className="text-rose-500">*</span>
          </label>
          <select
            value={form.form}
            onChange={(e) => setForm({ ...form, form: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          >
            <option value="أقراص">أقراص</option>
            <option value="كبسولات">كبسولات</option>
            <option value="شراب">شراب</option>
            <option value="حقن / أمبولات">حقن / أمبولات</option>
            <option value="مرهم / كريم">مرهم / كريم</option>
            <option value="قطرات">قطرات</option>
            <option value="بخاخ">بخاخ</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1.5 block">
            الجرعة / التركيز <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1.5 block">
            المصنّع / المخبَر <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.manufacturer}
            onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Link
          href="/admin/dashboard/medicines"
          className="px-4 py-2 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-colors"
        >
          إلغاء
        </Link>
        <button
          type="submit"
          disabled={saving || success}
          className="inline-flex items-center gap-2 px-5 py-2 bg-[#1A6EBD] hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ التعديلات
        </button>
      </div>
    </form>
  );
}

export default function AdminEditMedicinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/dashboard/medicines"
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
        <PageHeader
          title="تعديل دواء في الكتالوج"
          description="تحديث المعلومات الأساسية للدواء المسجل في الكتالوج الوطني"
        />
      </div>

      <Suspense
        fallback={
          <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1A6EBD] mb-3" />
            جارٍ التحميل...
          </div>
        }
      >
        <EditMedicineForm params={params} />
      </Suspense>
    </div>
  );
}
