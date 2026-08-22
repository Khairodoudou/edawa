import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "دوائي — منصة البحث عن الأدوية في الجزائر",
  description:
    "ابحث عن الأدوية في الصيدليات القريبة منك. منصة دوائي تربط المواطنين بالصيدليات لتسهيل الوصول إلى الأدوية بسرعة وسهولة.",
  keywords: ["أدوية", "صيدلية", "الجزائر", "بحث عن دواء", "صيدليات قريبة"],
  openGraph: {
    title: "دوائي — منصة البحث عن الأدوية",
    description: "ابحث عن الأدوية في الصيدليات القريبة منك بسرعة وسهولة",
    locale: "ar_DZ",
    type: "website",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
