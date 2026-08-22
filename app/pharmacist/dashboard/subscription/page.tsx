"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  CreditCard,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Download,
  Printer,
  X,
  FileText,
  Loader2,
  Clock,
  Zap,
  Sparkles,
} from "lucide-react";

interface PaymentItem {
  id: string;
  rawId: string;
  amount: number;
  period: string;
  method: string;
  status: "paid" | "pending" | "failed";
  date: string;
  paidAt?: string;
}

interface SubscriptionData {
  pharmacyId: string;
  pharmacyName: string;
  ownerName: string;
  wilaya: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  registrationNumber: string;
  subscription: {
    id: string;
    plan: "monthly" | "yearly";
    planName: string;
    planPriceText: string;
    amount: number;
    startDate: string;
    endDate: string;
    remainingDays: number;
    status: string;
    paymentMethod: string;
  } | null;
  payments: PaymentItem[];
}

export default function PharmacistSubscriptionPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentItem | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      try {
        const res = await fetch("/api/pharmacist/subscription", { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        }
      } catch (err) {
        console.error("Failed to load subscription details", err);
      } finally {
        setLoading(false);
      }
    }
    loadSubscription();
  }, []);

  const handleDownloadInvoiceHTML = (payment: PaymentItem) => {
    if (!data) return;
    const invoiceNumber = `INV-2026-${payment.id.replace("TX-", "")}`;
    const planText =
      data.subscription?.plan === "yearly" ? "اشتراك سنوي (12 شهر)" : "اشتراك شهري";

    const htmlContent = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>فاتورة ${invoiceNumber} — ${data.pharmacyName}</title>
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
        <p style="font-size: 11px; color: #64748b; margin-top: 4px;">المنصة الوطنية المعتمدة للربط والخدمات الصيدلانية</p>
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
        <p><strong>منصة دوائي الوطنية للتقنية الصحية</strong></p>
        <p>الجزائر العاصمة — الجمهورية الجزائرية</p>
        <p>البريد الإلكتروني: billing@edawa.dz</p>
        <p>الهاتف: 023 50 50 50</p>
      </div>
      <div class="party-card">
        <h3>بيانات الصيدلية المستفيدة</h3>
        <p><strong>${data.pharmacyName}</strong></p>
        <p>الصيدلي المسؤول: <strong>د. ${data.ownerName}</strong></p>
        <p>رقم الاعتماد المهني: <strong>${data.registrationNumber}</strong></p>
        <p>العنوان: ${data.address}، ${data.city} (${data.wilaya})</p>
        <p>الهاتف: ${data.phone || "—"}</p>
        <p>البريد: ${data.email || "—"}</p>
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
        <div>منصة دوائي</div>
        <div style="font-size: 11px;">★ معتمد ★</div>
        <div>PAYÉ & CONFIRMÉ</div>
      </div>
    </div>

    <div class="footer-note">
      تعتبر هذه الوثيقة فاتورة رسمية صادرة إلكترونياً ومسجلة في النظام المركزي لمنصة دوائي.
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

  const sub = data?.subscription;
  const isYearly = sub?.plan === "yearly";

  return (
    <div className="space-y-6">
      <PageHeader
        title="إدارة الاشتراك والمدفوعات"
        description="تفاصيل اشتراك صيدليتك، خطة الأسعار، وسجل الفواتير الرسمية"
      />

      {loading ? (
        <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-3xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0EA96E] mb-3" />
          جارٍ جلب تفاصيل الاشتراك الحية من قاعدة البيانات...
        </div>
      ) : (
        <>
          {/* Main Subscription Hero Card */}
          <div className="bg-gradient-to-br from-[#0f2d20] to-[#0f1f35] rounded-3xl p-6 sm:p-8 text-white shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Side Details */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0EA96E]/20 border border-[#0EA96E]/40 text-[#0EA96E] text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  {data?.pharmacyName || "صيدليتك"} — اشتراك معتمد
                </div>
                {sub?.remainingDays !== undefined && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                    <Clock className="w-3.5 h-3.5" />
                    متبقي {sub.remainingDays} يوماً
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-black">
                {sub?.planName || "باقة الصيدلية"}{" "}
                <span className="text-[#0EA96E] text-xl sm:text-2xl font-normal">
                  ({sub?.planPriceText || "2,000 دج / شهرياً"})
                </span>
              </h2>

              <p className="text-white/70 text-xs sm:text-sm leading-6">
                تمنحك هذه الباقة وصولاً كاملاً لإدارة مخزون الأدوية الحي، الظهور في نتائج البحث المتقدم والخريطة التفاعلية، وميزة تبادل الأدوية بين الصيدليات.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-white/50 block text-[10px] font-semibold">الحالة الحالية</span>
                  <span className="font-black text-emerald-400 text-xs sm:text-sm flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {sub?.status === "active" ? "مفعّل ونشط 🟢" : "قيد المراجعة 🟡"}
                  </span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-white/50 block text-[10px] font-semibold">تاريخ الانتهاء</span>
                  <span className="font-black text-xs sm:text-sm">{sub?.endDate || "—"}</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
                  <span className="text-white/50 block text-[10px] font-semibold">طريقة السداد</span>
                  <span className="font-black text-xs sm:text-sm">{sub?.paymentMethod || "BaridiMob"}</span>
                </div>
              </div>
            </div>

            {/* Right Side Action Box */}
            <div className="lg:col-span-5 bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center text-center space-y-4 backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-[#0EA96E]/20 text-[#0EA96E] flex items-center justify-center font-bold shadow-lg shadow-[#0EA96E]/20">
                <CreditCard className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-white/60 block">المبلغ المسدد</span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {(sub?.amount || 2000).toLocaleString("ar-DZ")} دج
                </span>
                <span className="text-[11px] text-white/50 block">سارٍ حتى {sub?.endDate}</span>
              </div>
              <div className="w-full py-3 bg-[#0EA96E]/20 border border-[#0EA96E]/40 text-[#0EA96E] font-black rounded-2xl text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                الاشتراك نشط ومسدد
              </div>
            </div>
          </div>

          {/* Features included */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xs">
            <h3 className="font-black text-base text-foreground">الخدمات المشمولة في باقتك الحالية</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {[
                "إدارة المخزون غير المحدود مع تحديث فوري",
                "الظهور في نتائج البحث المتقدم والخريطة",
                "لوحة إحصائيات التفاعل وزيارات المواطنين",
                "إشعارات التنبيه عند انخفاض المخزون",
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-muted/30 border border-border">
                  <CheckCircle2 className="w-4 h-4 text-[#0EA96E] shrink-0" />
                  <span className="font-bold text-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dynamic Payment History */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-foreground">سجل الفواتير والمدفوعات</h3>
                <p className="text-xs text-muted-foreground mt-0.5">آخر المعاملات المالية المعتمدة في النظام</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-muted font-bold text-muted-foreground border border-border">
                {data?.payments?.length || 0} معاملة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3.5">معرف الفاتورة</th>
                    <th className="p-3.5">الفترة المشمولة</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">طريقة الدفع</th>
                    <th className="p-3.5">التاريخ</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5 text-center">الفاتورة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(!data?.payments || data.payments.length === 0) ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        لا توجد مدفوعات مسجلة حالياً.
                      </td>
                    </tr>
                  ) : (
                    data.payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-foreground">{pay.id}</td>
                        <td className="p-3.5 text-foreground font-semibold">{pay.period}</td>
                        <td className="p-3.5 font-bold text-[#0EA96E]">
                          {pay.amount.toLocaleString("ar-DZ")} دج
                        </td>
                        <td className="p-3.5 text-muted-foreground font-semibold">{pay.method}</td>
                        <td className="p-3.5 text-muted-foreground">{pay.date}</td>
                        <td className="p-3.5">
                          <StatusBadge status={pay.status} />
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setSelectedInvoice(pay)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0EA96E]/10 hover:bg-[#0EA96E]/20 text-[#0EA96E] font-bold text-xs transition-all shadow-xs"
                            title="تحميل الفاتورة"
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
          </div>
        </>
      )}

      {/* Invoice Modal for Pharmacist with Scrollable Content */}
      {selectedInvoice && data && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-card border border-border rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between shrink-0 bg-card z-10">
              <div className="flex items-center gap-2 text-foreground font-black text-sm sm:text-base">
                <FileText className="w-5 h-5 text-[#0EA96E]" />
                معاينة فاتورتك الرسمية — {data.pharmacyName}
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

            {/* Scrollable Printable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
              <div className="bg-background border border-border rounded-2xl p-5 sm:p-7 space-y-6 text-foreground text-xs shadow-inner">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b-2 border-[#0EA96E]/30">
                  <div className="space-y-1">
                    <div className="text-xl font-black text-[#0EA96E]">
                      دوائي <span className="text-xs text-[#1A6EBD]">EDAWA PLATFORM</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      المنصة الوطنية المعتمدة للربط والخدمات الصيدلانية
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold text-[#1A6EBD] block">الجهة المصدِرة:</span>
                    <strong className="block text-foreground text-xs">منصة دوائي الوطنية للتقنية الصحية</strong>
                    <p className="text-muted-foreground text-[11px]">الجزائر العاصمة — الجزائر</p>
                    <p className="text-muted-foreground text-[11px]">billing@edawa.dz</p>
                  </div>

                  <div className="p-4 rounded-xl bg-muted/40 border border-border/60 space-y-1">
                    <span className="text-[10px] font-bold text-[#0EA96E] block">الصيدلية المستفيدة:</span>
                    <strong className="block text-foreground text-xs text-[#0EA96E]">{data.pharmacyName}</strong>
                    <p className="text-muted-foreground text-[11px]">الصيدلي المسؤول: <strong>د. {data.ownerName}</strong></p>
                    <p className="text-muted-foreground text-[11px]">رقم الاعتماد: <strong dir="ltr">{data.registrationNumber}</strong></p>
                    <p className="text-muted-foreground text-[11px]">{data.address}، {data.city} ({data.wilaya})</p>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-foreground">{selectedInvoice.period}</div>
                    <div className="text-[10px] text-muted-foreground">تفعيل الحساب والظهور في الشبكة الوطنية</div>
                  </div>
                  <strong className="text-sm font-black text-[#0EA96E]">
                    {selectedInvoice.amount.toLocaleString("ar-DZ")} دج
                  </strong>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-dashed border-border">
                  <div className="text-[10px] text-muted-foreground">
                    <p>الرقم المرجعي للدفع: {selectedInvoice.id}</p>
                    <p>طريقة الدفع: {selectedInvoice.method}</p>
                  </div>
                  <div className="border-2 border-[#0EA96E] text-[#0EA96E] rounded-full w-20 h-20 flex flex-col items-center justify-center text-[9px] font-black rotate-[-12deg]">
                    <span>منصة دوائي</span>
                    <span className="text-[10px]">★ معتمد ★</span>
                    <span>PAYÉ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
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
