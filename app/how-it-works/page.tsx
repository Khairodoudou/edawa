import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Search, MapPin, Clock, ChevronLeft, CheckCircle2, Building2, Shield, BarChart3 } from "lucide-react";

export const metadata = {
  title: "كيف تعمل المنصة — دوائي",
  description:
    "تعرّف على كيفية عمل منصة دوائي: كيف يبحث المواطن عن الأدوية، وكيف يدير الصيدلاني مخزونه.",
};

const citizenSteps = [
  {
    icon: Search,
    step: "1",
    title: "ابحث عن الدواء",
    desc: "اكتب اسم الدواء في خانة البحث. تدعم المنصة الاسم التجاري والاسم العلمي (DCI) للدواء.",
    note: "مثال: باراسيتامول، Paracetamol",
  },
  {
    icon: MapPin,
    step: "2",
    title: "اكتشف الصيدليات القريبة",
    desc: "تُعرض قائمة بالصيدليات التي يتوفر فيها الدواء، مرتّبةً حسب قربها من موقعك الجغرافي.",
    note: "تظهر أيضاً الصيدليات المفتوحة وصيدليات المناوبة",
  },
  {
    icon: Clock,
    step: "3",
    title: "توجّه وتوفّر وقتك",
    desc: "اطّلع على الموقع الدقيق للصيدلية على الخريطة، أوقات عملها، ورقم هاتفها، ثم انطلق.",
    note: "لا يلزمك إنشاء حساب — الخدمة مجانية بالكامل للمواطن",
  },
];

const pharmacistSteps = [
  {
    icon: Building2,
    step: "1",
    title: "سجّل صيدليتك",
    desc: "أنشئ حساباً بمعلومات صيدليتك: الاسم، العنوان، أوقات العمل، وبيانات الاتصال.",
  },
  {
    icon: Shield,
    step: "2",
    title: "انتظر الموافقة الإدارية",
    desc: "تقوم إدارة المنصة بمراجعة معلوماتك والتحقق منها لضمان جودة الخدمة. عادةً خلال 48 ساعة.",
  },
  {
    icon: CheckCircle2,
    step: "3",
    title: "اختر الباقة وادفع",
    desc: "اشترك في الباقة الشهرية (2000 دج/شهر) لتفعيل حسابك والظهور في نتائج البحث.",
  },
  {
    icon: BarChart3,
    step: "4",
    title: "أدِر مخزونك",
    desc: "أضف الأدوية التي تتوفر لديك، حدّث حالة توفرها في الوقت الفعلي، واستفد من إحصائيات البحث.",
  },
];

const faqs = [
  {
    q: "هل البحث عن الأدوية مجاني؟",
    a: "نعم، البحث عن الأدوية وعرض الصيدليات وأماكنها مجاني تماماً للمواطن، دون أي رسوم أو اشتراك.",
  },
  {
    q: "هل يمكنني حجز الدواء مسبقاً؟",
    a: "في المرحلة الأولى، توفّر المنصة معلومات التوفر فقط. الحجز المسبق سيكون ميزة مستقبلية.",
  },
  {
    q: "كيف أعرف أن معلومات التوفر دقيقة؟",
    a: "يلتزم الصيدلانيون الشركاء بتحديث مخزونهم باستمرار، وهو شرط أساسي للبقاء في المنصة.",
  },
  {
    q: "كم يكلّف اشتراك الصيدلية؟",
    a: "الاشتراك الشهري للصيدلية هو 2000 دج (ألفي دينار جزائري)، يشمل جميع ميزات المنصة.",
  },
  {
    q: "هل تغطّي المنصة جميع ولايات الجزائر؟",
    a: "نهدف إلى تغطية جميع الولايات الـ 58. حالياً نعمل على توسيع شبكة الصيدليات الشريكة في كل المناطق.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0f2d20] to-[#0f1f30] pt-28 pb-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#0EA96E]/15 border border-[#0EA96E]/30 text-[#0EA96E] text-sm font-semibold mb-4">
            دليل الاستخدام
          </span>
          <h1 className="text-4xl font-black text-white mb-4">كيف تعمل منصة دوائي؟</h1>
          <p className="text-white/60 text-lg">
            دليل شامل لاستخدام المنصة سواء كنت مواطناً يبحث عن دواء أو صيدلانياً يريد الانضمام.
          </p>
        </div>
      </div>

      {/* Citizen Flow */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0EA96E]/10 text-[#0EA96E] font-bold text-sm mb-4">
              👤 للمواطن
            </div>
            <h2 className="text-3xl font-black mb-3">كيف تجد الدواء؟</h2>
            <p className="text-muted-foreground">3 خطوات بسيطة، بدون حساب، بدون تسجيل</p>
          </div>

          <div className="space-y-6">
            {citizenSteps.map((step, i) => (
              <div
                key={i}
                className="flex gap-6 bg-card border border-border rounded-2xl p-6 hover:border-[#0EA96E]/30 transition-colors"
              >
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0EA96E] to-[#0A7A50] flex items-center justify-center shadow-lg shadow-[#0EA96E]/20">
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-xs font-black flex items-center justify-center">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground mb-2 leading-7">{step.desc}</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0EA96E]/8 text-[#0EA96E] text-xs font-medium">
                    💡 {step.note}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/search"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-bold rounded-xl hover:shadow-lg hover:shadow-[#0EA96E]/25 transition-all"
            >
              <Search className="w-4 h-4" />
              ابدأ البحث الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Pharmacist Flow */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A6EBD]/10 text-[#1A6EBD] font-bold text-sm mb-4">
              💊 للصيدلاني
            </div>
            <h2 className="text-3xl font-black mb-3">كيف تنضم إلى المنصة؟</h2>
            <p className="text-muted-foreground">
              مسار تسجيل الصيدلية خطوةً بخطوة
            </p>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute top-0 bottom-0 right-[27px] w-0.5 bg-border" />
            <div className="space-y-8">
              {pharmacistSteps.map((step, i) => (
                <div key={i} className="flex gap-6 relative">
                  <div className="relative shrink-0 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A6EBD] to-[#114E8A] flex items-center justify-center shadow-lg">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-foreground text-background text-xs font-black flex items-center justify-center">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1 bg-card border border-border rounded-2xl p-5 hover:border-[#1A6EBD]/30 transition-colors">
                    <h3 className="font-bold mb-1.5">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-6">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/pharmacist/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-l from-[#1A6EBD] to-[#114E8A] text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              <Building2 className="w-4 h-4" />
              سجّل صيدليتك الآن
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">أسئلة شائعة</h2>
            <p className="text-muted-foreground">إجابات على أكثر الأسئلة تكراراً</p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6">
                <h3 className="font-bold mb-2 flex gap-2">
                  <span className="text-[#0EA96E]">؟</span>
                  {faq.q}
                </h3>
                <p className="text-muted-foreground text-sm leading-7 mr-5">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-muted-foreground text-sm mb-4">
              لم تجد إجابة على سؤالك؟
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-[#0EA96E] font-semibold hover:gap-3 transition-all"
            >
              تواصل مع فريقنا
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
