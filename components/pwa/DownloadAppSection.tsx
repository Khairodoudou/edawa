"use client";

import { usePWA } from "@/lib/hooks/use-pwa";
import Image from "next/image";
import {
  Download,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  Bell,
  Zap,
  CheckCircle2,
  Share,
  PlusSquare,
  MoreVertical,
  X,
} from "lucide-react";
import { useState, useCallback } from "react";

const pwaFeatures = [
  {
    icon: Zap,
    title: "سريع وخفيف",
    desc: "يعمل مثل التطبيقات الأصلية بسرعة فائقة",
  },
  {
    icon: WifiOff,
    title: "يعمل بدون إنترنت",
    desc: "تصفّح الصفحات المحفوظة حتى بدون اتصال",
  },
  {
    icon: Bell,
    title: "إشعارات فورية",
    desc: "احصل على آخر التحديثات والتنبيهات مباشرة",
  },
  {
    icon: Download,
    title: "لا حاجة لمتجر",
    desc: "ثبّت مباشرة من المتصفح بدون تحميل",
  },
];

export default function DownloadAppSection() {
  const { isInstalled, platform, installApp } = usePWA();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInstall = useCallback(async () => {
    if (isInstalled) return;
    setLoading(true);

    try {
      const installed = await installApp();
      if (installed) {
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Install prompt failed:", e);
    }

    setLoading(false);
    // If native prompt wasn't triggered, show the modal guide
    setShowModal(true);
  }, [installApp, isInstalled]);

  return (
    <section id="download-app" className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f2d20] via-[#0f1f30] to-[#0a1020]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-1/4 w-80 h-80 rounded-full bg-[#0EA96E] blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-[#1A6EBD] blur-[120px]" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0EA96E 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* ── Left: Phone Mockup ── */}
          <div className="order-2 lg:order-1 flex justify-center">
            <div className="relative">
              {/* Phone frame */}
              <div className="relative w-[280px] sm:w-[300px] mx-auto">
                {/* Glow effect */}
                <div className="absolute -inset-8 bg-gradient-to-br from-[#0EA96E]/20 to-[#1A6EBD]/20 rounded-[3rem] blur-2xl" />

                {/* Phone body */}
                <div className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-[2.5rem] p-2 shadow-2xl shadow-black/50 border border-white/10">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-20" />

                  {/* Screen */}
                  <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-b from-[#0f2d20] to-[#0f1f30] aspect-[9/18]">
                    {/* Status bar */}
                    <div className="flex items-center justify-between px-6 pt-8 pb-2">
                      <span className="text-white/60 text-[10px] font-bold">
                        9:41
                      </span>
                      <div className="flex items-center gap-1">
                        <Wifi className="w-3 h-3 text-white/60" />
                        <div className="w-6 h-2.5 rounded-sm border border-white/60 p-px">
                          <div className="h-full w-3/4 bg-[#0EA96E] rounded-[1px]" />
                        </div>
                      </div>
                    </div>

                    {/* App content mockup */}
                    <div className="px-5 pt-4 space-y-4">
                      {/* App logo */}
                      <div className="flex justify-center">
                        <Image
                          src="/logo.png"
                          alt="دوائي"
                          width={100}
                          height={40}
                          className="h-10 w-auto object-contain brightness-0 invert"
                        />
                      </div>

                      {/* Search bar mockup */}
                      <div className="bg-white/10 rounded-xl px-3 py-2.5 flex items-center gap-2 border border-white/10">
                        <div className="w-4 h-4 rounded-full bg-[#0EA96E]/30" />
                        <span className="text-white/30 text-[10px]">
                          ابحث عن دواء...
                        </span>
                      </div>

                      {/* Cards mockup */}
                      <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="bg-white/5 rounded-xl p-3 border border-white/5"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-[#0EA96E]/20" />
                              <div className="flex-1 space-y-1">
                                <div
                                  className="h-2 bg-white/20 rounded-full"
                                  style={{ width: `${70 - i * 10}%` }}
                                />
                                <div
                                  className="h-1.5 bg-white/10 rounded-full"
                                  style={{ width: `${50 - i * 5}%` }}
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-[#0EA96E]" />
                              <span className="text-[8px] text-[#0EA96E]/70">
                                متوفر
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom nav mockup */}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-xl border-t border-white/5 px-6 py-3">
                      <div className="flex items-center justify-between">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center gap-1"
                          >
                            <div
                              className={`w-5 h-5 rounded-md ${
                                i === 1 ? "bg-[#0EA96E]" : "bg-white/15"
                              }`}
                            />
                            <div className="h-1 w-4 bg-white/10 rounded-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -right-6 top-1/4 bg-card border border-border rounded-2xl p-3 shadow-xl animate-float-slow hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#0EA96E]/10 flex items-center justify-center">
                      <Download className="w-4 h-4 text-[#0EA96E]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-foreground">
                        مجاني
                      </div>
                      <div className="text-[8px] text-muted-foreground">
                        بدون متجر
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute -left-4 bottom-1/3 bg-card border border-border rounded-2xl p-3 shadow-xl animate-float-delayed hidden sm:block">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#1A6EBD]/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#1A6EBD]" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-foreground">
                        فوري
                      </div>
                      <div className="text-[8px] text-muted-foreground">
                        أقل من 1 ثانية
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Content ── */}
          <div className="order-1 lg:order-2 text-center lg:text-right">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0EA96E]/15 border border-[#0EA96E]/30 text-[#0EA96E] text-sm font-semibold mb-6">
              <Smartphone className="w-4 h-4" />
              تطبيق ويب تقدمي (PWA)
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
              ثبّت <span className="gradient-text">دوائي</span>
              <br />
              على جهازك
            </h2>

            <p className="text-white/60 text-base sm:text-lg leading-8 mb-8 max-w-lg lg:mr-0 lg:ml-auto mx-auto">
              استمتع بتجربة أسرع وأسهل من خلال تثبيت دوائي على هاتفك أو جهازك. افتح
              التطبيق مباشرة من الشاشة الرئيسية دون الحاجة إلى البحث عنه في
              المتصفح.
            </p>

            {/* Features grid */}
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-md lg:mr-0 lg:ml-auto mx-auto">
              {pwaFeatures.map((f) => (
                <div
                  key={f.title}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 text-right hover:bg-white/8 hover:border-[#0EA96E]/30 transition-all duration-300"
                >
                  <f.icon className="w-5 h-5 text-[#0EA96E] mb-2" />
                  <div className="text-white text-xs font-bold mb-0.5">
                    {f.title}
                  </div>
                  <div className="text-white/40 text-[10px] leading-4">
                    {f.desc}
                  </div>
                </div>
              ))}
            </div>

            {/* Install CTA */}
            <div className="space-y-3 max-w-md lg:mr-0 lg:ml-auto mx-auto">
              {isInstalled ? (
                /* ── Already Installed Button ── */
                <button
                  type="button"
                  disabled
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-emerald-950/40 text-emerald-400 font-bold rounded-2xl text-base border-2 border-emerald-500/30 cursor-default"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>التطبيق مثبت على جهازك</span>
                </button>
              ) : (
                /* ── Install Button ── */
                <button
                  type="button"
                  onClick={handleInstall}
                  disabled={loading}
                  className="w-full relative inline-flex items-center justify-center gap-3 px-8 py-4.5 bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white text-base font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-[#0EA96E]/30 active:scale-[0.98] transition-all duration-300 cursor-pointer group"
                >
                  <Download
                    className={`w-5 h-5 shrink-0 ${
                      loading ? "animate-spin" : "group-hover:animate-bounce"
                    }`}
                  />
                  <span>تثبيت التطبيق</span>
                </button>
              )}

              <p className="text-xs text-white/40 text-center max-w-sm mx-auto font-normal">
                متاح على الأجهزة والمتصفحات التي تدعم تثبيت تطبيقات الويب.
              </p>

              {/* Platform icons */}
              <div className="flex items-center justify-center gap-4 text-white/30 pt-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <Smartphone className="w-3.5 h-3.5" />
                  Android & iOS
                </div>
                <span className="text-white/15">|</span>
                <div className="flex items-center gap-1.5 text-xs">
                  <Monitor className="w-3.5 h-3.5" />
                  Windows & Mac
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Guide (like ToumAnina) ── */}
      {showModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#0f1f1a] border border-[#0EA96E]/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-right"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 left-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-[#0EA96E]/15 border border-[#0EA96E]/30 flex items-center justify-center mx-auto mb-3">
                <Download className="w-7 h-7 text-[#0EA96E]" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                كيفية تثبيت تطبيق دوائي
              </h3>
              <p className="text-xs text-white/60">
                اتبع هذه الخطوات البسيطة لإضافة دوائي إلى شاشتك الرئيسية :
              </p>
            </div>

            {/* Instructions per platform */}
            <div className="space-y-4">
              {platform === "ios" ? (
                <div className="space-y-3">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2 text-[#0EA96E]">
                    <Smartphone className="w-4 h-4" />
                    على أجهزة iPhone / iPad (متصفح Safari)
                  </h4>
                  {[
                    {
                      step: "1",
                      icon: Share,
                      text: "اضغط على زر المشاركة في شريط المتصفح.",
                    },
                    {
                      step: "2",
                      icon: PlusSquare,
                      text: "مرر للأسفل واختر «إضافة إلى الشاشة الرئيسية».",
                    },
                    {
                      step: "3",
                      icon: CheckCircle2,
                      text: "اضغط على «إضافة» في الزاوية العلوية.",
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0EA96E]/20 text-[#0EA96E] font-bold text-xs flex items-center justify-center shrink-0">
                        {s.step}
                      </div>
                      <span className="text-white/80 text-xs font-medium">
                        {s.text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : platform === "android" ? (
                <div className="space-y-3">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2 text-[#0EA96E]">
                    <Smartphone className="w-4 h-4" />
                    على أجهزة Android (متصفح Chrome / Edge)
                  </h4>
                  {[
                    {
                      step: "1",
                      icon: MoreVertical,
                      text: "افتح قائمة المتصفح (النقاط الثلاث في الأعلى).",
                    },
                    {
                      step: "2",
                      icon: Download,
                      text: "اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».",
                    },
                    {
                      step: "3",
                      icon: CheckCircle2,
                      text: "أكّد التثبيت ليظهر التطبيق في شاشتك الرئيسية.",
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0EA96E]/20 text-[#0EA96E] font-bold text-xs flex items-center justify-center shrink-0">
                        {s.step}
                      </div>
                      <span className="text-white/80 text-xs font-medium">
                        {s.text}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="text-white font-bold text-xs flex items-center gap-2 text-[#0EA96E]">
                    <Monitor className="w-4 h-4" />
                    على الحاسوب (متصفح Chrome / Edge / Brave)
                  </h4>
                  {[
                    {
                      step: "1",
                      icon: Monitor,
                      text: "انقر على أيقونة التثبيت (🖥️ أو ⊕) في شريط عنوان المتصفح في الأعلى.",
                    },
                    {
                      step: "2",
                      icon: Download,
                      text: "أو افتح قائمة المتصفح (النقاط الثلاث ⋮) واختر «تثبيت دوائي...».",
                    },
                    {
                      step: "3",
                      icon: CheckCircle2,
                      text: "اضغط على «تثبيت» (Install) وسيظهر فوراً على سطح المكتب!",
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/5"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#0EA96E]/20 text-[#0EA96E] font-bold text-xs flex items-center justify-center shrink-0">
                        {s.step}
                      </div>
                      <span className="text-white/80 text-xs font-medium">
                        {s.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Button */}
            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 py-3 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-all"
            >
              حسناً، فهمت
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
