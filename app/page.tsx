import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SearchBar from "@/components/shared/SearchBar";
import PharmacyCard from "@/components/shared/PharmacyCard";
import DownloadAppSection from "@/components/pwa/DownloadAppSection";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  ArrowLeft,
  TrendingUp,
  Shield,
  Clock,
  Star,
  ChevronLeft,
  Building2,
  Pill,
  Map,
  CheckCircle2,
  Users,
  Activity,
} from "lucide-react";
import {
  getCachedPharmacies,
  getCachedPlatformStats,
  getCachedTopSearchedMedicines,
  getCachedMedicineCategories,
} from "@/lib/cache";
import { testimonials } from "@/lib/mock-data";

export const metadata = {
  title: "دوائي — ابحث عن أدويتك في الصيدليات القريبة منك",
  description:
    "تطبيق ويب دوائي الرقمي يمكّنك من البحث عن الأدوية ومعرفة الصيدليات التي تتوفر فيها بالقرب منك في كل ولايات الجزائر.",
};

const steps = [
  {
    icon: Search,
    step: "01",
    title: "ابحث عن الدواء",
    desc: "اكتب اسم الدواء الذي تبحث عنه في خانة البحث. يدعم تطبيق الويب آلاف الأدوية المسجّلة في الجزائر.",
    color: "from-[#0EA96E] to-[#0A7A50]",
  },
  {
    icon: MapPin,
    step: "02",
    title: "اكتشف الصيدليات القريبة",
    desc: "ستظهر لك قائمة بالصيدليات التي تتوفر فيها الدواء مرتّبةً حسب قربها من موقعك الجغرافي.",
    color: "from-[#1A6EBD] to-[#114E8A]",
  },
  {
    icon: Clock,
    step: "03",
    title: "توجّه وتوفّر وقتك",
    desc: "اطّلع على موقع الصيدلية على الخريطة وأوقات عملها ورقم هاتفها، ثم انطلق مباشرةً.",
    color: "from-[#7C3AED] to-[#5B21B6]",
  },
];

const features = [
  {
    icon: Shield,
    title: "معلومات موثوقة",
    desc: "تحدّث الصيدليات مخزونها باستمرار لضمان دقة المعلومات التي تصلك.",
  },
  {
    icon: Map,
    title: "خريطة تفاعلية",
    desc: "عرض دقيق لمواقع الصيدليات على الخريطة مع إمكانية التنقل والتكبير.",
  },
  {
    icon: Clock,
    title: "صيدليات المناوبة",
    desc: "معرفة الصيدليات المفتوحة على مدار الساعة وفي أيام العطل.",
  },
  {
    icon: Activity,
    title: "بحث فوري",
    desc: "نتائج البحث تظهر فورياً من قاعدة بيانات محدّثة بشكل مستمر.",
  },
];

