"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Pill,
  BarChart3,
  User,
  CreditCard,
  LogOut,
  Menu,
  X,
  Building2,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from "lucide-react";

const navItems: Array<{
  href: string;
  label: string;
  icon: React.ElementType;
  tag?: string;
}> = [
  { href: "/pharmacist/dashboard/overview", label: "اللوحة الرئيسية", icon: LayoutDashboard },
  { href: "/pharmacist/dashboard/stock", label: "إدارة المخزون", icon: Package },
  { href: "/pharmacist/dashboard/exchange", label: "تبادل الأدوية", icon: ArrowLeftRight, tag: "جديد" },
  { href: "/pharmacist/dashboard/medicines", label: "كتالوج الأدوية", icon: Pill },
  { href: "/pharmacist/dashboard/profile", label: "ملف الصيدلية", icon: User },
  { href: "/pharmacist/dashboard/subscription", label: "الاشتراك والمدفوعات", icon: CreditCard },
];

function PharmacistNavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/pharmacist/dashboard/overview" &&
            pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-xs transition-all ${
              isActive
                ? "bg-[#0EA96E] text-white shadow-lg shadow-[#0EA96E]/25"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
            </div>
            {item.tag && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 font-bold text-[10px]">
                {item.tag}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function PharmacistDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pharmacyData, setPharmacyData] = useState<{
    pharmacyName: string;
    city: string;
    wilaya: string;
    ownerName: string;
    status: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndLoadPharmacy() {
      try {
        const res = await fetch("/api/pharmacist/overview");
        const json = await res.json();
        if (json.success && json.data) {
          // Strict verification: Pharmacy must be ACTIVE 🟢
          if (json.data.status === "PENDING") {
            router.push("/pharmacist/pending");
            return;
          }
          setPharmacyData(json.data);
        }
      } catch (err) {
        console.error("Failed to load pharmacy overview in layout", err);
      }
    }
    checkAuthAndLoadPharmacy();
  }, [router]);

  return (
    <div
      className="min-h-screen bg-muted/20 flex text-foreground font-sans dir-rtl"
      dir="rtl"
    >
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-64 bg-[#0a1f16] text-white z-50 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link
            href="/pharmacist/dashboard/overview"
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#0EA96E] flex items-center justify-center font-black text-white text-base shadow-md">
              د
            </div>
            <div>
              <span className="font-black text-base tracking-wide block">
                دوائي <span className="text-[#0EA96E] text-xs font-bold">صيدلي</span>
              </span>
              <span className="text-[10px] text-white/50 block">لوحة إدارة الصيدلية</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Pharmacy Info Banner */}
        <div className="p-4 mx-3 my-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0EA96E]/20 text-[#0EA96E] flex items-center justify-center font-bold shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="font-bold text-xs text-white truncate">
              {pharmacyData?.pharmacyName || "صيدليتك"}
            </h4>
            <p className="text-[11px] text-white/50 truncate">
              {pharmacyData?.city ? `${pharmacyData.city} (${pharmacyData.wilaya})` : "الجزائر"}
            </p>
          </div>
        </div>

        {/* Navigation wrapped in Suspense */}
        <Suspense fallback={<div className="flex-1 p-4" />}>
          <PharmacistNavLinks onNavigate={() => setSidebarOpen(false)} />
        </Suspense>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              الذهاب للموقع العام
            </span>
          </Link>
          <Link
            href="/pharmacist/login"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:mr-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-border text-foreground hover:bg-muted"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-[#0EA96E] border border-emerald-500/20 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#0EA96E] animate-pulse" />
              صيدلية مفعّلة ونشطة 🟢
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 rounded-full bg-[#0EA96E] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {(pharmacyData?.ownerName || "ص")[0]}
              </div>
              <div className="text-right hidden sm:block">
                <span className="font-bold text-xs block leading-tight">
                  د. {pharmacyData?.ownerName || "الصيدلي المسؤول"}
                </span>
                <span className="text-[10px] text-muted-foreground">صيدلي شريك معتمد</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
