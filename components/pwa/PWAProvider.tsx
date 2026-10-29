"use client";

import { usePWA } from "@/lib/hooks/use-pwa";
import { RefreshCw, WifiOff, X } from "lucide-react";
import { useState } from "react";

export default function PWAProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { hasUpdate, isOnline, applyUpdate, dismissUpdate } = usePWA();
  const [showOffline, setShowOffline] = useState(true);

  return (
    <>
      {children}

      {/* ── Update Banner ── */}
      {hasUpdate && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100] animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-card border border-[#0EA96E]/30 rounded-2xl p-4 shadow-2xl shadow-black/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#0EA96E]/10 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-[#0EA96E]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-foreground mb-1">
                  تحديث جديد متوفر ✨
                </p>
                <p className="text-xs text-muted-foreground leading-5">
                  يتوفر إصدار جديد من دوائي. حدّث الآن للحصول على أحدث الميزات.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={applyUpdate}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    تحديث الآن
                  </button>
                  <button
                    onClick={dismissUpdate}
                    className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    لاحقاً
                  </button>
                </div>
              </div>
              <button
                onClick={dismissUpdate}
                className="p-1 rounded-lg hover:bg-muted text-muted-foreground shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Offline Banner ── */}
      {!isOnline && showOffline && (
        <div className="fixed top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-amber-500/95 backdrop-blur-md text-white px-4 py-2.5">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 shrink-0" />
                <span className="text-xs sm:text-sm font-bold">
                  أنت غير متصل بالإنترنت — يتم عرض المحتوى المحفوظ مسبقاً
                </span>
              </div>
              <button
                onClick={() => setShowOffline(false)}
                className="p-1 rounded-lg hover:bg-white/20 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
