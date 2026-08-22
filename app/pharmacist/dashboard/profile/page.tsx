"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Save,
  CheckCircle2,
  Navigation,
  FileText,
  User,
  Loader2,
  AlertCircle,
  ShieldCheck,
  Compass,
  X,
  Sparkles,
} from "lucide-react";
import { ALGERIAN_WILAYAS_LIST } from "@/lib/algeria-coordinates";

export default function PharmacistProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    owner: "",
    phone: "",
    email: "",
    wilaya: "الجزائر",
    city: "",
    address: "",
    lat: "36.7538",
    lng: "3.0588",
    registrationNumber: "",
    isOnDuty: false,
    hoursWeekdays: "08:00 - 20:00",
    hoursSaturday: "08:00 - 18:00",
    hoursSunday: "مغلق",
    notes: "صيدلية معتمدة توفر أدوية الأمراض المزمنة والمستلزمات الطبية.",
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/pharmacist/profile", { cache: "no-store" });
        const json = await res.json();
        if (json.success && json.data) {
          setForm({
            name: json.data.name || "",
            owner: json.data.owner || "",
            phone: json.data.phone || "",
            email: json.data.email || "",
            wilaya: json.data.wilaya || "الجزائر",
            city: json.data.city || "",
            address: json.data.address || "",
            lat: json.data.lat || "36.7538",
            lng: json.data.lng || "3.0588",
            registrationNumber: json.data.registrationNumber || "REG-2026-DZ",
            isOnDuty: !!json.data.isOnDuty,
            hoursWeekdays: json.data.hoursWeekdays || "08:00 - 20:00",
            hoursSaturday: json.data.hoursSaturday || "08:00 - 18:00",
            hoursSunday: json.data.hoursSunday || "مغلق",
            notes: json.data.notes || "",
          });
        }
      } catch (err) {
        console.error("Failed to load pharmacist profile", err);
        setError("تعذّر جلب بيانات ملف الصيدلية");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleGetCurrentLocation = () => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm((prev) => ({
            ...prev,
            lat: pos.coords.latitude.toFixed(4),
            lng: pos.coords.longitude.toFixed(4),
          }));
        },
        (err) => {
          console.warn("Geolocation denied or unavailable:", err.message);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch("/api/pharmacist/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "فشل حفظ التعديلات");
      }

      setSaved(true);
      // Auto-dismiss after 5s
      setTimeout(() => setSaved(false), 5000);
    } catch (err: any) {
      console.error("Failed to save pharmacist profile:", err);
      setError(err.message || "حدث خطأ أثناء حفظ الملف الشخصي");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-3xl">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0EA96E] mb-3" />
        جارٍ تحميل بيانات ملف الصيدلية من قاعدة البيانات...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto relative">
      {/* Floating Modern Toast Notification */}
      {saved && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-xl animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-[#0a2318] text-white border border-[#0EA96E]/50 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-[#0EA96E]/20 flex items-start justify-between gap-4 backdrop-blur-md">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#0EA96E] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#0EA96E]/30 animate-pulse">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-white">تم حفظ التعديلات بنجاح! 🎉</h4>
                  <span className="px-2 py-0.5 rounded-md bg-[#0EA96E]/30 text-[#0EA96E] text-[10px] font-bold">
                    محدّث الآن
                  </span>
                </div>
                <p className="text-xs text-white/80 leading-5">
                  تم حفظ بيانات <strong className="text-white font-bold">{form.name}</strong> في قاعدة البيانات، وتظهر التعديلات الآن للمواطنين على الخريطة والبحث.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSaved(false)}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors shrink-0"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <PageHeader
          title="ملف الصيدلية ومعلومات الاعتماد"
          description="إدارة معلومات صيدليتك، أوقات العمل والمناوبة، والبيانات الظاهرة للمواطنين على الخريطة"
        />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0EA96E] text-xs font-bold shrink-0 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          صيدلية معتمدة بالشبكة الوطنية 🟢
        </div>
      </div>

      {/* In-Card Feedback Alert */}
      {saved && (
        <div className="p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-[#0EA96E]" />
            <span>تم تحديث ملف الصيدلية وحفظ كافة التغييرات بنجاح في قاعدة البيانات!</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">نشط الآن 🟢</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center gap-2 pb-3 border-b border-border text-foreground font-black text-sm sm:text-base">
            <Building2 className="w-5 h-5 text-[#0EA96E]" />
            المعلومات الأساسية وبيانات الاعتماد
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                اسم الصيدلية <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="مثال: صيدلية بلعباس"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm font-bold focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                اسم الصيدلي المسؤول <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
                required
                placeholder="مثال: د. خيرالدين دبز"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm font-bold focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                رقم الهاتف المباشر <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                placeholder="مثال: 0696543218"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                البريد الإلكتروني المهني <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="example@gmail.com"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                رقم الاعتماد المهني / التسجيل الوطني
              </label>
              <input
                type="text"
                value={form.registrationNumber}
                readOnly
                className="w-full px-4 py-2.5 rounded-xl bg-muted/60 border border-border text-xs sm:text-sm text-muted-foreground font-mono cursor-not-allowed"
              />
              <span className="text-[10px] text-muted-foreground mt-1 block">
                رقم الاعتماد رسمي ومسجل لدى وزارة الصحة ولا يمكن تعديله إلا عبر مراسلة الإدارة.
              </span>
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-foreground font-black text-sm sm:text-base">
              <MapPin className="w-5 h-5 text-[#0EA96E]" />
              الموقع الجغرافي والعنوان على الخريطة (GPS)
            </div>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0EA96E]/10 hover:bg-[#0EA96E]/20 text-[#0EA96E] text-xs font-bold transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              تحديد موقعي الحالي
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                الولاية <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.wilaya}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const found = ALGERIAN_WILAYAS_LIST.find((w) => w.name === selectedName);
                  setForm((prev) => ({
                    ...prev,
                    wilaya: selectedName,
                    lat: found ? found.lat.toString() : prev.lat,
                    lng: found ? found.lng.toString() : prev.lng,
                  }));
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm font-bold focus:outline-none focus:border-[#0EA96E] transition-all"
              >
                {ALGERIAN_WILAYAS_LIST.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.code} — {w.name} ({w.nameFr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                البلدية / المدينة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                required
                placeholder="مثال: عنابة وسط"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                العنوان التفصيلي <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                required
                placeholder="مثال: شارع بن بولعيد، عمارة 14"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                خط العرض (Latitude)
              </label>
              <input
                type="text"
                value={form.lat}
                onChange={(e) => setForm({ ...form, lat: e.target.value })}
                placeholder="مثال: 36.9000"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm font-mono focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                خط الطول (Longitude)
              </label>
              <input
                type="text"
                value={form.lng}
                onChange={(e) => setForm({ ...form, lng: e.target.value })}
                placeholder="مثال: 7.7667"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm font-mono focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Duty Status */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
            <div className="flex items-center gap-2 text-foreground font-black text-sm sm:text-base">
              <Clock className="w-5 h-5 text-[#0EA96E]" />
              أوقات العمل والمناوبة (Garde)
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer p-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
              <input
                type="checkbox"
                checked={form.isOnDuty}
                onChange={(e) => setForm({ ...form, isOnDuty: e.target.checked })}
                className="w-4 h-4 rounded text-[#0EA96E] focus:ring-[#0EA96E]"
              />
              <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                صيدلية مناوبة حالياً (Pharmacie de Garde 🌙)
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                أيام الأسبوع (الأحد - الخميس)
              </label>
              <input
                type="text"
                value={form.hoursWeekdays}
                onChange={(e) => setForm({ ...form, hoursWeekdays: e.target.value })}
                placeholder="08:00 - 20:00"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                السبت
              </label>
              <input
                type="text"
                value={form.hoursSaturday}
                onChange={(e) => setForm({ ...form, hoursSaturday: e.target.value })}
                placeholder="08:00 - 18:00"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 text-foreground">
                الجمعة
              </label>
              <input
                type="text"
                value={form.hoursSunday}
                onChange={(e) => setForm({ ...form, hoursSunday: e.target.value })}
                placeholder="مغلق أو مناوبة"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold mb-1.5 text-foreground">
              نبذة عن الصيدلية والخدمات الإضافية
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="مثال: نوفر قياس الضغط، السكر، استشارات دوائية، وطلب أدوية نادرة..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-xs sm:text-sm focus:outline-none focus:border-[#0EA96E] transition-all"
            />
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className={`inline-flex items-center gap-2 px-8 py-3.5 font-bold rounded-2xl text-xs sm:text-sm shadow-lg transition-all disabled:opacity-50 ${
              saved
                ? "bg-emerald-600 text-white shadow-emerald-500/30"
                : "bg-[#0EA96E] hover:bg-[#0A7A50] text-white shadow-[#0EA96E]/20 hover:shadow-xl hover:-translate-y-0.5"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جارٍ حفظ التغييرات بقاعدة البيانات...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                تم حفظ التغييرات بنجاح!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
