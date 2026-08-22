"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/dashboard/PageHeader";
import Pagination from "@/components/shared/Pagination";
import {
  Pill,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  Loader2,
  Package,
  ArrowRight,
  ExternalLink,
  Edit2,
} from "lucide-react";
import type { Medicine } from "@/lib/mock-data";
import type { PaginationMeta } from "@/lib/api-utils";

const CATEGORIES = [
  "مسكنات الألم",
  "مضادات حيوية",
  "مضادات الالتهاب",
  "فيتامينات ومكملات",
  "أدوية القلب والأوعية",
  "أدوية الجهاز الهضمي",
  "أدوية السكري",
  "أدوية الجهاز التنفسي",
  "أدوية الحساسية",
];

export default function PharmacistMedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [existingStock, setExistingStock] = useState<Record<string, { id: string; quantity: number }>>({});
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<string | null>(null);

  // Fetch current pharmacist's existing stock from DB
  const loadExistingStock = useCallback(async () => {
    try {
      const res = await fetch("/api/pharmacist/stock?limit=100", { cache: "no-store" });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        const map: Record<string, { id: string; quantity: number }> = {};
        json.data.forEach((item: any) => {
          if (item.medicineId) {
            map[item.medicineId] = { id: item.id, quantity: item.quantity };
          }
        });
        setExistingStock(map);
      }
    } catch (err) {
      console.error("Failed to load existing pharmacist stock", err);
    }
  }, []);

  const fetchMedicines = useCallback(
    async (page = 1, q = search, cat = selectedCategory) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "9",
        });
        if (q) params.append("search", q);
        if (cat !== "all") params.append("category", cat);

        const res = await fetch(`/api/medicines?${params.toString()}`, { cache: "no-store" });
        const json = await res.json();
        if (json.success) {
          setMedicines(json.data);
          if (json.meta) setMeta(json.meta);
        }
      } catch (err) {
        console.error("Failed to fetch catalog medicines", err);
      } finally {
        setLoading(false);
      }
    },
    [search, selectedCategory]
  );

  useEffect(() => {
    loadExistingStock();
  }, [loadExistingStock]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMedicines(1, search, selectedCategory);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, fetchMedicines]);

  const handleQuickAddToStock = async (med: Medicine) => {
    setAddingId(med.id);
    try {
      const res = await fetch("/api/pharmacist/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineId: med.id,
          name: med.name,
          genericName: med.genericName,
          category: med.category,
          form: med.form,
          dosage: med.dosage,
          quantity: 20,
          status: "available",
          expiryDate: "2027-12-31",
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setExistingStock((prev) => ({
          ...prev,
          [med.id]: { id: json.data.id, quantity: 20 },
        }));
      }
    } catch (err) {
      console.error("Failed to add to stock", err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="كتالوج الأدوية الوطني المعتمد"
          description="تصفح قائمة الأدوية المسجلة بقاعدة البيانات الوطنية وأضف ما يتوفر لديك إلى مخزون صيدليتك بنقرة واحدة"
        />

        <Link
          href="/pharmacist/dashboard/stock/add"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold rounded-xl text-xs shadow-md shadow-[#0EA96E]/20 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          إضافة مخصصة للمخزون
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-card border border-border rounded-3xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full lg:w-96">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم التجاري، الاسم العلمي (DCI)، أو المصنّع..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-background border border-border text-xs focus:outline-none focus:border-[#0EA96E] transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-muted-foreground shrink-0 ml-1" />
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === "all"
                ? "bg-[#0EA96E] text-white shadow-xs"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            جميع الفئات ({meta.total})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? "bg-[#0EA96E] text-white shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Catalog Cards */}
      {loading ? (
        <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-3xl">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0EA96E] mb-3" />
          جارٍ تحميل كتالوج الأدوية من قاعدة البيانات...
        </div>
      ) : medicines.length === 0 ? (
        <div className="p-16 text-center text-muted-foreground bg-card border border-border rounded-3xl space-y-2">
          <Pill className="w-10 h-10 mx-auto text-muted-foreground opacity-50" />
          <p className="font-bold text-sm text-foreground">لا توجد أدوية مطابقة للبحث</p>
          <p className="text-xs">جرب تغيير كلمات البحث أو اختيار فئة أخرى.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {medicines.map((med) => {
            const stockInfo = existingStock[med.id];
            const isAdded = !!stockInfo;
            const isAdding = addingId === med.id;

            return (
              <div
                key={med.id}
                className="bg-card border border-border rounded-3xl p-5 flex flex-col justify-between hover:border-[#0EA96E]/40 hover:shadow-lg transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#0EA96E]/10 text-[#0EA96E] flex items-center justify-center font-bold shrink-0">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-sm text-foreground truncate">{med.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{med.genericName}</p>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-muted text-foreground font-bold shrink-0 border border-border">
                      {med.dosage}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground border-t border-border pt-3">
                    <div className="flex justify-between">
                      <span>الفئة العلاجية:</span>
                      <span className="font-bold text-foreground">{med.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الشكل الصيدلاني:</span>
                      <span className="font-semibold text-foreground">{med.form}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المصنّع / المخبَر:</span>
                      <span className="font-semibold text-foreground">{med.manufacturer}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  {isAdded ? (
                    <div className="flex items-center justify-between p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#0EA96E]" />
                        متوفر بمخزونك ({stockInfo.quantity} علبة)
                      </span>
                      <Link
                        href={`/pharmacist/dashboard/stock/${stockInfo.id}/edit`}
                        className="p-1 rounded-lg bg-white/60 dark:bg-black/30 hover:bg-white text-foreground transition-colors"
                        title="تعديل الكمية"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuickAddToStock(med)}
                      disabled={isAdding}
                      className="w-full py-2.5 rounded-2xl bg-[#0EA96E] hover:bg-[#0A7A50] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جارٍ الإضافة للمخزون...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          إضافة سريعة لمخزوني (20 علبة)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && meta.totalPages > 1 && (
        <div className="bg-card border border-border rounded-3xl p-4">
          <Pagination
            meta={meta}
            onPageChange={(p) => fetchMedicines(p)}
          />
        </div>
      )}
    </div>
  );
}
