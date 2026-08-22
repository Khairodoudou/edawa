"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2,
  Star,
  BarChart3,
  Map,
  ArrowLeftRight,
  Package,
  Building2,
  CreditCard,
  Shield,
  ChevronLeft,
} from "lucide-react";

const features = [
  { icon: Package, label: "إدارة مخزون الأدوية" },
  { icon: BarChart3, label: "إحصائيات البحث" },
  { icon: Map, label: "الظهور على الخريطة" },
  { icon: Star, label: "الظهور في نتائج البحث" },
  { icon: Shield, label: "شارة صيدلية موثّقة" },
  { icon: ArrowLeftRight, label: "تبادل الأدوية (قريباً)" },
];

export default function PharmacistSubscriptionPage() {
  const [selected, setSelected] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-[#E8FBF4]/60 via-background to-background pt-28 pb-20 flex flex-col justify-center items-center px-4 relative">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0EA96E]/15 border border-[#0EA96E]/30 text-[#0EA96E] text-sm font-bold mb-4">
              <CheckCircle2 className="w-4 h-4" />
              تهانينا! تمت الموافقة على طلب صيدليتك
            </div>
            <h1 className="text-3xl font-black text-foreground mb-2">اختر باقتك وانطلق</h1>
            <p className="text-muted-foreground text-sm">اشترك الآن لتفعيل حسابك وإتاحة صيدليتك للمواطنين</p>
          </div>

          {/* Toggle */}
          <div className="flex items-center justify-center mb-8">
            <div className="bg-card rounded-2xl p-1.5 flex gap-1 border border-border shadow-sm">
              <button
                onClick={() => setSelected("monthly")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                  selected === "monthly"
                    ? "bg-[#0EA96E] text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                شهري
              </button>
              <button
                onClick={() => setSelected("yearly")}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all relative ${
                  selected === "yearly"
                    ? "bg-[#0EA96E] text-white shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                سنوي
                <span className="absolute -top-2 -left-2 px-2 py-0.5 rounded-full bg-amber-400 text-black text-[10px] font-black">
                  وفّر 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-card rounded-3xl p-8 shadow-xl border border-border mb-6 relative overflow-hidden">
            {/* Badge */}
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-[#0EA96E] text-white text-xs font-black">
                الباقة المتكاملة
              </span>
            </div>

            <div className="text-center mb-8 mt-2">
              <div className="text-5xl font-black text-foreground mb-1">
                {selected === "monthly" ? (
                  <>
                    2,000
                    <span className="text-2xl font-bold text-muted-foreground"> دج</span>
                  </>
                ) : (
                  <>
                    19,200
                    <span className="text-2xl font-bold text-muted-foreground"> دج</span>
                  </>
                )}
              </div>
              <p className="text-muted-foreground text-sm">
                {selected === "monthly"
                  ? "شهرياً لكل صيدلية"
                  : "سنوياً — يعادل 1,600 دج/شهر فقط"}
              </p>
              {selected === "yearly" && (
                <p className="text-[#0EA96E] text-xs font-bold mt-1">
                  توفير 4,800 دج سنوياً مقارنةً بالباقة الشهرية
                </p>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0EA96E]/15 flex items-center justify-center shrink-0">
                    <f.icon className="w-3.5 h-3.5 text-[#0EA96E]" />
                  </div>
                  <span className="text-foreground text-sm font-semibold">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <p className="text-foreground text-sm font-bold mb-3">طريقة الدفع الفوري</p>
              <div className="grid grid-cols-3 gap-2">
                {["BaridiMob", "CIB / Edahabia", "تحويل بنكي"].map((method) => (
                  <button
                    key={method}
                    className="py-3 px-3 rounded-xl border-2 border-border hover:border-[#0EA96E] bg-background hover:bg-[#0EA96E]/10 text-foreground text-xs font-bold transition-all text-center"
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-black text-base hover:shadow-2xl hover:shadow-[#0EA96E]/30 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:transform-none"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  جارٍ تأكيد الدفع...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {selected === "monthly" ? "ادفع 2,000 دج وفعّل حسابك" : "ادفع 19,200 دج وفعّل حسابك"}
                </>
              )}
            </button>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-xs mb-6">
            <Shield className="w-3.5 h-3.5 text-[#0EA96E]" />
            <span>الدفع آمن ومشفّر 100% — لا نحتفظ ببيانات بطاقتك البنكية</span>
          </div>

          <div className="text-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm font-semibold transition-colors"
            >
              لديك استفسار حول الدفع أو الفواتير؟
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
