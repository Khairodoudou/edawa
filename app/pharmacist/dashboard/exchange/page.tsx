"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Loader2, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ExchangeRequest {
  id: string;
  type: "incoming" | "outgoing";
  fromPharmacy: string;
  toPharmacy: string;
  fromPharmacyPhone?: string;
  toPharmacyPhone?: string;
  partnerPhone?: string;
  partnerCity?: string;
  medicineName: string;
  genericName?: string;
  requestedQuantity: number;
  offeredMedicineName?: string;
  offeredQuantity?: number;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
  notes?: string;
}

interface ExchangeableStock {
  id: string;
  pharmacyName: string;
  pharmacyId?: string;
  wilaya: string;
  city: string;
  phone: string;
  medicineName: string;
  genericName?: string;
  dosage?: string;
  availableForExchange: number;
}

interface MedicineStockOption {
  medicineId: string;
  medicineName: string;
  genericName?: string;
  category?: string;
  quantity: number;
  status: string;
}

interface PharmacyOption {
  id: string;
  name: string;
  city: string;
  wilaya: string;
  phone?: string;
  stock: MedicineStockOption[];
}

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type: "incoming" | "outgoing" | "status";
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MedicineExchangePage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing" | "search">("incoming");
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [exchangeableStock, setExchangeableStock] = useState<ExchangeableStock[]>([]);
  const [pharmacyOptions, setPharmacyOptions] = useState<PharmacyOption[]>([]);
  const [currentPharmacyId, setCurrentPharmacyId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [toastAlert, setToastAlert] = useState<ToastAlert | null>(null);

  const prevIncomingCountRef = useRef<number | null>(null);

  // New Request Form State (Simplified without offered medicine)
  const [newRequest, setNewRequest] = useState({
    toPharmacyId: "",
    medicineName: "",
    genericName: "",
    requestedQuantity: "10",
    notes: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  // ─── Data Fetching (Real-Time Live) ────────────────────────────────────────

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [exchangeRes, pharmaciesRes] = await Promise.all([
        fetch("/api/pharmacist/exchange?t=" + Date.now()),
        fetch("/api/pharmacies?limit=100"),
      ]);

      if (exchangeRes.ok) {
        const json = await exchangeRes.json();
        const incomingList: ExchangeRequest[] = json.data?.requests || [];
        setRequests(incomingList);
        setExchangeableStock(json.data?.exchangeableStock || []);
        if (json.data?.currentPharmacyId) {
          setCurrentPharmacyId(json.data.currentPharmacyId);
        }

        // Live notification if new incoming request arrives
        const incomingCount = incomingList.filter((r) => r.type === "incoming").length;
        if (
          prevIncomingCountRef.current !== null &&
          incomingCount > prevIncomingCountRef.current
        ) {
          const newest = incomingList.find((r) => r.type === "incoming");
          if (newest) {
            setToastAlert({
              id: String(Date.now()),
              title: "🔔 طلب تبادل وارد جديد!",
              message: `وصلك طلب دواء (${newest.medicineName}) من ${newest.fromPharmacy}.`,
              type: "incoming",
            });
          }
        }
        prevIncomingCountRef.current = incomingCount;
      }

      if (pharmaciesRes.ok) {
        const json = await pharmaciesRes.json();
        setPharmacyOptions(
          (json.data || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            city: p.city,
            wilaya: p.wilaya,
            phone: p.phone,
            stock: (p.stock || []).map((s: any) => ({
              medicineId: s.medicineId || s.id,
              medicineName: s.medicineName || s.name,
              genericName: s.genericName || "",
              category: s.category || "",
              quantity: s.quantity || 0,
              status: s.status || "available",
            })),
          }))
        );
      }
    } catch {
      // Silent catch on poll
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Initial load + Real-time live polling every 5 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Auto-dismiss toast after 6 seconds
  useEffect(() => {
    if (toastAlert) {
      const timer = setTimeout(() => setToastAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toastAlert]);

  // ─── Filter Helpers ────────────────────────────────────────────────────────

  // Filter out the current pharmacy (Requirement 1: show all except the current pharmacy itself)
  const targetPharmaciesList = pharmacyOptions.filter((p) => p.id !== currentPharmacyId);

  // Selected target pharmacy and its available medicines (Requirement 2)
  const selectedTargetPharmacy = pharmacyOptions.find((p) => p.id === newRequest.toPharmacyId);
  const targetPharmacyMedicines = selectedTargetPharmacy?.stock || [];

  // Handle target pharmacy change
  const handleTargetPharmacyChange = (pharmacyId: string) => {
    const selectedPh = pharmacyOptions.find((p) => p.id === pharmacyId);
    const firstMed = selectedPh?.stock && selectedPh.stock.length > 0 ? selectedPh.stock[0] : null;

    setNewRequest((prev) => ({
      ...prev,
      toPharmacyId: pharmacyId,
      medicineName: firstMed ? firstMed.medicineName : "",
      genericName: firstMed ? (firstMed.genericName || firstMed.medicineName) : "",
      requestedQuantity: prev.requestedQuantity || "10",
    }));
  };

  // Handle medicine selection change
  const handleMedicineChange = (medicineName: string) => {
    const med = targetPharmacyMedicines.find((m) => m.medicineName === medicineName);
    setNewRequest((prev) => ({
      ...prev,
      medicineName,
      genericName: med?.genericName || medicineName,
    }));
  };

  // ─── Actions ───────────────────────────────────────────────────────────────

  const handleUpdateStatus = async (
    id: string,
    newStatus: "approved" | "rejected" | "completed"
  ) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/pharmacist/exchange/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      // Instant optimistic state update
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );

      setToastAlert({
        id: String(Date.now()),
        title:
          newStatus === "approved"
            ? "🟢 تمت الموافقة على الطلب"
            : newStatus === "rejected"
            ? "🔴 تم رفض الطلب"
            : "✅ تم تأكيد اكتمال التبادل",
        message:
          newStatus === "approved"
            ? "تم قبول طلب التبادل بنجاح! يمكنك الآن الاتصال بالصيدلية للتسليم."
            : newStatus === "rejected"
            ? "تم رفض طلب التبادل."
            : "تمت عملية التبادل بنجاح وتحديث السجلات.",
        type: "status",
      });

      // Refetch live to sync
      fetchData(true);
    } catch {
      setToastAlert({
        id: String(Date.now()),
        title: "⚠️ خطأ",
        message: "حدث خطأ أثناء تحديث حالة الطلب.",
        type: "status",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendNewRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.toPharmacyId) {
      setToastAlert({
        id: String(Date.now()),
        title: "⚠️ تنبيه",
        message: "يرجى اختيار الصيدلية المستهدفة.",
        type: "status",
      });
      return;
    }
    if (!newRequest.medicineName) {
      setToastAlert({
        id: String(Date.now()),
        title: "⚠️ تنبيه",
        message: "يرجى اختيار الدواء المطلوب.",
        type: "status",
      });
      return;
    }

    setFormLoading(true);
    try {
      const targetPharmacyObj = targetPharmaciesList.find((p) => p.id === newRequest.toPharmacyId);

      const res = await fetch("/api/pharmacist/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toPharmacyId: newRequest.toPharmacyId,
          medicineName: newRequest.medicineName,
          genericName: newRequest.genericName || newRequest.medicineName,
          requestedQuantity: parseInt(newRequest.requestedQuantity) || 1,
          notes: newRequest.notes || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);

      // Create new request object for instant real-time state update
      const createdItem: ExchangeRequest = {
        id: json.data?.id || `ex-${Date.now()}`,
        type: "outgoing",
        fromPharmacy: "صيدليتك",
        toPharmacy: targetPharmacyObj?.name || "الصيدلية المستهدفة",
        partnerPhone: targetPharmacyObj?.phone || "",
        partnerCity: targetPharmacyObj?.city || "",
        medicineName: newRequest.medicineName,
        genericName: newRequest.genericName,
        requestedQuantity: parseInt(newRequest.requestedQuantity) || 1,
        status: "pending",
        createdAt: new Date().toISOString().split("T")[0],
        notes: newRequest.notes,
      };

      // ⚡ INSTANT REAL-TIME UPDATE: Add directly to requests state
      setRequests((prev) => [createdItem, ...prev]);

      setShowModal(false);
      setActiveTab("outgoing");

      // 🔔 REAL-TIME NOTIFICATION POPUP
      const newOutgoingCount = requests.filter((r) => r.type === "outgoing").length + 1;
      setToastAlert({
        id: String(Date.now()),
        title: "🚀 تم إرسال طلب التبادل بنجاح!",
        message: `تم إرسال طلب (${newRequest.medicineName} × ${newRequest.requestedQuantity} وحدة) إلى ${targetPharmacyObj?.name || "الصيدلية"}. عدد الطلبات الصادرة أصبح (${newOutgoingCount}).`,
        type: "outgoing",
      });

      // Reset form
      setNewRequest({
        toPharmacyId: "",
        medicineName: "",
        genericName: "",
        requestedQuantity: "10",
        notes: "",
      });

      // Background live refresh to guarantee full DB sync
      fetchData(true);
    } catch {
      setToastAlert({
        id: String(Date.now()),
        title: "❌ فشل الإرسال",
        message: "حدث خطأ أثناء إرسال طلب التبادل. يرجى المحاولة مجدداً.",
        type: "status",
      });
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Derived Real-time Counts ──────────────────────────────────────────────

  const incomingRequests = requests.filter((r) => r.type === "incoming");
  const outgoingRequests = requests.filter((r) => r.type === "outgoing");
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const completedCount = requests.filter(
    (r) => r.status === "completed" || r.status === "approved"
  ).length;

  const filteredExchangeStock = exchangeableStock.filter((item) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (item.medicineName || "").toLowerCase().includes(s) ||
      (item.genericName || "").toLowerCase().includes(s) ||
      (item.pharmacyName || "").toLowerCase().includes(s) ||
      (item.wilaya || "").toLowerCase().includes(s)
    );
  });

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-[#0EA96E]" />
          <span className="text-sm font-semibold">جارٍ تحميل شبكة التبادل المباشرة... 🔄</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* 🔔 FLOATING REAL-TIME TOAST NOTIFICATION */}
      {toastAlert && (
        <div className="fixed top-20 left-4 sm:left-8 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-card/95 backdrop-blur-md border border-[#0EA96E]/40 text-foreground p-4 rounded-2xl shadow-2xl shadow-[#0EA96E]/15 flex items-start gap-3.5 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-[#0EA96E] to-emerald-400" />
            <div className="w-10 h-10 rounded-xl bg-[#0EA96E]/15 text-2xl flex items-center justify-center shrink-0 mt-0.5">
              {toastAlert.type === "incoming" ? "🔔" : toastAlert.type === "outgoing" ? "🚀" : "✅"}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-black text-foreground mb-0.5">{toastAlert.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{toastAlert.message}</p>
            </div>
            <button
              onClick={() => setToastAlert(null)}
              className="text-muted-foreground hover:text-foreground w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <PageHeader
        title="🔄 شبكة تبادل الأدوية بين الصيدليات"
        description="البحث عن الصيدليات المجاورة، إرسال واستقبال طلبات التبادل لمواجهة نقص المخزون بشكل لحظي"
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/pharmacist/dashboard/exchange/archive"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 border border-border bg-card hover:bg-muted rounded-xl text-xs font-bold text-foreground transition-all shadow-xs"
            >
              🗄️ جدول الأرشيف ({completedCount})
            </Link>
            <button
              onClick={() => fetchData()}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground hover:border-[#0EA96E]/40 transition-all"
            >
              🔄 تحديث
            </button>
            <button
              onClick={() => {
                if (targetPharmaciesList.length > 0 && !newRequest.toPharmacyId) {
                  handleTargetPharmacyChange(targetPharmaciesList[0].id);
                }
                setShowModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-md transition-all"
            >
              ➕ إنشاء طلب تبادل
            </button>
          </div>
        }
      />

      {/* 4-Step Banner */}
      <div className="bg-gradient-to-r from-[#0f2d20] to-[#0f1f35] border border-white/10 rounded-2xl p-6 text-white space-y-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-base flex items-center gap-2">
            <span>🔄</span>
            كيف تعمل شبكة التبادل المباشرة؟ (4 خطوات)
          </h3>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#0EA96E]/20 text-[#0EA96E] font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0EA96E] animate-pulse" />
            ⚡ تحديث لحظي
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[
            { step: "1", title: "البحث عن الدواء", emoji: "🔍", desc: "اعثر على الصيدلية التي لديها الدواء الذي تحتاجه." },
            { step: "2", title: "إرسال الطلب", emoji: "📤", desc: "حدّد الصيدلية والدواء من مخزونها والكمية المطلوبة." },
            { step: "3", title: "الموافقة والرد", emoji: "🤝", desc: "تراجع الصيدلية الأخرى الطلب وتقبله أو ترفضه." },
            { step: "4", title: "التسليم والتسوية", emoji: "🚚", desc: "التواصل عبر الهاتف والتسليم بين الصيدليين." },
          ].map((s) => (
            <div key={s.step} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 relative overflow-hidden">
              <span className="absolute -left-2 -bottom-2 text-4xl font-black text-white/5 select-none">0{s.step}</span>
              <div className="flex items-center gap-2">
                <span className="text-base">{s.emoji}</span>
                <h4 className="font-bold text-xs text-white">{s.title}</h4>
              </div>
              <p className="text-[11px] text-white/70 leading-5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Cards — Real-time Counts with Emojis */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "الطلبات الواردة", value: incomingRequests.length, color: "blue", emoji: "📥" },
          { label: "الطلبات الصادرة", value: outgoingRequests.length, color: "purple", emoji: "📤" },
          { label: "قيد الانتظار", value: pendingCount, color: "amber", emoji: "⏳" },
          { label: "مكتملة ومقبولة", value: completedCount, color: "emerald", emoji: "✅" },
        ].map((card) => {
          const colorMap: Record<string, string> = {
            blue: "bg-blue-500/10 text-blue-600",
            purple: "bg-purple-500/10 text-purple-600",
            amber: "bg-amber-500/10 text-amber-600",
            emerald: "bg-emerald-500/10 text-emerald-600",
          };
          const valueColor: Record<string, string> = {
            blue: "text-foreground",
            purple: "text-foreground",
            amber: "text-amber-600",
            emerald: "text-emerald-600",
          };
          return (
            <div key={card.label} className="bg-card border border-border rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block mb-1">{card.label}</span>
                <span className={`text-2xl font-black ${valueColor[card.color]}`}>{card.value}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl ${colorMap[card.color]} text-xl flex items-center justify-center`}>
                {card.emoji}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs — Real-Time Live Counts with Emojis */}
      <div className="flex border-b border-border gap-6 text-sm font-bold overflow-x-auto">
        {[
          { key: "incoming" as const, label: `📥 الطلبات الواردة (${incomingRequests.length})`, count: incomingRequests.length },
          { key: "outgoing" as const, label: `📤 الطلبات الصادرة (${outgoingRequests.length})`, count: outgoingRequests.length },
          { key: "search" as const, label: `🔍 البحث في شبكة التبادل (${filteredExchangeStock.length})`, count: filteredExchangeStock.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 relative flex items-center gap-2 whitespace-nowrap transition-colors ${
              activeTab === tab.key ? "text-[#0EA96E]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0EA96E] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: INCOMING */}
      {activeTab === "incoming" && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <EmptyState
              emoji="📥"
              title="لا توجد طلبات واردة حالياً"
              desc="حين تُرسل إليك صيدلية أخرى طلب تبادل، سيظهر هنا فورياً مع إشعار تنبيه."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  direction="incoming"
                  actionLoading={actionLoading}
                  onApprove={(id) => handleUpdateStatus(id, "approved")}
                  onReject={(id) => handleUpdateStatus(id, "rejected")}
                  onComplete={(id) => handleUpdateStatus(id, "completed")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OUTGOING */}
      {activeTab === "outgoing" && (
        <div className="space-y-4">
          {outgoingRequests.length === 0 ? (
            <EmptyState
              emoji="📤"
              title="لم ترسل أي طلبات بعد"
              desc="أنشئ طلب تبادل جديد للتواصل مع صيدليات أخرى فورياً."
              action={
                <button
                  onClick={() => {
                    if (targetPharmaciesList.length > 0 && !newRequest.toPharmacyId) {
                      handleTargetPharmacyChange(targetPharmaciesList[0].id);
                    }
                    setShowModal(true);
                  }}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0EA96E] text-white font-bold rounded-xl text-xs"
                >
                  ➕ إنشاء طلب الآن
                </button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoingRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  req={req}
                  direction="outgoing"
                  actionLoading={actionLoading}
                  onApprove={(id) => handleUpdateStatus(id, "approved")}
                  onReject={(id) => handleUpdateStatus(id, "rejected")}
                  onComplete={(id) => handleUpdateStatus(id, "completed")}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SEARCH */}
      {activeTab === "search" && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3 shadow-xs">
            <span className="text-base shrink-0">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث باسم الدواء أو اسم الصيدلية أو الولاية..."
              className="w-full bg-transparent text-xs focus:outline-none text-foreground placeholder:text-muted-foreground"
            />
            {search && (
              <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredExchangeStock.length === 0 ? (
            <EmptyState
              emoji="🏥"
              title="لا توجد أدوية متاحة للتبادل حالياً"
              desc="الأدوية تظهر هنا عندما تتوفر كميات فائضة لدى الصيدليات الأخرى (أكثر من 20 وحدة)."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExchangeStock.map((item) => {
                const targetPh = pharmacyOptions.find(
                  (p) => p.name === item.pharmacyName || p.id === item.pharmacyId
                );

                return (
                  <div
                    key={item.id}
                    className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs hover:border-[#0EA96E]/30 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏥</span>
                          <h4 className="font-bold text-sm">{item.pharmacyName}</h4>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted font-bold text-muted-foreground">
                          📍 {item.wilaya} — {item.city}
                        </span>
                      </div>

                      <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1 text-xs">
                        <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <span>💊</span>
                          {item.medicineName} {item.dosage && `(${item.dosage})`}
                        </div>
                        <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          الكمية المتاحة للتبادل:{" "}
                          <strong>{item.availableForExchange}</strong> وحدة
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <a
                        href={`tel:${item.phone}`}
                        className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-[#0EA96E] transition-colors"
                      >
                        📞 {item.phone}
                      </a>
                      <button
                        onClick={() => {
                          const targetId = targetPh ? targetPh.id : (item.pharmacyId || "");
                          setNewRequest({
                            toPharmacyId: targetId,
                            medicineName: item.medicineName,
                            genericName: item.genericName || item.medicineName,
                            requestedQuantity: "10",
                            notes: "",
                          });
                          setShowModal(true);
                        }}
                        className="px-3.5 py-1.5 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-colors shadow-xs"
                      >
                        📤 إرسال طلب تبادل
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: New Exchange Request */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl animate-in zoom-in-95 fade-in">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-black text-base flex items-center gap-2">
                <span>🔄</span>
                إرسال طلب تبادل دواء
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendNewRequest} className="space-y-4">
              {/* 1. Target Pharmacy (Excludes Current Pharmacy) */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  🏥 الصيدلية المستهدفة <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={newRequest.toPharmacyId}
                  onChange={(e) => handleTargetPharmacyChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E]"
                >
                  <option value="">— اختر الصيدلية المستهدفة —</option>
                  {targetPharmaciesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {p.wilaya} ({p.city})
                    </option>
                  ))}
                </select>
                {targetPharmaciesList.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    ⚠️ لا توجد صيدليات أخرى مسجلة حالياً في النظام.
                  </p>
                )}
              </div>

              {/* 2. Medicine Needed (Filtered by selected target pharmacy) */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  💊 الدواء المطلوب <span className="text-rose-500">*</span>
                </label>
                {!newRequest.toPharmacyId ? (
                  <div className="w-full px-3.5 py-2.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground">
                    — يرجى اختيار الصيدلية المستهدفة أولاً لعرض الأدوية المتوفرة لديها —
                  </div>
                ) : targetPharmacyMedicines.length === 0 ? (
                  <div className="space-y-2">
                    <div className="w-full px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300">
                      لا توجد أدوية مسجلة في مخزون هذه الصيدلية حالياً. يمكنك كتابة اسم الدواء يدوياً أدناه:
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="اسم الدواء المطلوب"
                      value={newRequest.medicineName}
                      onChange={(e) => setNewRequest({ ...newRequest, medicineName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E]"
                    />
                  </div>
                ) : (
                  <select
                    required
                    value={newRequest.medicineName}
                    onChange={(e) => handleMedicineChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E]"
                  >
                    <option value="">— اختر الدواء من مخزون الصيدلية المستهدفة —</option>
                    {targetPharmacyMedicines.map((m) => (
                      <option key={m.medicineId || m.medicineName} value={m.medicineName}>
                        {m.medicineName} {m.quantity > 0 ? `(المتوفر: ${m.quantity} وحدة)` : "(غير متوفر)"}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">
                  🔢 الكمية المطلوبة (وحدة) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="مثال: 10"
                  value={newRequest.requestedQuantity}
                  onChange={(e) => setNewRequest({ ...newRequest, requestedQuantity: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E]"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold mb-1.5">📝 ملاحظات أو طريقة التسليم والتواصل</label>
                <textarea
                  rows={2}
                  placeholder="مثال: يرجى التواصل عبر الهاتف للتسليم السريع..."
                  value={newRequest.notes}
                  onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-muted text-foreground font-bold text-xs hover:bg-muted/80"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formLoading || targetPharmaciesList.length === 0}
                  className="flex-1 py-2.5 rounded-xl bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold text-xs shadow-md disabled:opacity-60 flex items-center justify-center gap-1.5"
                >
                  {formLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>🚀</span>
                  )}
                  {formLoading ? "جارٍ الإرسال..." : "إرسال الطلب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function RequestCard({
  req,
  direction,
  actionLoading,
  onApprove,
  onReject,
  onComplete,
}: {
  req: ExchangeRequest;
  direction: "incoming" | "outgoing";
  actionLoading: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  const isLoading = actionLoading === req.id;
  const phoneNumber = req.partnerPhone || (direction === "incoming" ? req.fromPharmacyPhone : req.toPharmacyPhone);
  const partnerName = direction === "incoming" ? req.fromPharmacy : req.toPharmacy;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-xs hover:border-[#0EA96E]/30 transition-all flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 ${
              direction === "incoming"
                ? "bg-blue-500/10 text-blue-600"
                : "bg-purple-500/10 text-purple-600"
            }`}
          >
            {direction === "incoming" ? `📥 من: ${req.fromPharmacy}` : `📤 إلى: ${req.toPharmacy}`}
          </span>
          <StatusBadge status={req.status} />
        </div>

        <div className="p-3 bg-muted/40 rounded-xl space-y-2 text-xs">
          <div className="font-bold flex items-center gap-1.5">
            <span>💊</span>
            {direction === "incoming" ? "يطلب: " : "طلبتم: "}
            {req.medicineName}
            <span className="text-muted-foreground font-normal">({req.requestedQuantity} وحدة)</span>
          </div>

          {/* 📞 Direct Contact Info when request is completed or approved */}
          {(req.status === "completed" || req.status === "approved" || req.status === "pending") && phoneNumber && (
            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
              <span className="text-[11px] text-muted-foreground font-medium">
                {direction === "incoming" ? "هاتف الصيدلية الطالبة:" : "هاتف الصيدلية المستهدفة:"}
              </span>
              <a
                href={`tel:${phoneNumber}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-[#0EA96E] font-bold text-xs transition-colors border border-emerald-500/20"
                dir="ltr"
              >
                <span>📞</span>
                {phoneNumber}
              </a>
            </div>
          )}

          {req.notes && (
            <div className="text-[11px] text-muted-foreground/80 pt-1 border-t border-border/50 italic">
              📝 &ldquo;{req.notes}&rdquo;
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-[10px] text-muted-foreground">📅 {req.createdAt}</span>

        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-[#0EA96E]" />
        ) : req.status === "pending" && direction === "incoming" ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onReject(req.id)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 font-bold text-xs hover:bg-rose-500/20 transition-colors"
            >
              ❌ رفض
            </button>
            <button
              onClick={() => onApprove(req.id)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-xs transition-colors"
            >
              🟢 موافقة
            </button>
          </div>
        ) : req.status === "approved" ? (
          <div className="flex items-center gap-2">
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber}`}
                className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 shadow-xs transition-colors flex items-center gap-1"
              >
                📞 اتصل للتسليم
              </a>
            )}
            <button
              onClick={() => onComplete(req.id)}
              className="px-3 py-1.5 rounded-lg bg-[#0EA96E]/10 text-[#0EA96E] font-bold text-xs hover:bg-[#0EA96E]/20 transition-colors flex items-center gap-1"
            >
              ✅ تأكيد الاكتمال
            </button>
          </div>
        ) : req.status === "completed" ? (
          <div className="flex items-center gap-2">
            {phoneNumber && (
              <a
                href={`tel:${phoneNumber}`}
                className="px-2.5 py-1 rounded-lg bg-[#0EA96E]/10 text-[#0EA96E] font-bold text-[11px] hover:bg-[#0EA96E]/20 transition-colors flex items-center gap-1"
              >
                📞 {phoneNumber}
              </a>
            )}
            <Link
              href="/pharmacist/dashboard/exchange/archive"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-bold text-[11px] transition-colors"
            >
              🗄️ الأرشيف
            </Link>
            <span className="text-xs font-bold text-emerald-600">
              ✅ مكتمل
            </span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-rose-600">
            ❌ مرفوض
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({
  emoji,
  title,
  desc,
  action,
}: {
  emoji: string;
  title: string;
  desc: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center text-center gap-3">
      <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center text-2xl">
        {emoji}
      </div>
      <h4 className="font-bold text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground max-w-xs">{desc}</p>
      {action}
    </div>
  );
}
