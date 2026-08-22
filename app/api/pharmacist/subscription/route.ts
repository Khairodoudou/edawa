import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { SubscriptionCreateSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const emailParam =
      url.searchParams.get("email") ||
      request.headers.get("x-user-email") ||
      request.cookies.get("edawa_user_email")?.value;

    let primaryPh = null;
    if (emailParam) {
      primaryPh = await prisma.pharmacy.findFirst({
        where: {
          OR: [{ email: emailParam }, { owner: { email: emailParam } }],
          status: "ACTIVE",
        },
        include: {
          subscription: true,
          wilaya: true,
          owner: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
      });
    }

    if (!primaryPh) {
      primaryPh = await prisma.pharmacy.findFirst({
        where: { status: "ACTIVE" },
        include: {
          subscription: true,
          wilaya: true,
          owner: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
      });
    }

    if (!primaryPh) {
      // Fallback to any registered pharmacy
      const anyPh = await prisma.pharmacy.findFirst({
        include: {
          subscription: true,
          wilaya: true,
          owner: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
      });
      if (!anyPh) return errorResponse("لا توجد صيدلية مسجلة", 404);
      return successResponse(formatPhSubscription(anyPh));
    }

    // Auto-ensure at least one payment record if subscription is active but payments table is empty
    if (primaryPh.subscription && (!primaryPh.payments || primaryPh.payments.length === 0)) {
      const isYearly = primaryPh.subscription.plan === "YEARLY";
      const createdPayment = await prisma.payment.create({
        data: {
          pharmacyId: primaryPh.id,
          amount: primaryPh.subscription.amount || (isYearly ? 19200 : 2000),
          period: isYearly ? "اشتراك سنوي (12 شهر)" : "اشتراك شهري (أوت 2026)",
          method: "BARIDIMOB",
          status: "PAID",
          transactionRef: `TX-${Date.now().toString().slice(-6)}`,
          paidAt: new Date(),
        },
      });
      primaryPh.payments = [createdPayment];
    }

    return successResponse(formatPhSubscription(primaryPh));
  } catch (err) {
    console.error("[Pharmacist Subscription GET Error]:", err);
    return errorResponse("حدث خطأ أثناء جلب بيانات الاشتراك", 500);
  }
}

function formatPhSubscription(ph: any) {
  const isYearly = ph.subscription?.plan === "YEARLY" || ph.subscription?.plan === "yearly";
  const now = new Date();
  const endDate = ph.subscription?.endDate ? new Date(ph.subscription.endDate) : null;
  const remainingDays = endDate ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

  const startDateFormatted = ph.subscription?.startDate
    ? new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long", year: "numeric" }).format(ph.subscription.startDate)
    : "—";

  const endDateFormatted = ph.subscription?.endDate
    ? new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long", year: "numeric" }).format(ph.subscription.endDate)
    : "—";

  const payments = (ph.payments || []).map((p: any) => ({
    id: p.transactionRef || p.id,
    rawId: p.id,
    amount: p.amount,
    period: p.period || (isYearly ? "اشتراك سنوي (12 شهر)" : "اشتراك شهري"),
    method:
      p.method === "BARIDIMOB"
        ? "BaridiMob"
        : p.method === "CIB"
        ? "CIB / الذهبية"
        : "تحويل بنكي",
    status: p.status?.toLowerCase() || "paid",
    date: new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long", year: "numeric" }).format(p.createdAt),
    paidAt: p.paidAt
      ? new Intl.DateTimeFormat("ar-DZ", { day: "numeric", month: "long", year: "numeric" }).format(p.paidAt)
      : undefined,
  }));

  return {
    pharmacyId: ph.id,
    pharmacyName: ph.name,
    ownerName: ph.owner?.name || "الصيدلي المسؤول",
    wilaya: ph.wilaya?.name || "الجزائر",
    city: ph.city || "",
    address: ph.address || "",
    phone: ph.phone || "",
    email: ph.email || ph.owner?.email || "",
    registrationNumber: ph.registrationNumber || "PH-DZ-2026",
    subscription: ph.subscription
      ? {
          id: ph.subscription.id,
          plan: isYearly ? "yearly" : "monthly",
          planName: isYearly ? "باقة الصيدلية السنوية" : "باقة الصيدلية الشهرية",
          planPriceText: isYearly ? "19,200 دج / سنوياً" : "2,000 دج / شهرياً",
          amount: ph.subscription.amount || (isYearly ? 19200 : 2000),
          startDate: startDateFormatted,
          endDate: endDateFormatted,
          remainingDays,
          status: ph.subscription.status?.toLowerCase() || "active",
          paymentMethod: payments[0]?.method || "BaridiMob",
        }
      : null,
    payments,
    plans: [
      {
        id: "monthly",
        name: "الاشتراك الشهري",
        price: 2000,
        period: "شهرياً",
        features: [
          "إدارة المخزون غير المحدود",
          "الظهور في نتائج البحث المتقدم والخريطة",
          "ميزة تبادل الأدوية بين الصيدليات",
          "إحصائيات وتقارير الزيارات",
          "دعم فني مباشر",
        ],
      },
      {
        id: "yearly",
        name: "الاشتراك السنوي (الأكثر توفيراً)",
        price: 19200,
        period: "سنوياً",
        badge: "وفّر 20%",
        features: [
          "جميع ميزات الباقة الشهرية",
          "خصم 20% (شهرين مجاناً)",
          "أولوية الظهور في نتائج البحث الأولى",
          "شارة صيدلية موثوقة ومميزة",
          "مدير حساب مخصص ودعم VIP",
        ],
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SubscriptionCreateSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { plan, paymentMethod, transactionRef } = parsed.data;

    const primaryPh = await prisma.pharmacy.findFirst({
      where: { status: "ACTIVE" },
    });
    if (!primaryPh) return errorResponse("لا توجد صيدلية", 404);

    const amount = plan === "yearly" ? 19200 : 2000;
    const durationDays = plan === "yearly" ? 365 : 30;

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const methodEnum =
      paymentMethod === "baridimob"
        ? "BARIDIMOB"
        : paymentMethod === "cib"
        ? "CIB"
        : "VIREMENT";

    // Create payment record & update subscription in transaction
    const [sub, payment] = await prisma.$transaction([
      prisma.subscription.upsert({
        where: { pharmacyId: primaryPh.id },
        update: {
          plan: plan === "yearly" ? "YEARLY" : "MONTHLY",
          startDate,
          endDate,
          status: "ACTIVE",
          amount,
        },
        create: {
          pharmacyId: primaryPh.id,
          plan: plan === "yearly" ? "YEARLY" : "MONTHLY",
          startDate,
          endDate,
          status: "ACTIVE",
          amount,
        },
      }),
      prisma.payment.create({
        data: {
          pharmacyId: primaryPh.id,
          amount,
          period: plan === "yearly" ? "اشتراك سنوي (12 شهر)" : "اشتراك شهري",
          method: methodEnum,
          status: "PAID",
          transactionRef,
          paidAt: new Date(),
        },
      }),
    ]);

    return successResponse(
      {
        message: "تم تجديد الاشتراك وتسجيل الدفعة بنجاح",
        subscription: sub,
        payment,
      },
      undefined,
      201
    );
  } catch {
    return errorResponse("حدث خطأ أثناء معالجة الاشتراك", 500);
  }
}
