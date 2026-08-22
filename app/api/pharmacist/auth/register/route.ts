import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";
import { revalidateTag } from "next/cache";
import { z } from "zod";
import { getAlgeriaCoordinates } from "@/lib/algeria-coordinates";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

const PharmacyRegistrationSchema = z.object({
  // Personal / Manager Info
  ownerName: z.string().min(2, "الاسم يجب أن يكون حرفين على الأقل").optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  phone: z.string().min(8, "رقم الهاتف غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),

  // Pharmacy Info
  pharmacyName: z.string().min(2, "اسم الصيدلية مطلوب"),
  registrationNumber: z.string().min(2, "رقم الاعتماد أو التسجيل مطلوب"),
  wilaya: z.string().min(1, "الولاية مطلوبة"),
  city: z.string().min(1, "المدينة أو البلدية مطلوبة"),
  address: z.string().min(3, "العنوان مطلوب"),

  // Hours & Location (Optional)
  openTime: z.string().optional(),
  closeTime: z.string().optional(),
  openDays: z.string().optional(),
  isOnDuty: z.boolean().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),

  // Plan
  plan: z.enum(["monthly", "yearly"]).default("monthly"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = PharmacyRegistrationSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const data = parsed.data;

    const resolvedOwnerName =
      data.ownerName?.trim() ||
      [data.firstName, data.lastName].filter(Boolean).join(" ").trim() ||
      "صيدلي مسؤول";

    // 1. Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existingUser) {
      return errorResponse("البريد الإلكتروني مسجل مسبقاً في النظام", 409);
    }

    // 2. Check existing pharmacy registration number
    const existingPh = await prisma.pharmacy.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });
    if (existingPh) {
      return errorResponse("رقم الاعتماد / التسجيل مستخدم بالفعل", 409);
    }

    // 3. Resolve or create Wilaya
    let wilayaRec = await prisma.wilaya.findFirst({
      where: {
        OR: [
          { name: data.wilaya },
          { name: { contains: data.wilaya } },
        ],
      },
    });

    if (!wilayaRec) {
      const maxCode = await prisma.wilaya.aggregate({ _max: { code: true } });
      const nextCode = (maxCode._max.code || 0) + 1;
      wilayaRec = await prisma.wilaya.create({
        data: {
          code: nextCode,
          name: data.wilaya,
        },
      });
    }

    // 4. Working hours & location formatting
    const openTime = data.openTime || "08:00";
    const closeTime = data.closeTime || "21:00";
    const openDays = data.openDays || "السبت — الخميس";
    const hours = `${openTime} — ${closeTime}`;
    const hoursWeekdays = `${openDays}: ${openTime} — ${closeTime}`;

    const [lat, lng] = getAlgeriaCoordinates(
      data.wilaya,
      data.city,
      data.latitude ? parseFloat(data.latitude) : undefined,
      data.longitude ? parseFloat(data.longitude) : undefined
    );

    const isYearly = data.plan === "yearly";
    const planAmount = isYearly ? 19200 : 2000;
    const durationDays = isYearly ? 365 : 30;
    const periodLabel = isYearly ? "اشتراك سنوي (12 شهر)" : "اشتراك شهري";
    const txRef = `TX-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Atomic user + pharmacy + subscription + initial payment record creation
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: resolvedOwnerName,
        passwordHash: hashPassword(data.password),
        role: "PHARMACIST",
        pharmacy: {
          create: {
            name: data.pharmacyName,
            address: data.address,
            city: data.city,
            phone: data.phone,
            email: data.email,
            registrationNumber: data.registrationNumber,
            wilayaId: wilayaRec.id,
            hours,
            hoursWeekdays,
            lat: isNaN(lat) ? 36.7538 : lat,
            lng: isNaN(lng) ? 3.0588 : lng,
            isOnDuty: Boolean(data.isOnDuty),
            status: "PENDING",
            subscription: {
              create: {
                plan: isYearly ? "YEARLY" : "MONTHLY",
                amount: planAmount,
                status: "ACTIVE",
                startDate: new Date(),
                endDate: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000),
              },
            },
            payments: {
              create: {
                amount: planAmount,
                period: periodLabel,
                method: "BARIDIMOB",
                status: "PENDING",
                transactionRef: txRef,
              },
            },
          },
        },
      },
      include: {
        pharmacy: {
          include: {
            subscription: true,
            payments: true,
            wilaya: true,
          },
        },
      },
    });

    // 6. Invalidate admin cache tags so pending counts and lists update instantly
    revalidateTag("admin:pharmacies", "max");
    revalidateTag("admin:stats", "max");
    revalidateTag("admin:payments", "max");
    revalidateTag("admin:subscriptions", "max");
    revalidateTag("pharmacies", "max");

    return successResponse(
      {
        message: "تم تسجيل الصيدلية بنجاح والطلب قيد المراجعة",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          pharmacyId: newUser.pharmacy?.id,
          pharmacyName: newUser.pharmacy?.name,
          status: "PENDING",
          plan: data.plan,
        },
      },
      undefined,
      201
    );
  } catch (err: any) {
    console.error("[Register API Error]:", err);
    if (err?.code === "P2002") {
      const target = err.meta?.target;
      if (Array.isArray(target) && target.includes("email")) {
        return errorResponse("البريد الإلكتروني مسجل مسبقاً", 409);
      }
      if (Array.isArray(target) && target.includes("registrationNumber")) {
        return errorResponse("رقم الاعتماد مسجل مسبقاً", 409);
      }
      return errorResponse("البيانات المدخلة موجودة مسبقاً في النظام", 409);
    }
    return errorResponse("حدث خطأ أثناء تسجيل الصيدلية، يرجى المحاولة لاحقاً", 500);
  }
}
