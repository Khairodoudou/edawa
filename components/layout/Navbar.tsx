"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/search", label: "بحث عن دواء" },
  { href: "/map", label: "خريطة الصيدليات" },
  { href: "/#download-app", label: "تحميل التطبيق" },
  { href: "/how-it-works", label: "كيف يعمل تطبيق الويب" },
  { href: "/about", label: "حولنا" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-card/95 backdrop-blur-md border-b border-border shadow-xs transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center group py-1" aria-label="دوائي - الصفحة الرئيسية">
            <Image
              src="/logo.png"
              alt="شعار تطبيق ويب دوائي"
              width={180}
              height={72}
              className="h-12 sm:h-14 lg:h-[60px] w-auto object-contain drop-shadow-xs group-hover:scale-105 group-hover:drop-shadow-md transition-all duration-300"
              priority
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-[#0EA96E] bg-[#0EA96E]/10"
                    : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 right-1/2 translate-x-1/2 w-1 h-1 rounded-full bg-[#0EA96E]" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/pharmacist/login"
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-[#0EA96E] transition-colors"
            >
              دخول الصيدلي
            </Link>
            <Link
              href="/pharmacist/register"
              className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] rounded-xl hover:shadow-lg hover:shadow-[#0EA96E]/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              سجّل صيدليتك
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-foreground/5 transition-colors"
            aria-label="قائمة التنقل"
          >
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden glass rounded-2xl mb-4 overflow-hidden shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-2 py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive(link.href)
                      ? "text-[#0EA96E] bg-[#0EA96E]/10"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-border my-2" />
              <Link
                href="/pharmacist/login"
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-foreground/5 transition-all"
              >
                دخول الصيدلي
              </Link>
              <Link
                href="/pharmacist/register"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] transition-all"
              >
                سجّل صيدليتك مجاناً
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
