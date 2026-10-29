"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Eye, EyeOff, Lock, Mail, Building2, CheckCircle2, ShieldCheck, AlertCircle, Clock } from "lucide-react";

export default function PharmacistLoginPage() {
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingNotice, setPendingNotice] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPendingNotice(null);

    try {
      const res = await fetch("/api/pharmacist/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.error || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }

      // Save session in localStorage
      localStorage.setItem("edawa_user", JSON.stringify(json.data.user));
      localStorage.setItem("edawa_token", json.data.token);

      const { role, pharmacyStatus } = json.data.user;

      // Handle Role & Strict Active Pharmacy Status Rule
      if (role === "ADMIN") {
        router.push("/admin/dashboard/overview");
        return;
      }

      // Pharmacist must have ACTIVE status (🟢) to access dashboard
      if (pharmacyStatus === "PENDING") {
        setPendingNotice("طلب تسجيل صيدليتك قيد المراجعة والتدقيق 🟡. لا يمكنك الدخول إلى لوحة التحكم حتى يتم قبول وتفعيل الحساب من طرف الإدارة.");
        setTimeout(() => {
          router.push("/pharmacist/pending");
        }, 2000);
        return;
      }

      if (pharmacyStatus === "SUSPENDED" || pharmacyStatus === "REJECTED") {
        setError("حساب الصيدلية غير مفعّل أو معلّق. يرجى التواصل مع إدارة تطبيق الويب.");
        return;
      }

      // If ACTIVE 🟢, enter pharmacist dashboard
      router.push("/pharmacist/dashboard/overview");
    } catch {
      setError("حدث خطأ في الاتصال. يرجى المحاولة مجدداً.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-[#E8FBF4]/60 via-background to-background pt-28 pb-20 flex flex-col justify-center items-center px-4 relative">
        <div className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Form Side */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            {/* Header */}
            <div className="text-right mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0EA96E]/15 border border-[#0EA96E]/30 text-[#0EA96E] text-xs font-bold mb-4">
                <ShieldCheck className="w-4 h-4" />
                بوابة الصيدلانيين المعتمدة
              </div>
              <h1 className="text-3xl font-black text-foreground mb-2">مرحباً بك مجدداً</h1>
              <p className="text-muted-foreground text-sm leading-6">
                سجّل الدخول إلى حساب صيدليتك المعتمد لإدارة المخزون والخدمات
              </p>
            </div>

            {/* Pending Alert Notice */}
            {pendingNotice && (
              <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-start gap-3 animate-in fade-in">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-black text-sm mb-1">الحساب قيد المراجعة 🟡</span>
                  <span>{pendingNotice}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs sm:text-sm flex items-center gap-2.5 font-bold animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="text-sm font-bold text-foreground mb-1.5 block text-right">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#0EA96E]" />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="example@pharmacy.dz"
                    className="w-full pr-11 pl-4 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#0EA96E] focus:ring-2 focus:ring-[#0EA96E]/20 text-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-bold text-foreground">
                    كلمة المرور
                  </label>
                  <Link
                    href="#"
                    className="text-xs text-[#0EA96E] font-semibold hover:underline"
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#0EA96E]" />
                  <input
                    type={showPass ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pr-11 pl-11 py-3.5 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[#0EA96E] focus:ring-2 focus:ring-[#0EA96E]/20 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-bold rounded-xl hover:shadow-xl hover:shadow-[#0EA96E]/25 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 text-base shadow-md"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    جارٍ التحقق...
                  </>
                ) : (
                  "تسجيل الدخول إلى لوحة التحكم"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-muted-foreground text-xs font-semibold">ليس لديك حساب؟</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Register Link */}
            <Link
              href="/pharmacist/register"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-[#0EA96E]/30 text-[#0EA96E] hover:bg-[#0EA96E]/5 font-bold text-sm transition-all"
            >
              <Building2 className="w-4 h-4" />
              سجّل صيدليتك الآن
            </Link>
          </div>

          {/* Photo Banner Side */}
          <div className="hidden lg:block lg:col-span-5 relative min-h-[500px]">
            <Image
              src="/pharmacist-cta.png"
              alt="صيدلاني محترف — دوائي"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f2d20] via-[#0f2d20]/50 to-transparent flex flex-col justify-end p-8 text-white">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[#0EA96E]">
                  <CheckCircle2 className="w-5 h-5 fill-[#0EA96E] text-[#0f2d20]" />
                  <span className="font-bold text-sm text-white">تطبيق ويب دوائي للصحة الرقمية</span>
                </div>
                <p className="text-white/90 text-sm leading-6 font-semibold">
                  &ldquo;إدارة أسهل لمخزون الأدوية وتواصل مباشر مع آلاف المواطنين في منطقتك.&rdquo;
                </p>
                <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs text-white/70">
                  <span>صيدليات معتمدة 🟢</span>
                  <span>تغطية 58 ولاية</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
}
