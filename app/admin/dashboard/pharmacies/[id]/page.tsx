"use client";

import { use, useState, Suspense, useEffect } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  ArrowRight,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileCheck,
  Calendar,
  CreditCard,
  Pill,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Loader2,
} from "lucide-react";

function PharmacyDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [pharmacy, setPharmacy] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPh() {
      try {
        const res = await fetch(`/api/admin/pharmacies/${id}`);
        const json = await res.json();
        if (json.success) setPharmacy(json.data);
      } catch (err) {
        console.error("Failed to load pharmacy", err);
      } finally {
        setLoading(false);
      }
    }
    loadPh();
  }, [id]);

  const handleAction = async (action: "approve" | "suspend" | "reject") => {
    try {
      const res = await fetch(`/api/admin/pharmacies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setPharmacy(json.data);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-2xl">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1A6EBD] mb-3" />
        جارٍ تحميل تفاصيل الصيدلية...
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card border border-border rounded-2xl">
        الصيدلية غير موجودة.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-black text-foreground">{pharmacy.name}</h2>
              <StatusBadge status={pharmacy.status?.toLowerCase() || "active"} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              الصيدلي المالك: <strong className="text-foreground">{pharmacy.owner?.name || pharmacy.owner}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {pharmacy.status === "PENDING" && (
            <>
              <button
                onClick={() => handleAction("approve")}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                قبول وتفعيل الصيدلية
              </button>
              <button
                onClick={() => handleAction("reject")}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                <XCircle className="w-4 h-4" />
                رفض الطلب
              </button>
            </>
          )}

          {pharmacy.status === "ACTIVE" && (
            <button
              onClick={() => handleAction("suspend")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold rounded-xl text-xs transition-colors"
            >
              <ShieldAlert className="w-4 h-4" />
              تجميد الحساب
            </button>
          )}

          {pharmacy.status === "SUSPENDED" && (
            <button
              onClick={() => handleAction("approve")}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              إعادة التفعيل
            </button>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact & Location Info */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-foreground pb-3 border-b border-border">
            معلومات الاتصال والموقع
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>
                {pharmacy.wilaya?.name || pharmacy.wilaya} — {pharmacy.city} ({pharmacy.address})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="font-semibold text-foreground dir-ltr text-right">{pharmacy.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
              <span>{pharmacy.email}</span>
            </div>
          </div>
        </div>

        {/* Registration & System Info */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-foreground pb-3 border-b border-border">
            بيانات الاعتماد والاشتراك
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <FileCheck className="w-4 h-4" />
                رقم الاعتماد الصيدلاني:
              </span>
              <span className="font-bold text-foreground">{pharmacy.registrationNumber}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Pill className="w-4 h-4" />
                الأدوية المسجلة بالمخزون:
              </span>
              <span className="font-bold text-foreground">{pharmacy.stock?.length || 0} دواء</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                تاريخ التسجيل:
              </span>
              <span className="text-foreground">{new Date(pharmacy.createdAt || 2026).toISOString().split("T")[0]}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPharmacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/dashboard/pharmacies"
          className="p-2 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
        </Link>
        <PageHeader
          title="ملف الصيدلية"
          description="الملف الكامل والاعتماد الإداري للصيدلية"
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
        <PharmacyDetailContent params={params} />
      </Suspense>
    </div>
  );
}
