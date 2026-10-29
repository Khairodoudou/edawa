import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import PWAProvider from "@/components/pwa/PWAProvider";

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "دوائي",
    startupImage: "/icons/icon-512x512.png",
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    title: "دوائي — منصة البحث عن الأدوية",
    description: "ابحث عن الأدوية في الصيدليات القريبة منك بسرعة وسهولة",
    locale: "ar_DZ",
    type: "website",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA96E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icons/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-96x96.png"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.__deferredInstallPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__deferredInstallPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-prompt-available'));
              });
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function() {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground antialiased">
        <PWAProvider>{children}</PWAProvider>
      </body>
    </html>
  );
}
