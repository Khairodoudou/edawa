import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPharmacyByIdRealtime, getCachedPharmacyById, getCachedPharmacies } from "@/lib/cache";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Map,
} from "lucide-react";
import Link from "next/link";
import PharmacyDetailMap from "@/components/shared/PharmacyDetailMapWrapper";

const statusConfig = {
  available: {
    label: "متاح",
    icon: CheckCircle2,
    classes: "text-[#0EA96E] bg-[#0EA96E]/10",
  },
  limited: {
    label: "كمية محدودة",
    icon: AlertCircle,
    classes: "text-[#F59E0B] bg-[#F59E0B]/10",
  },
  unavailable: {
    label: "غير متاح",
    icon: XCircle,
    classes: "text-red-500 bg-red-500/10",
  },
};

interface Props {
  params: Promise<{ id: string }>;
}

// Allow blocking render at request-time for real-time stock data (Next.js 16)
export const instant = false;

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const pharmacy = await getCachedPharmacyById(id);
  return {
    title: pharmacy ? `${pharmacy.name} — دوائي` : "صيدلية — دوائي",
    description: pharmacy
      ? `معلومات ${pharmacy.name}: ${pharmacy.address}، ${pharmacy.city}. رقم الهاتف: ${pharmacy.phone}.`
      : "",
  };
}

export default async function PharmacyDetailPage({ params }: Props) {
  // Signal Next.js 16 to render at request time (required for real-time stock data)
  await connection();

  const { id } = await params;
  // Real-time fetch: no cache — stock quantities always reflect live DB state
  const pharmacy = await getPharmacyByIdRealtime(id);
  if (!pharmacy) notFound();

  const stockList = pharmacy.stock || [];
  const availableCount = stockList.filter(
    (s) => s.status === "available"
  ).length;

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-b from-[#0f2d20] to-[#0f1f30] pt-24 pb-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-white/50 text-sm mb-6">
            <Link href="/" className="hover:text-white transition-colors">
              الرئيسية
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/search" className="hover:text-white transition-colors">
              البحث عن الأدوية
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">{pharmacy.name}</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-3xl font-black text-white">
                  {pharmacy.name}
                </h1>
                {pharmacy.isOnDuty && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-sm font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    صيدلية مناوبة
                  </span>
                )}
                {pharmacy.isOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA96E]/20 border border-[#0EA96E]/30 text-[#0EA96E] text-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0EA96E] pulse-green" />
                    مفتوح الآن
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm font-semibold">
                    مغلق حالياً
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-white/60">
                <MapPin className="w-4 h-4" />
                <span>
                  {pharmacy.address}، {pharmacy.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Map */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center gap-2">
                <Map className="w-5 h-5 text-[#0EA96E]" />
                <h2 className="font-bold">الموقع على الخريطة</h2>
              </div>
              <PharmacyDetailMap
                lat={pharmacy.lat}
                lng={pharmacy.lng}
                name={pharmacy.name}
                wilaya={pharmacy.wilaya || pharmacy.city}
                city={pharmacy.city}
                address={pharmacy.address}
              />
              <div className="p-4">
                <a
                  href={`https://www.google.com/maps?q=${pharmacy.lat},${pharmacy.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#0EA96E]/10 text-[#0EA96E] font-semibold hover:bg-[#0EA96E]/20 transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  فتح في Google Maps
                </a>
              </div>
            </div>

            {/* Stock */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="font-bold">المخزون المتاح</h2>
                <span className="text-sm text-muted-foreground">
                  {availableCount} دواء متاح من {stockList.length}
                </span>
              </div>
              <div className="divide-y divide-border">
                {stockList.map((item) => {
                  const config = statusConfig[item.status];
                  const Icon = config.icon;
                  return (
                    <div
                      key={item.medicineId}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${config.classes} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{item.medicineName}</p>
                          {item.quantity !== undefined && item.quantity > 0 && (
                            <p className="text-xs text-muted-foreground">
                              الكمية المتوفرة: {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.classes}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h2 className="font-bold mb-4">معلومات الاتصال</h2>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0EA96E]/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#0EA96E]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">الهاتف</p>
                  <a
                    href={`tel:${pharmacy.phone}`}
                    className="font-bold hover:text-[#0EA96E] transition-colors"
                    dir="ltr"
                  >
                    {pharmacy.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0EA96E]/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#0EA96E]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">العنوان</p>
                  <p className="font-bold text-sm leading-5">{pharmacy.address}</p>
                  <p className="text-sm text-muted-foreground">{pharmacy.city}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#0EA96E]/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#0EA96E]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">أوقات العمل</p>
                  <div className="space-y-1 text-sm">
                    <p>{pharmacy.hoursDetail?.weekdays || pharmacy.hours || "08:00 — 20:00"}</p>
                    {pharmacy.hoursDetail?.saturday && (
                      <p className="text-muted-foreground">{pharmacy.hoursDetail.saturday}</p>
                    )}
                    {pharmacy.hoursDetail?.sunday && (
                      <p className="text-muted-foreground">{pharmacy.hoursDetail.sunday}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <a
                href={`tel:${pharmacy.phone}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-semibold hover:shadow-lg hover:shadow-[#0EA96E]/25 transition-all"
              >
                <Phone className="w-4 h-4" />
                اتصل بالصيدلية
              </a>
              <a
                href={`https://www.google.com/maps?q=${pharmacy.lat},${pharmacy.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[#0EA96E]/30 text-[#0EA96E] font-semibold hover:bg-[#0EA96E]/5 transition-all"
              >
                <MapPin className="w-4 h-4" />
                عرض على خرائط Google
              </a>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
