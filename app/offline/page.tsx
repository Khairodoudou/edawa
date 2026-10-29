import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import Link from "next/link";
import { WifiOff, Home } from "lucide-react";
import RetryButton from "./RetryButton";

export const metadata = {
  title: "غير متصل — دوائي",
  description: "أنت غير متصل بالإنترنت حالياً",
};

export default function OfflinePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gradient-to-b from-[#E8FBF4]/40 via-background to-background pt-28 pb-20 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Icon */}
          <div className="relative mx-auto w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 animate-pulse" />
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-2 border-amber-500/30 flex items-center justify-center">
              <WifiOff className="w-12 h-12 text-amber-600" />
            </div>
          </div>

          {/* Logo */}
          <Image
            src="/logo.png"
            alt="دوائي"
            width={120}
            height={48}
            className="h-12 w-auto mx-auto object-contain opacity-60"
          />

          {/* Text */}
          <div className="space-y-3">
            <h1 className="text-3xl font-black text-foreground">
              غير متصل بالإنترنت
            </h1>
            <p className="text-muted-foreground leading-7">
              يبدو أنك فقدت الاتصال بالإنترنت. تحقق من اتصالك وحاول مرة
              أخرى. بعض الصفحات المحفوظة مسبقاً قد تكون متاحة.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <RetryButton />
            <Link
              href="/"
              className="flex items-center gap-2 px-6 py-3 bg-card border border-border text-foreground font-semibold rounded-2xl hover:bg-muted transition-all"
            >
              <Home className="w-4 h-4" />
              الصفحة الرئيسية
            </Link>
          </div>

          {/* Tips */}
          <div className="bg-card border border-border rounded-2xl p-6 text-right space-y-3">
            <h3 className="font-bold text-sm">💡 نصائح أثناء عدم الاتصال:</h3>
            <ul className="text-sm text-muted-foreground space-y-2 leading-7">
              <li>• الصفحات التي زرتها مؤخراً قد تكون متاحة</li>
              <li>• تحقق من إعدادات الواي فاي أو بيانات الهاتف</li>
              <li>• التطبيق سيعمل تلقائياً عند عودة الاتصال</li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
