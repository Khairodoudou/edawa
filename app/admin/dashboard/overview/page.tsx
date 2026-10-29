"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  Building2,
  CheckCircle2,
  Clock,
  Pill,
  Search,
  Receipt,
  CreditCard,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  UserCheck,
  Loader2,
} from "lucide-react";
import type { AdminPharmacy } from "@/lib/mock-data";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<any>({
    totalPharmacies: 0,
    activePharmacies: 0,
    pendingPharmacies: 0,
    totalMedicines: 0,
    monthlySearches: 0,
    activeSubscriptions: 0,
    monthlyRevenue: 0,
    totalRevenue: 0,
  });
  const [pharmacies, setPharmacies] = useState<AdminPharmacy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, phRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/pharmacies?limit=5"),
        ]);
        const statsJson = await statsRes.json();
        const phJson = await phRes.json();

        if (statsJson.success) setStats(statsJson.data);
        if (phJson.success) setPharmacies(phJson.data);
      } catch (err) {
        console.error("Failed to load admin overview", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingRequests = pharmacies.filter((p) => p.status === "pending");

  return (
    <div className="space-y-6">
      <PageHeader
        title="اللوحة العامة للإدارة"
        description="نظرة شاملة على جميع الصيدليات، الاشتراكات، الإيرادات والنشاط العام لتطبيق الويب"
        action={
          <Link
            href="/admin/dashboard/pharmacies/pending"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-xl text-xs shadow-md transition-all"
          >
            <Clock className="w-4 h-4" />
            طلبات التسجيل المتبقية ({stats.pendingPharmacies || pendingRequests.length})
          </Link>
        }
      />

      {/* Global Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي الصيدليات"
          value={(stats.totalPharmacies || 0).toLocaleString("ar-DZ")}
          subtitle={`${stats.activePharmacies || 0} صيدلية نشطة`}
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="طلبات التسجيل قيد الانتظار"
          value={stats.pendingPharmacies || 0}
          subtitle="تتطلب المراجعة والقبول"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="إجمالي الأدوية بالكتالوج"
          value={(stats.totalMedicines || 0).toLocaleString("ar-DZ")}
          subtitle="دواء مسجل بالنظام"
          icon={Pill}
          color="green"
        />
        <StatCard
          title="عمليات البحث هذا الشهر"
          value={(stats.monthlySearches || 0).toLocaleString("ar-DZ")}
          subtitle="بحث من المواطنين"
          icon={Search}
          color="purple"
        />
      </div>

      {/* Secondary Stats: Revenue & Subscriptions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0f2d20] to-[#0f1f35] rounded-2xl p-5 text-white shadow-md flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-white/60 block">إجمالي المداخيل المحصّلة</span>
            <div className="text-2xl font-black text-[#0EA96E]">
              {(stats.totalRevenue || 0).toLocaleString("ar-DZ")} دج
            </div>
            <span className="text-[10px] text-white/50 block">من الاشتراكات السنوية والشهرية</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold">
            <Receipt className="w-6 h-6 text-[#0EA96E]" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground block">مداخيل الشهر الحالي</span>
            <div className="text-2xl font-black text-foreground">
              {(stats.monthlyRevenue || 0).toLocaleString("ar-DZ")} دج
            </div>
            <span className="text-[10px] text-muted-foreground block">
              الاشتراكات المحصلة خلال هذا الشهر
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground block">اشتراكات مفعلة</span>
            <div className="text-2xl font-black text-foreground">
              {stats.activeSubscriptions || 0}
            </div>
            <span className="text-[10px] text-muted-foreground block">
              صيدليات باشتراك نشط حالياً
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Pharmacies & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Registered Pharmacies */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-foreground">أحدث الصيدليات المسجلة</h3>
              <p className="text-xs text-muted-foreground">آخر الصيدليات المنضمة إلى الشبكة الوطنية</p>
            </div>
            <Link
              href="/admin/dashboard/pharmacies"
              className="text-xs font-bold text-[#1A6EBD] hover:underline flex items-center gap-1"
            >
              عرض الكل
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            {pharmacies.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                لا توجد صيدليات مسجلة حالياً
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-3">الصيدلية</th>
                    <th className="p-3">الولاية</th>
                    <th className="p-3">تاريخ التسجيل</th>
                    <th className="p-3">حالة الحساب</th>
                    <th className="p-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pharmacies.slice(0, 4).map((ph) => (
                    <tr key={ph.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold text-foreground">{ph.name}</td>
                      <td className="p-3 text-muted-foreground">{ph.wilaya}</td>
                      <td className="p-3 text-muted-foreground">{ph.createdAt}</td>
                      <td className="p-3">
                        <StatusBadge status={ph.status} />
                      </td>
                      <td className="p-3 text-center">
                        <Link
                          href={`/admin/dashboard/pharmacies/${ph.id}`}
                          className="px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold transition-colors"
                        >
                          عرض
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Quick System Shortcuts */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-foreground">إجراءات سريعة</h3>
          <div className="space-y-2.5">
            <Link
              href="/admin/dashboard/medicines/add"
              className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1A6EBD]/10 text-[#1A6EBD] flex items-center justify-center font-bold">
                  <Pill className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block">إضافة دواء للكتالوج</span>
                  <span className="text-[10px] text-muted-foreground">تسجيل صنف دوائي جديد</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-2px] transition-transform" />
            </Link>

            <Link
              href="/admin/dashboard/pharmacies/pending"
              className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block">مراجعة طلبات الانضمام</span>
                  <span className="text-[10px] text-muted-foreground">فحص الاعتماد والرخص</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-2px] transition-transform" />
            </Link>

            <Link
              href="/admin/dashboard/subscriptions"
              className="flex items-center justify-between p-3 rounded-xl bg-muted/40 hover:bg-muted text-foreground transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-xs block">مراقبة الاشتراكات</span>
                  <span className="text-[10px] text-muted-foreground">تتبع الاشتراكات والمستحقات</span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-[-2px] transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
