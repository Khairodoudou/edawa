import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaXTwitter } from "react-icons/fa6";



const footerLinks = {
  platform: {
    title: "المنصة",
    links: [
      { href: "/", label: "الرئيسية" },
      { href: "/search", label: "بحث عن دواء" },
      { href: "/map", label: "خريطة الصيدليات" },
      { href: "/how-it-works", label: "كيف تعمل المنصة" },
    ],
  },
  pharmacists: {
    title: "للصيدلانيين",
    links: [
      { href: "/pharmacist/register", label: "تسجيل الصيدلية" },
      { href: "/pharmacist/login", label: "دخول الصيدلي" },
      { href: "/pharmacist/subscription", label: "باقات الاشتراك" },
    ],
  },
  support: {
    title: "المساعدة",
    links: [
      { href: "/about", label: "حول المنصة" },
      { href: "/contact", label: "اتصل بنا" },
      { href: "/terms", label: "الشروط والأحكام" },
      { href: "/privacy", label: "سياسة الخصوصية" },
    ],
  },
};

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-[#0f1923] text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center group w-fit">
              <Image
                src="/logo.png"
                alt="دوائي"
                width={130}
                height={52}
                className="h-14 w-auto object-contain drop-shadow-lg brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300"
              />
            </Link>
            <p className="text-white/60 text-sm leading-7 max-w-xs">
              منصة رقمية ذكية تربط المواطنين الجزائريين بالصيدليات، لتسهيل الوصول إلى الأدوية في أسرع وقت ممكن وبأقل جهد.
            </p>
            {/* Social Media */}
            <div className="flex items-center gap-3">
              {[
                { icon: FaFacebookF, href: "#", label: "فيسبوك" },
                { icon: FaInstagram, href: "#", label: "انستغرام" },
                { icon: FaXTwitter, href: "#", label: "تويتر" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#0EA96E] flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <MapPin className="w-4 h-4 text-[#0EA96E] shrink-0" />
                <span>الجزائر العاصمة، الجزائر</span>
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-4 h-4 text-[#0EA96E] shrink-0" />
                <a href="mailto:contact@edawa.dz" className="hover:text-white transition-colors">
                  contact@edawa.dz
                </a>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-widest">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white/55 text-sm hover:text-[#0EA96E] transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-sm text-center">
            © {currentYear} دوائي. جميع الحقوق محفوظة.
          </p>
          <div className="flex items-center gap-1 text-white/40 text-sm">
            <span>صُنع بـ</span>
            <span className="text-[#0EA96E] text-base">♥</span>
            <span>في الجزائر</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
