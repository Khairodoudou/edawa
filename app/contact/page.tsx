"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, MessageSquare, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-b from-[#0f2d20] to-[#0f1f30] pt-28 pb-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#0EA96E]/15 border border-[#0EA96E]/30 text-[#0EA96E] text-sm font-semibold mb-4">
            تواصل معنا
          </span>
          <h1 className="text-4xl font-black text-white mb-4">نحن هنا للمساعدة</h1>
          <p className="text-white/60">
            لديك سؤال، اقتراح، أو مشكلة؟ راسلنا وسيردّ فريقنا خلال 24 ساعة.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              {
                icon: Mail,
                title: "البريد الإلكتروني",
                value: "contact@edawa.dz",
                href: "mailto:contact@edawa.dz",
              },
              {
                icon: Phone,
                title: "الهاتف",
                value: "+213 23 00 00 00",
                href: "tel:+21323000000",
              },
              {
                icon: MapPin,
                title: "العنوان",
                value: "الجزائر العاصمة، الجزائر",
                href: "#",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-5 flex gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0EA96E]/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-[#0EA96E]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{item.title}</p>
                  <a
                    href={item.href}
                    className="font-semibold text-sm hover:text-[#0EA96E] transition-colors"
                  >
                    {item.value}
                  </a>
                </div>
              </div>
            ))}

            <div className="bg-[#0EA96E]/5 border border-[#0EA96E]/20 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-4 h-4 text-[#0EA96E]" />
                <p className="font-bold text-sm">وقت الاستجابة</p>
              </div>
              <p className="text-muted-foreground text-sm">
                عادةً ما يردّ فريقنا خلال{" "}
                <span className="font-bold text-foreground">24 ساعة</span> في أيام العمل.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-[#0EA96E]/10 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-[#0EA96E]" />
                  </div>
                  <h3 className="text-xl font-black mb-2">تم إرسال رسالتك!</h3>
                  <p className="text-muted-foreground">
                    شكراً لتواصلك معنا. سيردّ فريقنا عليك في أقرب وقت ممكن.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-6 px-6 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-muted transition-colors"
                  >
                    إرسال رسالة أخرى
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-black mb-6">أرسل رسالتك</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold mb-1.5 block">الاسم الكامل *</label>
                      <input
                        required
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="اكتب اسمك..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#0EA96E]/30 focus:border-[#0EA96E] text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold mb-1.5 block">البريد الإلكتروني *</label>
                      <input
                        required
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="example@email.com"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#0EA96E]/30 focus:border-[#0EA96E] text-sm transition-all"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">الموضوع *</label>
                    <select
                      required
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#0EA96E]/30 focus:border-[#0EA96E] text-sm transition-all appearance-none"
                    >
                      <option value="">اختر موضوع الرسالة...</option>
                      <option>استفسار عام</option>
                      <option>مشكلة تقنية</option>
                      <option>اقتراح ميزة جديدة</option>
                      <option>تسجيل صيدلية</option>
                      <option>شكوى</option>
                      <option>شراكة</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-1.5 block">الرسالة *</label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="اكتب رسالتك بالتفصيل..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#0EA96E]/30 focus:border-[#0EA96E] text-sm transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-bold hover:shadow-lg hover:shadow-[#0EA96E]/25 transition-all text-sm"
                  >
                    <Send className="w-4 h-4" />
                    إرسال الرسالة
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
