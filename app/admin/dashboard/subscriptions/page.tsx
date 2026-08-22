"use client";

import { useState, useEffect, useCallback } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/shared/Pagination";
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Loader2,
} from "lucide-react";
import type { PaginationMeta } from "@/lib/api-utils";

interface SubscriptionItem {
  id: string;
  pharmacyName: string;
  wilaya: string;
  plan: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired";
  amount: number;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>([]);
  const [stats, setStats] = useState({
    activeSubscriptions: 0,
    expiredSubscriptions: 0,
  });
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = useCallback(async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (status !== "all") params.append("status", status);

      const [res, statsRes] = await Promise.all([
        fetch(`/api/admin/subscriptions?${params.toString()}`),
        fetch("/api/admin/stats"),
      ]);

      const json = await res.json();
      const statsJson = await statsRes.json();

      if (json.success) {
        setSubscriptions(json.data);
        if (json.meta) setMeta(json.meta);
      }
      if (statsJson.success) {
        setStats({
          activeSubscriptions: statsJson.data.activeSubscriptions || 0,
          expiredSubscriptions: statsJson.data.expiredSubscriptions || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch subscriptions", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchSubscriptions(1, statusFilter);
  }, [statusFilter, fetchSubscriptions]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة اشتراكات الصيدليات"
        description="متابعة وتجديد اشتراكات الصيدليات الشريكة ومراقبة التواريخ والحالات"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="الاشتراكات النشطة"
          value={stats.activeSubscriptions.toLocaleString("ar-DZ")}
          subtitle="صيدلية مسدّدة للاشتراك"
          icon={CheckCircle2}
          color="green"
        />
        <StatCard
          title="الاشتراكات المنتهية"
          value={stats.expiredSubscriptions.toLocaleString("ar-DZ")}
          subtitle="تتطلب التجديد"
          icon={Clock}
          color="rose"
        />
        <StatCard
          title="سعر الاشتراك الشهري"
          value="2,000 دج"
          subtitle="لكل صيدلية مفعّلة"
          icon={CreditCard}
          color="blue"
        />
      </div>

      {/* Filter & Search */}
      <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {["all", "active", "expired"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? "bg-[#1A6EBD] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {st === "all" ? "الكل" : st === "active" ? "نشطة" : "منتهية"}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
              <tr>
                <th className="p-4">الصيدلية</th>
                <th className="p-4">الولاية</th>
                <th className="p-4">نوع الخطة</th>
                <th className="p-4">تاريخ البداية</th>
                <th className="p-4">تاريخ الانتهاء</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">حالة الاشتراك</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1A6EBD] mb-2" />
                    جارٍ تحميل سجل الاشتراكات...
                  </td>
                </tr>
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    لا توجد اشتراكات تطابق الفلتر.
                  </td>
                </tr>
              ) : (
                subscriptions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-bold text-foreground">{sub.pharmacyName}</td>
                    <td className="p-4 text-muted-foreground">{sub.wilaya}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 font-bold text-[11px]">
                        {sub.plan === "yearly" ? "سنوي (12 شهر)" : "شهري"}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{sub.startDate}</td>
                    <td className="p-4 font-semibold text-foreground">{sub.endDate}</td>
                    <td className="p-4 font-bold text-foreground">
                      {sub.amount.toLocaleString("ar-DZ")} دج
                    </td>
                    <td className="p-4">
                      <StatusBadge status={sub.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && meta.total > 0 && (
          <div className="p-4 bg-card">
            <Pagination
              meta={meta}
              onPageChange={(p) => fetchSubscriptions(p)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