export default async function HomePage() {
  const allPharmacies = await getCachedPharmacies();
  const platformStats = await getCachedPlatformStats();
  const topSearchedMedicines = await getCachedTopSearchedMedicines();
  const medicineCategories = await getCachedMedicineCategories();
  const openPharmacies = allPharmacies.filter((p) => p.isOpen).slice(0, 3);

  return (
    <>
      <Navbar />

      {/* ======== HERO ======== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f2d20] via-[#0f1f30] to-[#0a1020] pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-[#0EA96E] blur-[120px]" />
          <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-[#1A6EBD] blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-[#0EA96E]/40 blur-[100px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle, #0EA96E 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0EA96E]/15 border border-[#0EA96E]/30 text-[#0EA96E] text-sm font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-[#0EA96E] pulse-green" />
            تطبيق ويب جزائري رقمي للصحة
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6">
            ابحث عن{" "}
            <span className="relative inline-block">
              <span className="gradient-text">دوائك</span>
              <svg
                className="absolute -bottom-2 right-0 left-0 w-full"
                height="8"
                viewBox="0 0 200 8"
                fill="none"
              >
                <path
                  d="M0 6 Q100 0 200 6"
                  stroke="#0EA96E"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>{" "}
            في ثوانٍ
          </h1>

          <p className="text-lg sm:text-xl text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed">
            دوائي تُمكّنك من معرفة الصيدليات التي يتوفر فيها الدواء الذي تبحث
            عنه، وتحديد أقربها إليك على الخريطة مباشرةً.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-10">
            <SearchBar size="lg" placeholder="ابحث عن اسم الدواء... (مثال: باراسيتامول)" />
          </div>

          {/* Quick Search Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
            <span className="text-white/40 text-sm">بحث سريع:</span>
            {["باراسيتامول", "أموكسيسيلين", "فيتامين D3", "إيبوبروفين", "ميتفورمين"].map(
              (med) => (
                <Link
                  key={med}
                  href={`/search?q=${encodeURIComponent(med)}`}
                  className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#0EA96E]/20 border border-white/15 hover:border-[#0EA96E]/40 text-white/70 hover:text-[#0EA96E] text-sm font-medium transition-all duration-200"
                >
                  {med}
                </Link>
              )
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: `+${platformStats.medicines.toLocaleString("ar-DZ")}`, label: "دواء مسجّل" },
              { value: `+${platformStats.pharmacies.toLocaleString("ar-DZ")}`, label: "صيدلية شريكة" },
              { value: `${platformStats.wilayas}`, label: "ولاية مغطّاة" },
              { value: `${platformStats.satisfactionRate}%`, label: "رضا المستخدمين" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-black/30 backdrop-blur-xl rounded-2xl p-5 border border-white/15 hover:border-[#0EA96E]/60 hover:bg-black/40 shadow-xl transition-all duration-300"
              >
                <div className="text-2xl sm:text-3xl font-black text-[#0EA96E] mb-1 drop-shadow-sm">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/80 font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30 animate-bounce">
          <span className="text-xs">اكتشف المزيد</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ======== HOW IT WORKS ======== */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[#0EA96E] font-bold text-sm uppercase tracking-widest mb-3 block">
              خطوات بسيطة
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4">
              كيف يعمل دوائي؟
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              في ثلاث خطوات بسيطة، اعثر على الدواء الذي تحتاجه في أقرب صيدلية إليك.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connecting Line (desktop) */}
            <div className="hidden md:block absolute top-12 right-[calc(33%+2rem)] left-[calc(33%+2rem)] h-0.5 bg-gradient-to-l from-[#0EA96E]/20 via-[#0EA96E]/50 to-[#0EA96E]/20" />

            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center text-center group">
                {/* Step Icon */}
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-2xl mb-6 group-hover:-translate-y-2 transition-transform duration-300`}>
                  <step.icon className="w-10 h-10 text-white" />
                </div>
                <span className={`absolute top-1 right-1/2 translate-x-1/2 text-xs font-black opacity-30 bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                  {step.step}
                </span>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-7">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-[#0EA96E] font-semibold hover:gap-3 transition-all"
            >
              اعرف أكثر عن تطبيق الويب
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======== CATEGORIES ======== */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">تصفّح حسب الفئة</h2>
            <p className="text-muted-foreground">ابحث بسرعة حسب نوع الدواء الذي تحتاجه</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {medicineCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/search?category=${encodeURIComponent(cat.name)}`}
                className="bg-card hover:bg-[#0EA96E]/5 border border-border hover:border-[#0EA96E]/30 rounded-2xl p-5 text-center transition-all duration-200 group hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <div className="font-bold text-sm mb-1">{cat.name}</div>
                <div className="text-xs text-muted-foreground">{cat.count} دواء</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ======== OPEN PHARMACIES ======== */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <span className="text-[#0EA96E] font-bold text-sm uppercase tracking-widest mb-2 block">
                الآن مفتوحة
              </span>
              <h2 className="text-3xl font-black">صيدليات متاحة</h2>
            </div>
            <Link
              href="/search"
              className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#0EA96E]/30 text-[#0EA96E] font-semibold hover:bg-[#0EA96E]/5 transition-all"
            >
              عرض الكل
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openPharmacies.map((ph) => (
              <PharmacyCard key={ph.id} pharmacy={ph} />
            ))}
          </div>
          <div className="sm:hidden mt-6 text-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#0EA96E]/30 text-[#0EA96E] font-semibold"
            >
              عرض جميع الصيدليات
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section className="py-20 bg-gradient-to-b from-muted/20 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">لماذا دوائي؟</h2>
            <p className="text-muted-foreground text-lg">ميزات مصمّمة لتوفير وقتك وجهدك</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-6 hover:border-[#0EA96E]/30 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0EA96E]/10 flex items-center justify-center mb-4 group-hover:bg-[#0EA96E] transition-colors">
                  <f.icon className="w-6 h-6 text-[#0EA96E] group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-6">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== TESTIMONIALS ======== */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black mb-3">ماذا يقول المستخدمون؟</h2>
            <p className="text-muted-foreground">آراء حقيقية من مستخدمي تطبيق الويب</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < t.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-7 flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0EA96E] to-[#1A6EBD] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role} — {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA PHARMACIST ======== */}
      <section className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-[#0f2d20] to-[#0f1f35] rounded-3xl overflow-hidden">
            {/* BG Blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0EA96E]/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1A6EBD]/20 rounded-full blur-[80px]" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center">
              {/* Image */}
              <div className="lg:w-2/5 w-full flex-shrink-0">
                <Image
                  src="/pharmacist-cta.png"
                  alt="صيدلاني دوائي"
                  width={480}
                  height={480}
                  className="w-full h-72 lg:h-full object-cover rounded-t-3xl lg:rounded-r-3xl lg:rounded-tl-none"
                />
              </div>

              {/* Text */}
              <div className="flex-1 p-10 sm:p-14 text-center lg:text-right">
                <div className="w-14 h-14 rounded-2xl bg-[#0EA96E]/20 border border-[#0EA96E]/30 flex items-center justify-center mx-auto lg:mr-0 lg:ml-auto mb-6">
                  <Building2 className="w-7 h-7 text-[#0EA96E]" />
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                  أنت صيدلاني؟
                </h2>
                <p className="text-white/65 text-base mb-6 leading-8">
                  انضم إلى تطبيق ويب دوائي وأدِر مخزونك بذكاء. اجعل صيدليتك مرئيةً لآلاف
                  المواطنين الباحثين عن الأدوية في منطقتك.
                </p>
                <div className="flex flex-col items-center lg:items-end gap-2 mb-8">
                  {[
                    "ظهور في نتائج البحث",
                    "إدارة المخزون",
                    "إحصائيات دقيقة",
                    "اشتراك 2000 دج/شهر",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-white/70 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-[#0EA96E]" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4">
                  <Link
                    href="/pharmacist/register"
                    className="px-8 py-4 bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-[#0EA96E]/30 hover:-translate-y-0.5 transition-all text-base"
                  >
                    سجّل صيدليتك الآن — مجاناً
                  </Link>
                  <Link
                    href="/pharmacist/login"
                    className="px-8 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-2xl border border-white/20 transition-all text-base"
                  >
                    دخول الصيدلي
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== DOWNLOAD APP (PWA) ======== */}
      <DownloadAppSection />

      <Footer />
    </>
  );
}
