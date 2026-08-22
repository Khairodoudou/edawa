"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/layout/Navbar";
import { MapPin, Phone, Clock, Search, ShieldCheck, X, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Pharmacy } from "@/lib/mock-data";

const MapView = dynamic(() => import("@/components/shared/PharmaciesMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-muted flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-2 border-[#0EA96E] border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm font-semibold">جارٍ تحميل الخريطة...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  const [pharmaciesList, setPharmaciesList] = useState<Pharmacy[]>([]);
  const [selected, setSelected] = useState<Pharmacy | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "duty">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPharmacies() {
      try {
        const res = await fetch("/api/pharmacies?limit=100");
        const json = await res.json();
        if (json.success) setPharmaciesList(json.data);
      } catch (err) {
        console.error("Failed to load map pharmacies", err);
      } finally {
        setLoading(false);
      }
    }
    loadPharmacies();
  }, []);

  const filtered = pharmaciesList.filter((ph) => {
    const s = search.toLowerCase().trim();
    const matchesSearch =
      !s ||
      ph.name.toLowerCase().includes(s) ||
      ph.address.toLowerCase().includes(s) ||
      ph.city.toLowerCase().includes(s) ||
      ph.wilaya.toLowerCase().includes(s) ||
      (ph.stock || []).some(
        (stk) =>
          stk.medicineName.toLowerCase().includes(s) ||
          (stk as any).genericName?.toLowerCase().includes(s)
      );
    const matchesFilter =
      filter === "all" ||
      (filter === "open" && ph.isOpen) ||
      (filter === "duty" && ph.isOnDuty);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Navbar />

      <div className="pt-16 flex-1 flex overflow-hidden h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-80 sm:w-96 flex flex-col bg-card border-l border-border overflow-hidden shrink-0 z-10 shadow-lg">
          {/* Sidebar Light Header */}
          <div className="p-4 border-b border-border bg-gradient-to-b from-[#E8FBF4] via-muted/30 to-background">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-black text-foreground">
                خريطة الصيدليات
              </h1>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#0EA96E]/15 text-[#0EA96E] border border-[#0EA96E]/30">
                {filtered.length} صيدلية
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث باسم الصيدلية أو العنوان..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E] focus:ring-1 focus:ring-[#0EA96E]"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "all"
                    ? "bg-[#0EA96E] text-white shadow-xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setFilter("open")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "open"
                    ? "bg-[#0EA96E] text-white shadow-xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                مفتوحة الآن
              </button>
              <button
                onClick={() => setFilter("duty")}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === "duty"
                    ? "bg-[#1A6EBD] text-white shadow-xs"
                    : "bg-background border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                مناوبة (Garde)
              </button>
            </div>
          </div>

          {/* Pharmacies List */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#0EA96E] mb-2" />
                جارٍ تحميل الصيدليات...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs">
                لا توجد صيدليات مطابقة للبحث
              </div>
            ) : (
              filtered.map((ph) => (
                <div
                  key={ph.id}
                  onClick={() => setSelected(ph)}
                  className={`p-4 cursor-pointer transition-colors hover:bg-muted/40 ${
                    selected?.id === ph.id ? "bg-[#0EA96E]/10 border-r-4 border-[#0EA96E]" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-bold text-xs text-foreground">{ph.name}</h3>
                    {ph.isOnDuty && (
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 text-[10px] font-bold shrink-0">
                        مناوبة
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    {ph.address}، {ph.city}
                  </p>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ph.hours}
                    </span>
                    <span
                      className={`font-semibold ${
                        ph.isOpen ? "text-[#0EA96E]" : "text-rose-500"
                      }`}
                    >
                      {ph.isOpen ? "● مفتوح" : "● مغلق"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 relative">
          <MapView
            pharmacies={filtered}
            selectedId={selected?.id}
            onSelect={(id) => {
              const ph = pharmaciesList.find((p) => p.id === id);
              if (ph) setSelected(ph);
            }}
          />

          {/* Bottom Card for selected pharmacy */}
          {selected && (
            <div className="absolute bottom-6 right-6 left-6 sm:right-auto sm:w-96 bg-card border border-border rounded-2xl p-4 shadow-xl z-20 animate-in slide-in-from-bottom-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">{selected.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selected.address}، {selected.city}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {selected.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selected.hours}
                </span>
              </div>

              <Link
                href={`/pharmacies/${selected.id}`}
                className="w-full py-2 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                عرض الأدوية المتوفرة
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
