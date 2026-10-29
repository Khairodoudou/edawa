import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import Image from "next/image";
import { Users, Target, Eye, Heart, Building2, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "حول دوائي — تطبيق الويب الجزائري للبحث عن الأدوية",
  description:
    "اكتشف رسالة وقيم تطبيق ويب دوائي الرقمي الذي يهدف إلى تسهيل الوصول إلى الأدوية في الجزائر.",
};

const values = [
  {
    icon: Heart,
    title: "في خدمة المواطن",
    desc: "صُمّمت كل ميزة في تطبيق الويب لتوفير تجربة سلسة وسريعة للمواطن الباحث عن دوائه.",
  },
  {
    icon: CheckCircle2,
    title: "معلومات دقيقة وموثوقة",
    desc: "يحرص الصيدلانيون الشركاء على تحديث مخزونهم باستمرار لضمان أقصى درجات الدقة.",
  },
  {
    icon: Users,
    title: "مجتمع صحي متكامل",
    desc: "نهدف إلى بناء شبكة رقمية تجمع المواطنين والصيدليات والفاعلين الصحيين في منظومة واحدة.",
  },
  {
    icon: Eye,
    title: "الشفافية والوضوح",
    desc: "معلومات واضحة وشاملة عن كل صيدلية: الموقع، الهاتف، الأوقات، والمخزون.",
  },
];

const team = [
  { name: "فريق التطوير", role: "تطوير وهندسة تطبيق الويب", avatar: "ت", color: "from-[#0EA96E] to-[#0A7A50]" },
  { name: "فريق التصميم", role: "تصميم تجربة المستخدم", avatar: "ص", color: "from-[#1A6EBD] to-[#114E8A]" },
  { name: "الشراكات الصيدلانية", role: "إدارة علاقات الصيدليات", avatar: "ش", color: "from-[#7C3AED] to-[#5B21B6]" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-b from-[#0f2d20] to-[#0f1f30] pt-28 pb-0 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#0EA96E]/15 border border-[#0EA96E]/30 text-[#0EA96E] text-sm font-semibold mb-6">
              من نحن
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
              رسالتنا: تسهيل الوصول{" "}
              <span className="gradient-text">إلى الدواء</span>
            </h1>
            <p className="text-white/60 text-lg leading-8 max-w-2xl mx-auto">
              دوائي تطبيق ويب رقمي جزائري يربط المواطنين بالصيدليات. نؤمن بأن الوصول إلى
              الدواء في الوقت المناسب حق أساسي لكل مواطن.
            </p>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
            <Image
              src="/about-hero.png"
              alt="شبكة صيدليات دوائي في الجزائر"
              width={1024}
              height={420}
              className="w-full h-72 sm:h-96 object-cover rounded-t-3xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Target,
                color: "bg-[#0EA96E]/10 text-[#0EA96E]",
                title: "مهمّتنا",
                text: "توفير تطبيق ويب رقمي ذكي يمكّن كل جزائري من معرفة الصيدليات التي يتوفر فيها الدواء الذي يحتاجه، في أقرب وقت ممكن، بأقل جهد ممكن.",
              },
              {
                icon: Eye,
                color: "bg-[#1A6EBD]/10 text-[#1A6EBD]",
                title: "رؤيتنا",
                text: "أن تصبح دوائي المرجع الأول في قطاع الصحة الرقمية بالجزائر، وأن تنتقل من تطبيق ويب للبحث عن الأدوية إلى منظومة صحية رقمية متكاملة.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-8"
              >
                <div className={`w-14 h-14 rounded-2xl ${item.color} flex items-center justify-center mb-5`}>
                  <item.icon className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-black mb-3">{item.title}</h2>
                <p className="text-muted-foreground leading-7">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-3">قيمنا</h2>
            <p className="text-muted-foreground">المبادئ التي تحكم كل قرار نتخذه</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#0EA96E]/10 flex items-center justify-center shrink-0">
                  <v.icon className="w-6 h-6 text-[#0EA96E]" />
                </div>
                <div>
                  <h3 className="font-bold mb-1.5">{v.title}</h3>
                  <p className="text-muted-foreground text-sm leading-6">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#0f2d20] to-[#0f1f35] rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-black text-white mb-10">تطبيق الويب بالأرقام</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { value: "+2847", label: "دواء مسجّل" },
                { value: "+1423", label: "صيدلية شريكة" },
                { value: "69", label: "ولاية مغطّاة" },
                { value: "97%", label: "رضا المستخدمين" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-black text-[#0EA96E] mb-1">{stat.value}</div>
                  <div className="text-white/60 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team with image */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-10 items-center">
            {/* Community Illustration */}
            <div className="lg:w-2/5 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 bg-[#0EA96E]/10 rounded-3xl blur-2xl" />
                <Image
                  src="/about-team.png"
                  alt="مجتمع دوائي"
                  width={480}
                  height={400}
                  className="relative rounded-3xl w-full object-cover shadow-xl"
                />
              </div>
            </div>

            {/* Team Cards */}
            <div className="flex-1">
              <div className="mb-8">
                <h2 className="text-3xl font-black mb-3">فريق دوائي</h2>
                <p className="text-muted-foreground">أشخاص متحمّسون يعملون على تطوير تطبيق الويب</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {team.map((member, i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-5 text-center hover:border-[#0EA96E]/30 hover:shadow-md transition-all">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${member.color} flex items-center justify-center mx-auto mb-3 text-white font-black text-xl`}
                    >
                      {member.avatar}
                    </div>
                    <h3 className="font-bold text-sm">{member.name}</h3>
                    <p className="text-muted-foreground text-xs mt-1">{member.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-black mb-4">هل أنت صيدلاني؟</h2>
          <p className="text-muted-foreground mb-6">
            انضم إلى شبكة دوائي وساهم في تسهيل الوصول إلى الأدوية في منطقتك.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pharmacist/register"
              className="px-8 py-3 bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-bold rounded-xl hover:shadow-lg transition-all"
            >
              سجّل صيدليتك
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-border rounded-xl font-semibold hover:bg-muted transition-all"
            >
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
