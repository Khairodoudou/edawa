import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { Lock, Eye, Database, Shield, Mail, UserCheck } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية — دوائي",
  description: "تعرّف على كيفية جمع منصة دوائي للبيانات واستخدامها وحمايتها.",
};

const sections = [
  {
    icon: Database,
    title: "البيانات التي نجمعها",
    content: [
      {
        subtitle: "للمواطنين (بدون حساب)",
        items: [
          "بيانات الجلسة المؤقتة (مجهولة الهوية).",
          "الموقع الجغرافي التقريبي (إذا أذنت بذلك) لعرض الصيدليات القريبة.",
          "بيانات الاستخدام: طلبات البحث (بشكل مجمّع وغير شخصي).",
        ],
      },
      {
        subtitle: "للصيدلانيين (أصحاب الحسابات)",
        items: [
          "الاسم الكامل، عنوان البريد الإلكتروني، رقم الهاتف.",
          "معلومات الصيدلية: الاسم، العنوان، الموقع الجغرافي.",
          "معلومات المخزون التي تُدخلها يدوياً.",
          "بيانات المدفوعات (عبر بوابة دفع آمنة — لا نحتفظ بأرقام البطاقات).",
        ],
      },
    ],
  },
  {
    icon: Eye,
    title: "كيف نستخدم بياناتك",
    content: [
      {
        items: [
          "تقديم خدمة البحث عن الأدوية وعرض الصيدليات على الخريطة.",
          "إدارة حسابات الصيدليات وتقديم لوحة التحكم الخاصة بهم.",
          "تحسين أداء المنصة وتطوير ميزات جديدة.",
          "إرسال إشعارات تتعلق بحالة الحساب أو التحديثات المهمة.",
          "إعداد إحصائيات مجمّعة وغير شخصية عن استخدام المنصة.",
        ],
      },
    ],
  },
  {
    icon: Shield,
    title: "حماية بياناتك",
    content: [
      {
        items: [
          "تشفير جميع البيانات الحساسة باستخدام بروتوكول HTTPS/TLS.",
          "تشفير كلمات المرور باستخدام خوارزمية bcrypt.",
          "الوصول إلى البيانات مقيّد بالموظفين المخوّلين فقط.",
          "نسخ احتياطية منتظمة لضمان استمرارية الخدمة.",
          "لا نبيع بياناتك لأي طرف ثالث في أي حال من الأحوال.",
        ],
      },
    ],
  },
  {
    icon: UserCheck,
    title: "حقوقك",
    content: [
      {
        items: [
          "حق الاطلاع: طلب نسخة من بياناتك الشخصية المحفوظة لدينا.",
          "حق التصحيح: طلب تصحيح أي بيانات غير دقيقة.",
          "حق الحذف: طلب حذف حسابك وجميع بياناتك الشخصية.",
          "حق الاعتراض: الاعتراض على معالجة بياناتك لأغراض تسويقية.",
        ],
      },
    ],
  },
  {
    icon: Mail,
    title: "التواصل بشأن الخصوصية",
    content: [
      {
        items: [
          "لممارسة أي من حقوقك أو لأي استفسار متعلق بالخصوصية، راسلنا على: privacy@edawa.dz",
          "سنردّ على طلبك في غضون 30 يوم عمل.",
        ],
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-b from-[#0f2d20] to-[#0f1f30] pt-28 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#0EA96E]/20 border border-[#0EA96E]/30 flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#0EA96E]" />
            </div>
            <h1 className="text-3xl font-black text-white">سياسة الخصوصية</h1>
          </div>
          <p className="text-white/50 text-sm">آخر تحديث: أغسطس 2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#1A6EBD]/5 border border-[#1A6EBD]/20 rounded-2xl p-5 mb-10">
          <p className="text-sm leading-7">
            <span className="font-bold text-[#1A6EBD]">التزامنا بخصوصيتك: </span>
            نحن في دوائي نأخذ حماية بياناتك الشخصية على محمل الجد. تشرح هذه السياسة ما نجمعه وكيف نستخدمه وكيف نحميه.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[#0EA96E]/10 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-[#0EA96E]" />
                </div>
                <h2 className="text-lg font-black">{section.title}</h2>
              </div>

              <div className="space-y-4">
                {section.content.map((block, j) => (
                  <div key={j}>
                    {"subtitle" in block && block.subtitle && (
                      <h3 className="font-semibold text-sm mb-2 text-foreground/80">
                        {block.subtitle}
                      </h3>
                    )}
                    <ul className="space-y-2">
                      {block.items.map((item, k) => (
                        <li
                          key={k}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0EA96E] mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#0EA96E] text-white font-semibold text-sm hover:bg-[#0A7A50] transition-colors"
          >
            تواصل بشأن الخصوصية
          </Link>
          <Link
            href="/terms"
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors"
          >
            الشروط والأحكام
          </Link>
        </div>
      </div>

      <Footer />
    </>
  );
}
