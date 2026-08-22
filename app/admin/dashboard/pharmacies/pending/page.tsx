"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  FileCheck,
  Building2,
  UserCheck,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { AdminPharmacy } from "@/lib/mock-data";

export default function AdminPendingPharmaciesPage() {
  const [pendingList, setPendingList] = useState<AdminPharmacy[]>([]);
  const [selectedPh, setSelectedPh] = useState<AdminPharmacy | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pharmacies?status=pending");
      const json = await res.json();
      if (json.success) {
        setPendingList(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch pending pharmacies", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/pharmacies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (res.ok) {
        setPendingList((prev) => prev.filter((p) => p.id !== id));
        setSelectedPh(null);
        setFeedback("تم قبول وتسجيل الصيدلية بنجاح! تم إرسال إشعار التفعيل للصيدلي.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.error("Failed to approve pharmacy", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/pharmacies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject" }),
      });
      if (res.ok) {
        setPendingList((prev) => prev.filter((p) => p.id !== id));
        setSelectedPh(null);
        setFeedback("تم رفض الطلب وتم إخطار المتقدم بالسبب.");
        setTimeout(() => setFeedback(null), 4000);
      }
    } catch (err) {
      console.error("Failed to reject pharmacy", err);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="طلبات التسجيل في انتظار الموافقة"
        description="مراجعة ملفات الصيدليات الجديدة والتحقق من الاعتماد والموافقة أو الرفض"
      />

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {feedback}
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-2xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-500 mb-3" />
          جارٍ فحص طلبات التسجيل...
        </div>
      ) : pendingList.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-black text-base">لا توجد طلبات معلقة حالياً</h3>
          <p className="text-xs text-muted-foreground">تمت مراجعة جميع طلبات تسجيل الصيدليات بنجاح.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pendingList.map((ph) => (
            <div
              key={ph.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4 hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{ph.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {ph.wilaya} — {ph.city}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold">
                    قيد المراجعة
                  </span>
                </div>

                <div className="p-3 bg-muted/40 rounded-xl space-y-1.5 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>الصيدلي:</span>
                    <strong className="text-foreground">{ph.owner}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>رقم الاعتماد:</span>
                    <strong className="text-foreground">{ph.registrationNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>رقم الهاتف:</span>
                    <span className="dir-ltr text-right">{ph.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>تاريخ التقديم:</span>
                    <span>{ph.createdAt}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                <button
                  onClick={() => setSelectedPh(ph)}
                  className="p-2 rounded-xl bg-muted text-foreground hover:bg-muted/80 text-xs font-bold transition-colors"
                  title="عرض التفاصيل"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleApprove(ph.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  قبول وتفعيل
                </button>
                <button
                  onClick={() => handleReject(ph.id)}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold transition-colors"
                  title="رفض"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedPh && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base">مراجعة ملف الصيدلية</h3>
              <button
                onClick={() => setSelectedPh(null)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-muted/40 rounded-xl space-y-2">
                <p>
                  <strong>اسم الصيدلية:</strong> {selectedPh.name}
                </p>
                <p>
                  <strong>الصيدلي المسؤول:</strong> {selectedPh.owner}
                </p>
                <p>
                  <strong>الولاية والبلدية:</strong> {selectedPh.wilaya} — {selectedPh.city}
                </p>
                <p>
                  <strong>رقم الاعتماد الصيدلاني:</strong> {selectedPh.registrationNumber}
                </p>
                <p>
                  <strong>البريد الإلكتروني:</strong> {selectedPh.email}
                </p>
                <p>
                  <strong>رقم الهاتف:</strong> {selectedPh.phone}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-3 border-t border-border">
              <button
                onClick={() => handleReject(selectedPh.id)}
                className="flex-1 py-2.5 rounded-xl bg-rose-500/10 text-rose-600 font-bold text-xs hover:bg-rose-500/20"
              >
                رفض الطلب
              </button>
              <button
                onClick={() => handleApprove(selectedPh.id)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md"
              >
                قبول الصيدلية الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
