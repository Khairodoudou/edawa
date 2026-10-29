"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Eye,
  EyeOff,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Building2,
  Hospital,
  CreditCard,
  Sparkles,
  ShieldCheck,
  MapPin,
  Clock,
  User,
  AlertCircle,
  Loader2,
  Package,
  Search,
  Check,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "معلومات الصيدلي" },
  { id: 2, label: "معلومات الصيدلية" },
  { id: 3, label: "أوقات العمل والموقع" },
  { id: 4, label: "باقة الاشتراك" },
  { id: 5, label: "مراجعة وإرسال" },
];

const algeriaWilayas = [
  "01 - أدرار",
  "02 - الشلف",
  "03 - الأغواط",
  "04 - أم البواقي",
  "05 - باتنة",
  "06 - بجاية",
  "07 - بسكرة",
  "08 - بشار",
  "09 - البليدة",
  "10 - البويرة",
  "11 - تمنراست",
  "12 - تبسة",
  "13 - تلمسان",
  "14 - تيارت",
  "15 - تيزي وزو",
  "16 - الجزائر العاصمة",
  "17 - الجلفة",
  "18 - جيجل",
  "19 - سطيف",
  "20 - سعيدة",
  "21 - سكيكدة",
  "22 - سيدي بلعباس",
  "23 - عنابة",
  "24 - قالمة",
  "25 - قسنطينة",
  "26 - المدية",
  "27 - مستغانم",
  "28 - المسيلة",
  "29 - معسكر",
  "30 - ورقلة",
  "31 - وهران",
  "32 - البيض",
  "33 - إليزي",
  "34 - برج بوعريريج",
  "35 - بومرداس",
  "36 - الطارف",
  "37 - تندوف",
  "38 - تيسمسيلت",
  "39 - الوادي",
  "40 - خنشلة",
  "41 - سوق أهراس",
  "42 - تيبازة",
  "43 - ميلة",
  "44 - عين الدفلى",
  "45 - النعامة",
  "46 - عين تموشنت",
  "47 - غرداية",
  "48 - غليزان",
  "49 - تيميمون",
  "50 - برج باجي مختار",
  "51 - أولاد جلال",
  "52 - بني عباس",
  "53 - عين صالح",
  "54 - عين قزام",
  "55 - تقرت",
  "56 - جانت",
  "57 - المغير",
  "58 - المنيعة",
];

