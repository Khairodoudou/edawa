"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Clock,
  Pill,
  ArrowLeftRight,
  CreditCard,
  Receipt,
  BarChart3,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: any;
  badgeKey?: "pendingPharmacies";
}

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard/overview", label: "اللوحة العامة", icon: LayoutDashboard },
  { href: "/admin/dashboard/pharmacies", label: "إدارة الصيدليات", icon: Building2 },
  {
    href: "/admin/dashboard/pharmacies/pending",
    label: "طلبات التسجيل",
    icon: Clock,
    badgeKey: "pendingPharmacies",
  },
  { href: "/admin/dashboard/exchanges", label: "أرشيف تبادل الأدوية", icon: ArrowLeftRight },
  { href: "/admin/dashboard/medicines", label: "الكتالوج الوطني للأدوية", icon: Pill },
  { href: "/admin/dashboard/subscriptions", label: "إدارة الاشتراكات", icon: CreditCard },
  { href: "/admin/dashboard/payments", label: "المدفوعات والإيرادات", icon: Receipt },
  { href: "/admin/dashboard/statistics", label: "الإحصائيات الشاملة", icon: BarChart3 },
];

function AdminNavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  const [stats, setStats] = useState<{ pendingPharmacies?: number }>({});

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        if (json.success && json.data) {
          setStats(json.data);
        }
      } catch (e) {
        console.error("Failed to fetch admin stats badge", e);
      }
    }
    fetchStats();
  }, [pathname]);

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/admin/dashboard/overview" &&
            pathname.startsWith(item.href));

        const badgeCount = item.badgeKey ? stats[item.badgeKey] : undefined;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-xs transition-all ${
              isActive
                ? "bg-[#1A6EBD] text-white shadow-lg shadow-[#1A6EBD]/25"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
            </div>
            {badgeCount !== undefined && badgeCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black font-black text-[10px] animate-pulse">
                {badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        className={`fixed top-0 right-0 bottom-0 w-64 bg-[#0a1520] text-white z-50 transition-transform duration-300 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link
            href="/admin/dashboard/overview"
            className="flex items-center gap-2.5"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1A6EBD] flex items-center justify-center font-black text-white text-base shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-base tracking-wide block">
                دوائي <span className="text-[#1A6EBD] text-xs font-bold">Admin</span>
              </span>
              <span className="text-[10px] text-white/50 block">لوحة إدارة المنصة</span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation wrapped in Suspense */}
        <Suspense fallback={<div className="flex-1 p-4" />}>
          <AdminNavLinks onNavigate={() => setSidebarOpen(false)} />
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
            href="/"
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
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-[#1A6EBD] border border-blue-500/20 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              لوحة الإدارة المركزية
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 pl-2">
              <div className="w-8 h-8 rounded-full bg-[#1A6EBD] text-white font-bold flex items-center justify-center text-xs">
                م
              </div>
              <div className="text-right hidden sm:block">
                <span className="font-bold text-xs block leading-tight">
                  مدير المنصة
                </span>
                <span className="text-[10px] text-muted-foreground">
                  admin@gmail.com
                </span>
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
