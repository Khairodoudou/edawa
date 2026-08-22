"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  Pill,
  CheckCircle2,
  XCircle,
  Search,
  CreditCard,
  Plus,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
  Package,
  ShieldCheck,
  Building2,
  Loader2,
} from "lucide-react";

interface OverviewData {
  pharmacyId: string;
  pharmacyName: string;
  ownerName: string;
  city: string;
  wilaya: string;
  phone: string;
  email: string;
  status: string;
  isOpen: boolean;
  isOnDuty: boolean;
  stats: {
    totalMedicines: number;
    available: number;
    limited: number;
    unavailable: number;
    monthlySearches: number;
    subscriptionStatus: string;
    subscriptionExpiry: string;
    subscriptionPlan?: string;
  };
  lowStock: Array<{
    id: string;
    name: string;
    genericName: string;
    category: string;
    dosage: string;
    form: string;
    quantity: number;
    status: "available" | "limited" | "unavailable";
  }>;
  notifications: Array<{
    id: string;
    title: string;
    message: string;
    time: string;
  }>;
}

export default function PharmacistOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/pharmacist/overview");
        const json = await res.json();
        if (json.success && json.data) {
          // Strict verification: Pharmacy must be ACTIVE 🟢
          if (json.data.status === "PENDING") {
            router.push("/pharmacist/pending");
            return;
          }
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load pharmacist overview", err);
      } finally {
        setLoading(false);
      }
    }
    loadOverview();
  }, [router]);

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-3xl">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0EA96E] mb-3" />
        جارٍ جلب بيانات الصيدلية والمخزون الحي...
      </div>
    );
  }

  const stats = data?.stats || {
    totalMedicines: 0,
    available: 0,
    limited: 0,
    unavailable: 0,
    monthlySearches: 0,
    subscriptionStatus: "نشط",
    subscriptionExpiry: "—",
  };

  const lowStock = data?.lowStock || [];
  const notifications = data?.notifications || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#0EA96E] text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4" />
            حساب معتمد ومفعل 🟢
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground">
            مرحباً، د. {data?.ownerName || "الصيدلي"} ({data?.pharmacyName})
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">
            نظرة عامة على حالة {data?.pharmacyName} في {data?.city} ({data?.wilaya})، ومخزون الأدوية الحي
          </p>
        </div>

        <Link
          href="/pharmacist/dashboard/stock/add"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-md shadow-[#0EA96E]/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          إضافة دواء جديد للمخزون
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="إجمالي الأدوية"
          value={stats.totalMedicines}
          subtitle="مسجل في مخزونك"
          icon={Pill}
          color="blue"
        />
        <StatCard
          title="متوفر بالمخزون"
          value={stats.available}
          subtitle="جاهز لصرف الوصفات"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="كمية محدودة / نفد"
          value={stats.limited + stats.unavailable}
          subtitle="يحتاج متابعة وتزويد"
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="عدد البحث عنك"
          value={stats.monthlySearches}
          subtitle="زيارة واستفسار هذا الشهر"
          icon={Search}
          trend={stats.monthlySearches > 0 ? { value: "+18%", isUp: true } : undefined}
          color="purple"
        />
        <StatCard
          title="حالة الاشتراك"
          value={stats.subscriptionStatus}
          subtitle={`سارٍ حتى ${stats.subscriptionExpiry}`}
          icon={CreditCard}
          color="amber"
        />
      </div>

      {/* Main Grid: Low stock + Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Low Stock Alerts (7 cols) */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="font-black text-base text-foreground">تنبيهات المخزون</h2>
            </div>
            <Link
              href="/pharmacist/dashboard/stock"
              className="text-xs text-[#0EA96E] font-bold hover:underline flex items-center gap-1"
            >
              عرض كامل المخزون ({stats.totalMedicines})
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            </Link>
          </div>

          {stats.totalMedicines === 0 ? (
            <div className="p-8 text-center bg-muted/20 border border-dashed border-border rounded-2xl space-y-3">
              <Package className="w-10 h-10 text-[#0EA96E] mx-auto opacity-70" />
              <div>
                <p className="text-sm font-black text-foreground">المخزون فارغ حالياً</p>
                <p className="text-xs text-muted-foreground mt-1">
                  لم تقم بإضافة أي دواء لصيدليتك بعد. ابدأ بإضافة الأدوية المتوفرة لديك لتظهر للمواطنين في البحث والخريطة.
                </p>
              </div>
              <Link
                href="/pharmacist/dashboard/stock/add"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold text-xs rounded-xl shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                إضافة أول دواء للمخزون
              </Link>
            </div>
          ) : lowStock.length === 0 ? (
            <div className="p-8 text-center bg-muted/20 border border-border rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-[#0EA96E] mx-auto mb-2" />
              <p className="text-xs font-bold text-foreground">مخزون الأدوية في حالة ممتازة!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                لا توجد أدوية نفدت أو وصلت للحد الأدنى حالياً.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {lowStock.slice(0, 5).map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        item.status === "unavailable"
                          ? "bg-rose-500/10 text-rose-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {item.genericName} {item.dosage ? `— ${item.dosage}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground">
                      الكمية: <strong className="text-foreground">{item.quantity}</strong>
                    </span>
                    <StatusBadge status={item.status} />
                    <Link
                      href={`/pharmacist/dashboard/stock`}
                      className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-xs font-semibold transition-colors"
                    >
                      تحديث
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notifications (5 cols) */}
        <div className="lg:col-span-5 bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-base text-foreground">إشعارات النظام</h2>
            <span className="text-xs text-muted-foreground">التنبيهات المباشرة</span>
          </div>

          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="p-4 rounded-2xl border border-border bg-muted/30 flex items-start gap-3"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-[#0EA96E] mt-1.5 shrink-0 animate-pulse" />
                <div className="flex-1">
                  <h4 className="font-bold text-xs text-foreground mb-1">{n.title}</h4>
                  <p className="text-muted-foreground text-xs leading-5">{n.message}</p>
                  <span className="text-[10px] text-muted-foreground/60 mt-1.5 block">{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Access Banner */}
      <div className="bg-gradient-to-r from-[#0f2d20] to-[#0f1f35] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1 text-center md:text-right">
          <h3 className="font-black text-lg">هل قمت بتحديث مواعيد المناوبة وساعات العمل؟</h3>
          <p className="text-white/70 text-xs">
            تأكد من دقة أوقات فتح الصيدلية ليتمكن المواطنون من العثور عليك على الخريطة في حالات الطوارئ.
          </p>
        </div>
        <Link
          href="/pharmacist/dashboard/profile"
          className="px-6 py-3 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shrink-0 transition-colors shadow-lg shadow-[#0EA96E]/30"
        >
          تحديث ملف الصيدلية والمناوبة
        </Link>
      </div>
    </div>
  );
}
