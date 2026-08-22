"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/shared/SearchBar";
import PharmacyCard from "@/components/shared/PharmacyCard";
import Pagination from "@/components/shared/Pagination";
import { SlidersHorizontal, List, Map as MapIcon, X, Search as SearchIcon, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import type { Pharmacy } from "@/lib/mock-data";
import type { PaginationMeta } from "@/lib/api-utils";
import { ALGERIAN_WILAYAS_LIST } from "@/lib/algeria-coordinates";

const PharmaciesMapView = dynamic(() => import("@/components/shared/PharmaciesMapView"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 bg-muted rounded-2xl flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[#0EA96E] border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground text-sm">جارٍ تحميل الخريطة...</p>
      </div>
    </div>
  ),
});

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";

  const [pharmaciesList, setPharmaciesList] = useState<Pharmacy[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 6,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState<"list" | "map">("list");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [onlyDuty, setOnlyDuty] = useState(false);
  const [sortBy, setSortBy] = useState<"nearest" | "rating" | "name">("nearest");
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string | undefined>(undefined);

  const fetchResults = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "6",
        sort: sortBy,
      });
      if (query) params.append("q", query);
      if (categoryParam) params.append("category", categoryParam);
      if (selectedWilaya !== "all") params.append("wilaya", selectedWilaya);
      if (onlyOpen) params.append("isOpen", "true");
      if (onlyDuty) params.append("isOnDuty", "true");

      const res = await fetch(`/api/search?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setPharmaciesList(json.data);
        if (json.meta) setMeta(json.meta);
      }
    } catch (err) {
      console.error("Search fetch failed", err);
    } finally {
      setLoading(false);
    }
  }, [query, categoryParam, selectedWilaya, onlyOpen, onlyDuty, sortBy]);

  useEffect(() => {
    fetchResults(1);
  }, [fetchResults]);

  const wilayasOptions = [
    "الجزائر العاصمة",
    "وهران",
    "قسنطينة",
    "عنابة",
    "بجاية",
    "سطيف",
    "تيزي وزو",
    "البليدة",
    "باتنة",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-[#E8FBF4]/70 via-muted/30 to-background pt-24 pb-8 border-b border-border/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-5 text-center sm:text-right">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-2">
              {query ? (
                <>
                  نتائج البحث عن:{" "}
                  <span className="text-[#0EA96E]">&ldquo;{query}&rdquo;</span>
                </>
              ) : categoryParam ? (
                <>
                  أدوية فئة:{" "}
                  <span className="text-[#0EA96E]">&ldquo;{categoryParam}&rdquo;</span>
                </>
              ) : (
                "البحث عن الأدوية والصيدليات"
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              {query || categoryParam ? (
                <>
                  وُجدت{" "}
                  <span className="font-bold text-foreground">{meta.total}</span>{" "}
                  صيدلية مطابقة لشرط البحث
                </>
              ) : (
                "اكتب اسم الدواء الذي تبحث عنه لعرض الصيدليات المتاحة والقريبة"
              )}
            </p>
          </div>

          <SearchBar size="md" placeholder="ابحث عن اسم دواء أو صيدلية..." />
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Toggle */}
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                filterOpen
                  ? "bg-[#0EA96E] text-white border-[#0EA96E]"
                  : "bg-card border-border hover:border-[#0EA96E]/30"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              فلترة متقدمة
            </button>

            {/* Only Open Filter */}
            <button
              onClick={() => setOnlyOpen(!onlyOpen)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                onlyOpen
                  ? "bg-[#0EA96E]/10 text-[#0EA96E] border-[#0EA96E]/40"
                  : "bg-card border-border hover:border-[#0EA96E]/30"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${onlyOpen ? "bg-[#0EA96E] pulse-green" : "bg-muted-foreground"}`} />
              مفتوحة الآن
            </button>

            {/* Only Duty Filter */}
            <button
              onClick={() => setOnlyDuty(!onlyDuty)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                onlyDuty
                  ? "bg-blue-500/10 text-blue-600 border-blue-500/40"
                  : "bg-card border-border hover:border-blue-500/30"
              }`}
            >
              مناوبة (Garde)
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              قائمة
            </button>
            <button
              onClick={() => setView("map")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === "map"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapIcon className="w-4 h-4" />
              خريطة
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
              <h3 className="font-bold text-base">خيارات الفلترة والترتيب</h3>
              <button onClick={() => setFilterOpen(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  الولاية
                </label>
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA96E]/30"
                >
                  <option value="all">جميع الولايات (الكل)</option>
                  {ALGERIAN_WILAYAS_LIST.map((w) => (
                    <option key={w.code} value={w.name}>
                      {w.code} — {w.name} ({w.nameFr})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-muted-foreground mb-2 block">
                  الترتيب حسب
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0EA96E]/30"
                >
                  <option value="nearest">الأقرب جغرافياً</option>
                  <option value="name">اسم الصيدلية (أبجدياً)</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedWilaya("all");
                    setOnlyOpen(false);
                    setOnlyDuty(false);
                    setSortBy("nearest");
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-semibold transition-colors"
                >
                  إعادة ضبط الفلاتر
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Switch */}
        {loading ? (
          <div className="p-20 text-center text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0EA96E] mb-3" />
            جارٍ البحث في قاعدة البيانات الحية...
          </div>
        ) : pharmaciesList.length > 0 ? (
          view === "list" ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pharmaciesList.map((ph) => (
                  <PharmacyCard key={ph.id} pharmacy={ph} searchedMedicine={query} />
                ))}
              </div>
              <Pagination
                meta={meta}
                onPageChange={(p) => fetchResults(p)}
              />
            </div>
          ) : (
            <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-lg h-[600px] relative">
              <PharmaciesMapView
                pharmacies={pharmaciesList}
                selectedId={selectedPharmacyId}
                onSelect={(id) => setSelectedPharmacyId(id)}
              />
            </div>
          )
        ) : (
          <div className="bg-card border border-border rounded-3xl p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-[#0EA96E]/10 flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-8 h-8 text-[#0EA96E]" />
            </div>
            <h3 className="text-xl font-bold mb-2">لم نجد صيدليات مطابقة</h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              لم نتمكن من العثور على صيدليات مطابقة لبحثك الحالي. حاول استخدام كلمات بحث مختلفة أو تغيير خيارات الفلترة.
            </p>
            <button
              onClick={() => {
                setSelectedWilaya("all");
                setOnlyOpen(false);
                setOnlyDuty(false);
                fetchResults(1);
              }}
              className="px-6 py-3 bg-[#0EA96E] text-white font-semibold rounded-xl hover:bg-[#0A7A50] transition-colors text-sm"
            >
              إعادة ضبط الفلاتر والبحث
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#0EA96E] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
