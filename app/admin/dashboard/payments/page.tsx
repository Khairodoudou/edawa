"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import Pagination from "@/components/shared/Pagination";
import {
  Receipt,
  Search,
  Filter,
  Clock,
  Download,
  Printer,
  X,
  CheckCircle2,
  Building2,
  Loader2,
  ShieldCheck,
  FileText,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from "lucide-react";
import type { PaginationMeta } from "@/lib/api-utils";

interface PaymentItem {
  id: string;
  rawId: string;
  pharmacyId: string;
  pharmacyName: string;
  ownerName: string;
  wilaya: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  registrationNumber: string;
  plan: string;
  period: string;
  amount: number;
  date: string;
  paidAt?: string;
  method: string;
  status: "paid" | "pending" | "failed";
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentItem | null>(null);
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingPaymentsCount: 0,
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

  const invoicePrintRef = useRef<HTMLDivElement>(null);

  const fetchPayments = useCallback(async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (status !== "all") params.append("status", status);

      const [res, statsRes] = await Promise.all([
        fetch(`/api/admin/payments?${params.toString()}`),
        fetch("/api/admin/stats"),
      ]);

      const json = await res.json();
      const statsJson = await statsRes.json();

      if (json.success) {
        setPayments(json.data);
        if (json.meta) setMeta(json.meta);
      }
      if (statsJson.success) {
        setStats({
          totalRevenue: statsJson.data.totalRevenue || 0,
          monthlyRevenue: statsJson.data.monthlyRevenue || 0,
          pendingPaymentsCount: statsJson.data.pendingPaymentsCount || 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch payments", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments(1, statusFilter);
  }, [statusFilter, fetchPayments]);

  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const filteredPayments = payments.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.pharmacyName.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.wilaya.toLowerCase().includes(q) ||
      p.city.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.registrationNumber.toLowerCase().includes(q)
    );
  });

  const handleDownloadInvoiceHTML = (payment: PaymentItem) => {
    const invoiceNumber = `INV-2026-${payment.id.replace("TX-", "")}`;
    const planText =
      payment.plan === "yearly" ? "اشتراك سنوي (12 شهر)" : "اشتراك شهري";

    const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>فاتورة ${invoiceNumber} — ${payment.pharmacyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Tajawal', sans-serif; background: #f8fafc; color: #0f172a; padding: 30px; }
    .invoice-box { max-width: 800px; margin: auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0ea96e; padding-bottom: 24px; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 900; color: #0ea96e; }
    .logo span { color: #1a6ebd; font-size: 14px; }
    .invoice-title { text-align: left; }
    .invoice-title h1 { font-size: 22px; font-weight: 900; color: #0f172a; }
    .invoice-title p { font-size: 12px; color: #64748b; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; }
    .badge-paid { background: #dcfce7; color: #15803d; }
    .badge-pending { background: #fef3c7; color: #b45309; }
    .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 30px; }
    .party-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 12px; }
    .party-card h3 { font-size: 13px; font-weight: 800; margin-bottom: 8px; color: #1a6ebd; }
    .party-card p { margin-bottom: 4px; color: #334155; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
    th { background: #f1f5f9; padding: 12px; text-align: right; font-weight: 700; color: #475569; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; color: #1e293b; }
    .totals { margin-right: auto; max-width: 320px; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
    .totals .grand-total { font-size: 16px; font-weight: 900; color: #0ea96e; border-top: 2px solid #0ea96e; padding-top: 10px; margin-top: 6px; }
    .stamp-box { margin-top: 40px; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; }
    .stamp { border: 2px solid #0ea96e; color: #0ea96e; border-radius: 50%; width: 110px; height: 110px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; transform: rotate(-8deg); }
    .footer-note { font-size: 10px; color: #94a3b8; text-align: center; margin-top: 30px; }
    @media print {
      body { padding: 0; background: #fff; }
      .invoice-box { border: none; box-shadow: none; padding: 20px; }
    }
  </style>
</head>
<body>
  <div class="invoice-box">
    <div class="header">
      <div>
        <div class="logo">دوائي <span>EDAWA PLATFORM</span></div>
        <p style="font-size: 11px; color: #64748b; margin-top: 4px;">تطبيق الويب الوطني المعتمد للربط والخدمات الصيدلانية</p>
        <p style="font-size: 10px; color: #94a3b8;">الجمهورية الجزائرية الديمقراطية الشعبية</p>
      </div>
      <div class="invoice-title">
        <h1>فاتورة اشتراك صيدلية</h1>
        <p>رقم الفاتورة: <strong>${invoiceNumber}</strong></p>
        <p>تاريخ الإصدار: <strong>${payment.date}</strong></p>
        <div style="margin-top: 8px;">
          <span class="badge ${payment.status === "paid" ? "badge-paid" : "badge-pending"}">
            ${payment.status === "paid" ? "تم السداد بالكامل ✔ (PAYÉ)" : "قيد المعالجة 🟡 (EN ATTENTE)"}
          </span>
        </div>
      </div>
    </div>

    <div class="parties">
      <div class="party-card">
        <h3>الجهة المصدِرة</h3>
        <p><strong>تطبيق ويب دوائي الوطني للتقنية الصحية</strong></p>
        <p>الجزائر العاصمة — الجمهورية الجزائرية</p>
        <p>البريد الإلكتروني: billing@edawa.dz</p>
        <p>الهاتف: 023 50 50 50</p>
      </div>
      <div class="party-card">
        <h3>بيانات الصيدلية المستفيدة</h3>
        <p><strong>${payment.pharmacyName}</strong></p>
        <p>الصيدلي المسؤول: <strong>د. ${payment.ownerName}</strong></p>
        <p>رقم الاعتماد المهني: <strong>${payment.registrationNumber}</strong></p>
        <p>العنوان: ${payment.address}، ${payment.city} (${payment.wilaya})</p>
        <p>الهاتف: ${payment.phone || "—"}</p>
        <p>البريد: ${payment.email || "—"}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>بيان الخدمة / Désignation</th>
          <th>نوع الباقة</th>
          <th>طريقة الدفع</th>
          <th style="text-align: left;">المبلغ (دج)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${payment.period}</strong><br>
            <span style="font-size: 10px; color: #64748b;">تفعيل الحساب، إدارة المخزون الوطني، الظهور في محرك البحث والخريطة التفاعلية</span>
          </td>
          <td>${planText}</td>
          <td>${payment.method}</td>
          <td style="text-align: left; font-weight: bold;">${payment.amount.toLocaleString("ar-DZ")} دج</td>
        </tr>
      </tbody>
    </table>

    <div class="totals">
      <div><span>المبلغ الصافي قبل الرسوم (HT):</span> <span>${payment.amount.toLocaleString("ar-DZ")} دج</span></div>
      <div><span>الرسم على القيمة المضافة (TVA 0%):</span> <span>0 دج</span></div>
      <div class="grand-total"><span>المجموع الكلي المسدد (TTC):</span> <span>${payment.amount.toLocaleString("ar-DZ")} دج</span></div>
    </div>

    <div class="stamp-box">
      <div style="font-size: 11px; color: #64748b;">
        <p>الرقم المرجعي للدفع: <strong>${payment.id}</strong></p>
        <p>تاريخ السداد: <strong>${payment.paidAt || payment.date}</strong></p>
      </div>
      <div class="stamp">
        <div>تطبيق ويب دوائي</div>
        <div style="font-size: 11px;">★ معتمد ★</div>
        <div>PAYÉ & CONFIRMÉ</div>
      </div>
    </div>

    <div class="footer-note">
      تعتبر هذه الوثيقة فاتورة رسمية صادرة إلكترونياً ومسجلة في النظام المركزي لتطبيق ويب دوائي.
    </div>
  </div>
  <script>
    window.onload = function() { window.print(); }
  </script>
</body>
</html>
`;
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (win) {
      win.focus();
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="المدفوعات والسجل المالي"
        description="متابعة التدفقات المالية، مستحقات اشتراكات الصيدليات والمعاملات المكتملة"
      />

      {/* Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-[#0f2d20] to-[#0f1f35] rounded-2xl p-6 text-white shadow-lg space-y-2">
          <span className="text-xs text-white/60 block">إجمالي الإيرادات المحصّلة</span>
          <div className="text-3xl font-black text-[#0EA96E]">
            {stats.totalRevenue.toLocaleString("ar-DZ")} دج
          </div>
          <p className="text-[11px] text-white/50">تراكمي منذ انطلاق تطبيق الويب</p>
        </div>

        <StatCard
          title="المداخيل الشهرية الحالية"
          value={`${stats.monthlyRevenue.toLocaleString("ar-DZ")} دج`}
          subtitle="اشتراكات الشهر الحالي"
          icon={Receipt}
          color="green"
        />

        <StatCard
          title="معاملات قيد التدقيق"
          value={stats.pendingPaymentsCount !== undefined ? stats.pendingPaymentsCount : pendingCount}
          subtitle="تنتظر التحقق البنكي"
          icon={Clock}
          color="amber"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالصيدلية، الصيدلي، الولاية أو رقم المعاملة..."
            className="w-full pr-10 pl-4 py-2 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#1A6EBD]"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
          {["all", "paid", "pending", "failed"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
                statusFilter === st
                  ? "bg-[#1A6EBD] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {st === "all"
                ? "الكل"
                : st === "paid"
                ? "مدفوع"
                : st === "pending"
                ? "معلق"
                : "فشل"}
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
                <th className="p-4">رقم المعاملة</th>
                <th className="p-4">اسم الصيدلية</th>
                <th className="p-4">الولاية / المدينة</th>
                <th className="p-4">نوع الخطة</th>
                <th className="p-4">المبلغ</th>
                <th className="p-4">طريقة الدفع</th>
                <th className="p-4">التاريخ</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 text-center">الفاتورة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={9} className="p-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#1A6EBD] mb-2" />
                    جارٍ تحميل سجل المدفوعات...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-muted-foreground">
                    لا توجد مدفوعات تطابق الفلتر أو البحث.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-foreground">{p.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-foreground">{p.pharmacyName}</div>
                      <div className="text-[11px] text-muted-foreground font-normal">
                        د. {p.ownerName} • {p.registrationNumber}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{p.wilaya}</div>
                      <div className="text-[10px] text-muted-foreground">{p.city}</div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.plan === "yearly"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {p.plan === "yearly" ? "سنوي (12 شهر)" : "شهري"}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-[#0EA96E]">
                      {p.amount.toLocaleString("ar-DZ")} دج
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground font-mono text-[11px]">
                        {p.method}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{p.date}</td>
                    <td className="p-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0EA96E]/10 hover:bg-[#0EA96E]/20 text-[#0EA96E] font-bold text-xs transition-all shadow-xs"
                        title="معاينة وتحميل الفاتورة"
                      >
                        <Download className="w-3.5 h-3.5" />
                        تحميل
                      </button>
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
              onPageChange={(p) => fetchPayments(p)}
            />
          </div>
        )}
      </div>

      {/* Official Invoice Preview Modal with Smooth Scrollable Content */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            {/* Modal Header (Fixed / Sticky) */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0 bg-card z-10">
              <div className="flex items-center gap-2 text-foreground font-black text-sm sm:text-base">
                <FileText className="w-5 h-5 text-[#0EA96E]" />
                <span>معاينة الفاتورة الرسمية — {selectedInvoice.pharmacyName}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadInvoiceHTML(selectedInvoice)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold text-xs shadow-md transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  طباعة / حفظ PDF
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Invoice Sheet Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              <div
                ref={invoicePrintRef}
                className="bg-background border border-border rounded-2xl p-5 sm:p-7 space-y-6 text-foreground text-xs shadow-inner"
              >
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#0EA96E]/30">
                  <div className="space-y-1">
                    <div className="text-xl font-black text-[#0EA96E]">
                      دوائي <span className="text-xs text-[#1A6EBD]">EDAWA PLATFORM</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      تطبيق الويب الوطني المعتمد للربط والخدمات الصيدلانية
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      الجمهورية الجزائرية الديمقراطية الشعبية
                    </p>
                  </div>

                  <div className="text-right sm:text-left space-y-1">
                    <span className="px-3 py-1 rounded-full bg-[#0EA96E]/15 text-[#0EA96E] font-black text-[11px]">
                      فاتورة اشتراك رسمية
                    </span>
                    <div className="font-mono font-black text-sm text-foreground pt-1">
                      INV-2026-{selectedInvoice.id.replace("TX-", "")}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      تاريخ الإصدار: {selectedInvoice.date}
                    </div>
                  </div>
                </div>

                {/* Parties Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold text-[#1A6EBD] block">
                      الجهة المصدِرة:
                    </span>
                    <strong className="block text-foreground text-xs">
                      تطبيق ويب دوائي الوطني للتقنية الصحية
                    </strong>
                    <p className="text-muted-foreground text-[11px]">الجزائر العاصمة — الجمهورية الجزائرية</p>
                    <p className="text-muted-foreground text-[11px]">billing@edawa.dz</p>
                    <p className="text-muted-foreground text-[11px]">023 50 50 50</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold text-[#0EA96E] block">
                      الصيدلية المستفيدة:
                    </span>
                    <strong className="block text-foreground text-xs text-[#0EA96E]">
                      {selectedInvoice.pharmacyName}
                    </strong>
                    <p className="text-muted-foreground text-[11px]">
                      الصيدلي المسؤول: <strong>د. {selectedInvoice.ownerName}</strong>
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      رقم الاعتماد: <strong dir="ltr">{selectedInvoice.registrationNumber}</strong>
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      العنوان: {selectedInvoice.address}، {selectedInvoice.city} ({selectedInvoice.wilaya})
                    </p>
                    {selectedInvoice.phone && (
                      <p className="text-muted-foreground text-[11px]" dir="ltr">
                        الهاتف: {selectedInvoice.phone}
                      </p>
                    )}
                    {selectedInvoice.email && (
                      <p className="text-muted-foreground text-[11px]" dir="ltr">
                        البريد: {selectedInvoice.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Items Table */}
                <div className="border border-border rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-muted text-muted-foreground font-bold">
                      <tr>
                        <th className="p-3">بيان الخدمة / Désignation</th>
                        <th className="p-3">نوع الخطة</th>
                        <th className="p-3">طريقة الدفع</th>
                        <th className="p-3 text-left">المبلغ (دج)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      <tr>
                        <td className="p-3">
                          <div className="font-bold text-foreground">
                            {selectedInvoice.period}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            تفعيل الحساب، إدارة المخزون، الظهور في محرك البحث والخريطة التفاعلية
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {selectedInvoice.plan === "yearly" ? "سنوي (12 شهر)" : "شهري"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {selectedInvoice.method} ({selectedInvoice.id})
                        </td>
                        <td className="p-3 text-left font-bold text-foreground">
                          {selectedInvoice.amount.toLocaleString("ar-DZ")} دج
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Totals & Status */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedInvoice.status} />
                    <span className="text-[11px] text-muted-foreground font-semibold">
                      {selectedInvoice.status === "paid"
                        ? "تم تسديد المستحقات بالكامل ✔"
                        : "بانتظار التحقق من عملية الدفع 🟡"}
                    </span>
                  </div>

                  <div className="w-full sm:w-64 space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>المبلغ الصافي (HT):</span>
                      <span>{selectedInvoice.amount.toLocaleString("ar-DZ")} دج</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>الرسم على القيمة المضافة (TVA 0%):</span>
                      <span>0 دج</span>
                    </div>
                    <div className="flex justify-between text-sm font-black text-[#0EA96E] pt-2 border-t-2 border-[#0EA96E]">
                      <span>المجموع الإجمالي (TTC):</span>
                      <span>{selectedInvoice.amount.toLocaleString("ar-DZ")} دج</span>
                    </div>
                  </div>
                </div>

                {/* Official Stamp & Reference */}
                <div className="flex items-center justify-between pt-4 border-t border-dashed border-border">
                  <div className="text-[10px] text-muted-foreground space-y-0.5">
                    <p>الرقم المرجعي للعملية: {selectedInvoice.id}</p>
                    <p>تاريخ المعالجة: {selectedInvoice.paidAt || selectedInvoice.date}</p>
                    <p>تعتبر هذه الوثيقة فاتورة رسمية صادرة إلكترونياً ومسجلة في النظام المركزي.</p>
                  </div>
                  <div className="border-2 border-[#0EA96E] text-[#0EA96E] rounded-full w-20 h-20 flex flex-col items-center justify-center text-[9px] font-black rotate-[-12deg] shadow-xs">
                    <span>تطبيق ويب دوائي</span>
                    <span className="text-[10px]">★ معتمد ★</span>
                    <span>PAYÉ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Fixed / Sticky) */}
            <div className="p-4 sm:p-5 border-t border-border flex items-center justify-end gap-3 shrink-0 bg-card z-10">
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80 transition-colors"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => handleDownloadInvoiceHTML(selectedInvoice)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold text-xs shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                تحميل وطباعة الفاتورة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
