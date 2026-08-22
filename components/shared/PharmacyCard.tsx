"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Clock, ChevronLeft, ShieldCheck, Pill, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import type { Pharmacy } from "@/lib/mock-data";

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  searchedMedicine?: string;
  compact?: boolean;
}

export default function PharmacyCard({
  pharmacy,
  searchedMedicine,
  compact = false,
}: PharmacyCardProps) {
  const normSearch = searchedMedicine ? searchedMedicine.toLowerCase().trim() : "";
  const relevantStock: any = normSearch && pharmacy.stock && pharmacy.stock.length > 0
    ? pharmacy.stock.find((s: any) =>
        s.medicineName.toLowerCase().includes(normSearch) ||
        (s.genericName && s.genericName.toLowerCase().includes(normSearch)) ||
        normSearch.includes(s.medicineName.toLowerCase())
      ) || pharmacy.stock[0]
    : pharmacy.stock?.[0] || null;

  const medInfo: any = relevantStock;

  const statusConfig: Record<string, any> = {
    available: {
      label: "متوفر حالياً",
      badgeClass: "bg-[#0EA96E]/15 text-[#0EA96E] border-[#0EA96E]/30",
      dotClass: "bg-[#0EA96E]",
      icon: CheckCircle2,
    },
    limited: {
      label: "كمية محدودة",
      badgeClass: "bg-amber-500/15 text-amber-600 border-amber-500/30",
      dotClass: "bg-amber-500",
      icon: AlertCircle,
    },
    unavailable: {
      label: "غير متوفر",
      badgeClass: "bg-red-500/15 text-red-500 border-red-500/30",
      dotClass: "bg-red-500",
      icon: XCircle,
    },
  };

  const currentStatus = (relevantStock && statusConfig[relevantStock.status]) || statusConfig.available;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="group bg-card border border-border hover:border-[#0EA96E]/40 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-[#0EA96E]/10 transition-all duration-300 flex flex-col h-full">
      {/* ==================== SECTION 1: MEDICINE INFO & IMAGE ==================== */}
      <div className="relative bg-gradient-to-br from-[#E8FBF4] via-muted/40 to-background p-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          {/* Medicine Image / Icon */}
          <div className="w-16 h-16 rounded-2xl bg-white border border-border/80 p-1.5 shadow-sm shrink-0 flex items-center justify-center overflow-hidden relative group-hover:scale-105 transition-transform">
            {medInfo?.image ? (
              <img
                src={medInfo.image}
                alt={relevantStock?.medicineName || "صورة الدواء"}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-[#0EA96E]/10 rounded-xl flex items-center justify-center">
                <Pill className="w-8 h-8 text-[#0EA96E]" />
              </div>
            )}
          </div>

          {/* Medicine Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-background px-2 py-0.5 rounded-md border border-border/50">
                {medInfo?.category || "دواء مسجّل"}
              </span>
              {/* Availability Status Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-xs font-bold ${currentStatus.badgeClass}`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {currentStatus.label}
              </span>
            </div>

            <h4 className="font-black text-base text-foreground truncate group-hover:text-[#0EA96E] transition-colors">
              {relevantStock?.medicineName || searchedMedicine || "دواء مسجّل"}
            </h4>

            {medInfo?.genericName && (
              <p className="text-xs text-muted-foreground truncate" dir="ltr">
                {medInfo.genericName} • {medInfo.dosage}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ==================== SECTION 2: PHARMACY INFO ==================== */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Pharmacy Name & Badges */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <Link
                  href={`/pharmacies/${pharmacy.id}`}
                  className="font-bold text-base text-foreground hover:text-[#0EA96E] transition-colors truncate block"
                >
                  {pharmacy.name}
                </Link>
                {pharmacy.isOnDuty && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[11px] font-bold shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                    مناوبة
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground text-xs">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-[#0EA96E]" />
                <span className="truncate">
                  {pharmacy.address}، <strong className="text-foreground font-semibold">{pharmacy.wilaya}</strong>
                </span>
              </div>
            </div>

            {/* Open / Closed Indicator */}
            <div className="shrink-0">
              {pharmacy.isOpen ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0EA96E]/10 text-[#0EA96E] border border-[#0EA96E]/20 text-xs font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0EA96E] pulse-green" />
                  مفتوح
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold">
                  مغلق
                </span>
              )}
            </div>
          </div>

          {/* Pharmacy Extra Info */}
          {!compact && (
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0EA96E] shrink-0" />
                <span className="truncate">{pharmacy.hours}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#0EA96E] shrink-0" />
                <span dir="ltr" className="font-semibold text-foreground truncate">
                  {pharmacy.phone}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Card Actions Footer */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          {/* Location badge */}
          <span className="text-xs font-semibold text-muted-foreground px-2 py-1 rounded-lg bg-muted/60">
            {pharmacy.city}
          </span>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <a
              href={`tel:${pharmacy.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="px-3 py-1.5 rounded-xl bg-[#0EA96E]/10 hover:bg-[#0EA96E] text-[#0EA96E] hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              اتصل
            </a>
            <Link
              href={`/pharmacies/${pharmacy.id}`}
              className="px-3 py-1.5 rounded-xl bg-foreground hover:bg-[#0EA96E] text-background hover:text-white text-xs font-bold transition-all flex items-center gap-1 group-hover:bg-[#0EA96E]"
            >
              التفاصيل
              <ChevronLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