export default function PharmacistRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    pharmacyName: "",
    registrationNumber: "",
    address: "",
    wilaya: "16 - الجزائر العاصمة",
    city: "",
    openTime: "08:00",
    closeTime: "21:00",
    openDays: "السبت — الخميس",
    isOnDuty: false,
    latitude: "",
    longitude: "",
    plan: "monthly" as "monthly" | "yearly",
  });

  const update = (key: string, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const next = () => {
    setErrorMsg(null);
    setStep((s) => Math.min(s + 1, 5));
  };

  const back = () => {
    setErrorMsg(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (form.password !== form.confirmPassword) {
      setErrorMsg("كلمتا المرور غير متطابقتين");
      setStep(1);
      return;
    }

    if (!agreed) {
      setErrorMsg("يجب الموافقة على الشروط والأحكام لإتمام التسجيل");
      return;
    }

    setLoading(true);

    try {
      // Clean wilaya string (extract name if it has code prefix)
      const wilayaClean = form.wilaya.replace(/^\d+\s*-\s*/, "").trim();

      const payload = {
        ownerName: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        pharmacyName: form.pharmacyName.trim(),
        registrationNumber: form.registrationNumber.trim(),
        wilaya: wilayaClean,
        city: form.city.trim(),
        address: form.address.trim(),
        openTime: form.openTime,
        closeTime: form.closeTime,
        openDays: form.openDays,
        isOnDuty: form.isOnDuty,
        latitude: form.latitude,
        longitude: form.longitude,
        plan: form.plan,
      };

      const res = await fetch("/api/pharmacist/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setErrorMsg(json.error || "حدث خطأ أثناء إرسال البيانات، يرجى المحاولة لاحقاً");
        setLoading(false);
        return;
      }

      // Successful registration! Redirect to pending confirmation page
      router.push("/pharmacist/pending");
    } catch (err) {
      console.error("Register submit error:", err);
      setErrorMsg("حدث خطأ في الاتصال بالخادم، يرجى التحقق من اتصالك بالإنترنت");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#0EA96E] focus:ring-2 focus:ring-[#0EA96E]/20 text-xs sm:text-sm transition-all";

  const labelClass = "text-xs sm:text-sm font-bold text-foreground mb-1.5 block";

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-[#E8FBF4]/60 via-background to-background pt-28 pb-20 flex flex-col justify-center items-center px-4 relative">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.png"
                alt="دوائي"
                width={120}
                height={120}
                className="w-24 h-24 object-contain drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2 flex items-center justify-center gap-2">
              تسجيل صيدلية جديدة
              <Hospital className="w-7 h-7 text-[#0EA96E]" />
            </h1>
            <p className="text-muted-foreground text-xs sm:text-sm">
              انضم إلى الشبكة الوطنية لتطبيق ويب دوائي واجعل صيدليتك مرئية لآلاف المواطنين
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto py-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-black border-2 transition-all ${
                      step > s.id
                        ? "bg-[#0EA96E] border-[#0EA96E] text-white"
                        : step === s.id
                        ? "bg-[#0EA96E]/15 border-[#0EA96E] text-[#0EA96E]"
                        : "bg-muted border-border text-muted-foreground"
                    }`}
                  >
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : s.id}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs mt-1 font-semibold hidden md:block ${
                      step === s.id ? "text-[#0EA96E]" : "text-muted-foreground"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-14 h-0.5 mx-1 transition-colors ${
                      step > s.id ? "bg-[#0EA96E]" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl">
            <form
              onSubmit={
                step === 5
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      next();
                    }
              }
            >
              {/* Step 1 — Manager Info */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border mb-4">
                    <User className="w-5 h-5 text-[#0EA96E]" />
                    <h2 className="text-lg sm:text-xl font-black text-foreground">
                      1. معلومات الصيدلي المدير المسؤول
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>الاسم *</label>
                      <input
                        required
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        placeholder="الاسم الأول"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>اللقب *</label>
                      <input
                        required
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        placeholder="اسم العائلة"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>البريد الإلكتروني *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="pharmacist@example.com"
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>رقم الهاتف *</label>
                    <input
                      required
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="0550 12 34 56"
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>كلمة المرور *</label>
                      <div className="relative">
                        <input
                          required
                          type={showPass ? "text" : "password"}
                          value={form.password}
                          onChange={(e) => update("password", e.target.value)}
                          placeholder="6 أحرف على الأقل"
                          className={`${inputClass} pl-11`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>تأكيد كلمة المرور *</label>
                      <input
                        required
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => update("confirmPassword", e.target.value)}
                        placeholder="أعد كتابة كلمة المرور"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 — Pharmacy Info */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border mb-4">
                    <Building2 className="w-5 h-5 text-[#0EA96E]" />
                    <h2 className="text-lg sm:text-xl font-black text-foreground">
                      2. معلومات الصيدلية والاعتماد
                    </h2>
                  </div>

                  <div>
                    <label className={labelClass}>اسم الصيدلية الرسمي *</label>
                    <input
                      required
                      value={form.pharmacyName}
                      onChange={(e) => update("pharmacyName", e.target.value)}
                      placeholder="مثال: صيدلية الأمل المركزية"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>رقم الترخيص / الاعتماد الصيدلاني *</label>
                    <input
                      required
                      value={form.registrationNumber}
                      onChange={(e) => update("registrationNumber", e.target.value)}
                      placeholder="مثال: PH-16-0982"
                      className={inputClass}
                      dir="ltr"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>الولاية *</label>
                      <select
                        required
                        value={form.wilaya}
                        onChange={(e) => update("wilaya", e.target.value)}
                        className={`${inputClass} appearance-none`}
                      >
                        {algeriaWilayas.map((w) => (
                          <option key={w} value={w}>
                            {w}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>البلدية / الحي *</label>
                      <input
                        required
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        placeholder="مثال: باب الزوار"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>العنوان الجغرافي الكامل *</label>
                    <textarea
                      required
                      rows={2}
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="الشارع، رقم المبنى، المعلم القريب..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>
                </div>
              )}

              {/* Step 3 — Hours & Location */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-border mb-4">
                    <Clock className="w-5 h-5 text-[#0EA96E]" />
                    <h2 className="text-lg sm:text-xl font-black text-foreground">
                      3. أوقات العمل والموقع الجغرافي
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>وقت الفتح *</label>
                      <input
                        type="time"
                        value={form.openTime}
                        onChange={(e) => update("openTime", e.target.value)}
                        className={inputClass}
                        dir="ltr"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>وقت الإغلاق *</label>
                      <input
                        type="time"
                        value={form.closeTime}
                        onChange={(e) => update("closeTime", e.target.value)}
                        className={inputClass}
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>أيام العمل *</label>
                    <select
                      value={form.openDays}
                      onChange={(e) => update("openDays", e.target.value)}
                      className={`${inputClass} appearance-none`}
                    >
                      <option>السبت — الخميس</option>
                      <option>الأحد — الخميس</option>
                      <option>طوال أيام الأسبوع (7/7)</option>
                      <option>السبت — الجمعة</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-[#0EA96E]/10 border border-[#0EA96E]/30">
                    <input
                      type="checkbox"
                      id="onDuty"
                      checked={form.isOnDuty}
                      onChange={(e) => update("isOnDuty", e.target.checked)}
                      className="w-4 h-4 accent-[#0EA96E] rounded"
                    />
                    <label
                      htmlFor="onDuty"
                      className="text-xs sm:text-sm text-foreground font-bold cursor-pointer"
                    >
                      صيدلية مناوبة (Garde - مناوبة ليلية أو عطل نهاية الأسبوع)
                    </label>
                  </div>

                  <div className="bg-muted/40 border border-border rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-[#1A6EBD]" />
                      <p className="text-foreground text-xs sm:text-sm font-bold">
                        الإحداثيات الجغرافية للخريطة (اختياري)
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>خط العرض (Latitude)</label>
                        <input
                          value={form.latitude}
                          onChange={(e) => update("latitude", e.target.value)}
                          placeholder="36.7538"
                          className={inputClass}
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>خط الطول (Longitude)</label>
                        <input
                          value={form.longitude}
                          onChange={(e) => update("longitude", e.target.value)}
                          placeholder="3.0588"
                          className={inputClass}
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4 — Subscription Plan Selection */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-border mb-3">
                    <CreditCard className="w-5 h-5 text-[#0EA96E]" />
                    <h2 className="text-lg sm:text-xl font-black text-foreground">
                      4. اختيار باقة الاشتراك في تطبيق ويب دوائي
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    اختر الباقة المناسبة لصيدليتك (يتم تفعيل الاشتراك والدفع بعد موافقة الإدارة على الطلب):
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Monthly Plan */}
                    <div
                      onClick={() => update("plan", "monthly")}
                      className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all ${
                        form.plan === "monthly"
                          ? "border-[#0EA96E] bg-[#0EA96E]/10 shadow-lg shadow-[#0EA96E]/10"
                          : "border-border bg-card hover:border-[#0EA96E]/40"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-foreground">الباقة الشهرية</span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            form.plan === "monthly"
                              ? "border-[#0EA96E] bg-[#0EA96E] text-white"
                              : "border-muted-foreground"
                          }`}
                        >
                          {form.plan === "monthly" && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-2xl font-black text-foreground mb-1">
                        2,000 <span className="text-xs font-bold text-muted-foreground">دج / شهر</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mb-4">
                        مرونة تامة مع تجديد شهري تلقائي
                      </p>

                      <ul className="space-y-2 text-xs text-foreground/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0EA96E] shrink-0" />
                          إدارة مخزون الأدوية وتحديثه
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0EA96E] shrink-0" />
                          الظهور في نتائج البحث المباشر
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0EA96E] shrink-0" />
                          الظهور على الخريطة التفاعلية
                        </li>
                      </ul>
                    </div>

                    {/* Yearly Plan */}
                    <div
                      onClick={() => update("plan", "yearly")}
                      className={`relative rounded-2xl p-5 border-2 cursor-pointer transition-all ${
                        form.plan === "yearly"
                          ? "border-[#0EA96E] bg-[#0EA96E]/10 shadow-lg shadow-[#0EA96E]/10"
                          : "border-border bg-card hover:border-[#0EA96E]/40"
                      }`}
                    >
                      <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black shadow-xs">
                        توفير 20%
                      </span>

                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-sm text-foreground">الباقة السنوية</span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            form.plan === "yearly"
                              ? "border-[#0EA96E] bg-[#0EA96E] text-white"
                              : "border-muted-foreground"
                          }`}
                        >
                          {form.plan === "yearly" && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-2xl font-black text-foreground mb-1">
                        19,200 <span className="text-xs font-bold text-muted-foreground">دج / سنة</span>
                      </div>
                      <p className="text-[11px] text-[#0EA96E] font-bold mb-4">
                        (يعادل 1,600 دج / شهر فقط)
                      </p>

                      <ul className="space-y-2 text-xs text-foreground/80">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0EA96E] shrink-0" />
                          جميع ميزات الباقة الشهرية
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0EA96E] shrink-0" />
                          شارة صيدلية موثّقة ومميزة 🛡️
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#0EA96E] shrink-0" />
                          أولوية الظهور في محرك البحث
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>
                      طرق الدفع المدعومة بعد التفعيل: BaridiMob، بطاقة CIB / الذهبية، أو التحويل البنكي.
                    </span>
                  </div>
                </div>
              )}

              {/* Step 5 — Review & Submit */}
              {step === 5 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-border mb-4">
                    <CheckCircle2 className="w-5 h-5 text-[#0EA96E]" />
                    <h2 className="text-lg sm:text-xl font-black text-foreground">
                      5. مراجعة المعلومات وإرسال الطلب
                    </h2>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { label: "الصيدلي المسؤول", value: `${form.firstName} ${form.lastName}` },
                      { label: "البريد الإلكتروني", value: form.email, dir: "ltr" },
                      { label: "رقم الهاتف", value: form.phone, dir: "ltr" },
                      { label: "اسم الصيدلية", value: form.pharmacyName },
                      { label: "رقم الترخيص", value: form.registrationNumber, dir: "ltr" },
                      {
                        label: "الموقع",
                        value: `${form.address}، ${form.city} (${form.wilaya.replace(/^\d+\s*-\s*/, "")})`,
                      },
                      {
                        label: "أوقات العمل",
                        value: `${form.openTime} — ${form.closeTime} | ${form.openDays} ${
                          form.isOnDuty ? "(صيدلية مناوبة)" : ""
                        }`,
                      },
                      {
                        label: "باقة الاشتراك",
                        value:
                          form.plan === "yearly"
                            ? "الاشتراك السنوي (19,200 دج / سنة)"
                            : "الاشتراك الشهري (2,000 دج / شهر)",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex gap-3 items-start p-3 rounded-xl bg-muted/40 border border-border/50"
                      >
                        <span className="text-muted-foreground text-xs font-bold w-28 shrink-0 mt-0.5">
                          {item.label}:
                        </span>
                        <span
                          className="text-foreground text-xs sm:text-sm font-bold"
                          dir={(item as any).dir || "rtl"}
                        >
                          {item.value || "—"}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-[#0EA96E]/10 border border-[#0EA96E]/30">
                    <input
                      type="checkbox"
                      id="agree"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 accent-[#0EA96E] mt-0.5 shrink-0 rounded"
                      required
                    />
                    <label
                      htmlFor="agree"
                      className="text-xs sm:text-sm text-foreground cursor-pointer leading-6 font-medium"
                    >
                      أقر بصحة جميع البيانات المدخلة وأوافق على{" "}
                      <Link
                        href="/terms"
                        className="text-[#0EA96E] font-bold hover:underline"
                        target="_blank"
                      >
                        الشروط والأحكام
                      </Link>{" "}
                      و{" "}
                      <Link
                        href="/privacy"
                        className="text-[#0EA96E] font-bold hover:underline"
                        target="_blank"
                      >
                        سياسة الخصوصية
                      </Link>{" "}
                      الخاصة بتطبيق ويب دوائي.
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between gap-3 mt-8 pt-4 border-t border-border">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={back}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl border border-border text-foreground font-bold text-xs sm:text-sm hover:bg-muted transition-all disabled:opacity-50"
                  >
                    <ChevronRight className="w-4 h-4" />
                    السابق
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={loading || (step === 5 && !agreed)}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-[#0EA96E]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جارٍ إرسال طلب التسجيل...
                    </>
                  ) : step === 5 ? (
                    <>
                      تسجيل الصيدلية وإرسال الطلب
                      <CheckCircle2 className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      التالي
                      <ChevronLeft className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
