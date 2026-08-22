import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Clock, CheckCircle2, Mail, PhoneCall, ArrowRight } from "lucide-react";

export const metadata = {
  title: "طلبك قيد المراجعة — دوائي",
  description: "تم إرسال طلب تسجيل صيدليتك بنجاح. ستتلقى إشعاراً بمجرد مراجعة طلبك.",
};

const steps = [
  {
    icon: CheckCircle2,
    status: "done",
    title: "تم استلام الطلب",
    desc: "تم استلام معلومات صيدليتك بنجاح.",
  },
  {
    icon: Clock,
    status: "active",
    title: "مراجعة إدارية",
    desc: "يقوم فريق دوائي بمراجعة معلوماتك والتحقق منها. عادةً خلال 24 إلى 48 ساعة.",
  },
  {
    icon: Mail,
    status: "pending",
    title: "إشعار بالقرار",
    desc: "ستتلقى بريداً إلكترونياً يُعلمك بنتيجة المراجعة.",
  },
];

export default function PharmacistPendingPage() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-b from-[#E8FBF4]/60 via-background to-background pt-28 pb-20 flex flex-col justify-center items-center px-4 relative">
        <div className="w-full max-w-lg">
          {/* Success Banner */}
          <div className="bg-card border border-border rounded-3xl p-8 shadow-xl text-center mb-6">
            {/* Animated Check */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-[#0EA96E]/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#0EA96E] to-[#0A7A50] flex items-center justify-center shadow-xl shadow-[#0EA96E]/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-foreground mb-3">
              تم إرسال طلبك بنجاح! 🎉
            </h1>
            <p className="text-muted-foreground text-sm leading-7">
              تم استلام طلب تسجيل صيدليتك. سيتم مراجعة معلوماتك من طرف فريق دوائي
              وستتلقى إشعاراً على بريدك الإلكتروني بمجرد البتّ في الطلب.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="bg-card border border-border rounded-3xl p-6 shadow-xl mb-6">
            <h2 className="text-base font-black text-foreground mb-5 pb-2 border-b border-border">
              مراحل تفعيل الحساب
            </h2>
            <div className="relative">
              <div className="absolute top-5 bottom-5 right-5 w-0.5 bg-border" />
              <div className="space-y-6">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  const isDone = step.status === "done";
                  const isActive = step.status === "active";
                  return (
                    <div key={i} className="flex gap-4 relative">
                      <div className="relative z-10">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                            isDone
                              ? "bg-[#0EA96E] border-[#0EA96E] text-white"
                              : isActive
                              ? "bg-[#0EA96E]/15 border-[#0EA96E] animate-pulse"
                              : "bg-muted border-border"
                          }`}
                        >
                          <Icon
                            className={`w-5 h-5 ${
                              isDone
                                ? "text-white"
                                : isActive
                                ? "text-[#0EA96E]"
                                : "text-muted-foreground/40"
                            }`}
                          />
                        </div>
                      </div>
                      <div className="flex-1 pb-1">
                        <p
                          className={`font-bold text-sm mb-0.5 ${
                            isDone || isActive ? "text-foreground" : "text-muted-foreground/60"
                          }`}
                        >
                          {step.title}
                          {isActive && (
                            <span className="mr-2 px-2 py-0.5 rounded-full bg-[#0EA96E]/15 text-[#0EA96E] text-xs font-bold">
                              جارٍ
                            </span>
                          )}
                        </p>
                        <p
                          className={`text-xs leading-5 ${
                            isDone || isActive ? "text-muted-foreground" : "text-muted-foreground/50"
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#0EA96E]/10 border border-[#0EA96E]/30 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0EA96E] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm mb-1">مدة المراجعة المتوقعة</p>
                <p className="text-muted-foreground text-xs leading-5">
                  عادةً ما تتم مراجعة الطلبات خلال{" "}
                  <span className="text-foreground font-bold">24 إلى 48 ساعة</span> في أيام العمل.
                  إذا لم تتلقَّ ردّاً بعد 72 ساعة، يرجى التواصل معنا.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#0EA96E] text-white font-bold text-sm hover:bg-[#0A7A50] hover:shadow-lg transition-all"
            >
              <PhoneCall className="w-4 h-4" />
              تواصل معنا
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
