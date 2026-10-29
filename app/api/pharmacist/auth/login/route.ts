import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
} from "@/lib/api-utils";
import { LoginSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { pharmacy: true },
    });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return errorResponse("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401);
    }

    // Role check: If PHARMACIST, check pharmacy status
    if (user.role === "PHARMACIST") {
      if (!user.pharmacy) {
        return errorResponse("لا يوجد ملف صيدلية مرتبط بهذا الحساب", 404);
      }

      // STRICT RULE: Pharmacist cannot log in if status is PENDING 🟡
      if (user.pharmacy.status === "PENDING") {
        return errorResponse(
          "طلب تسجيل صيدليتك قيد المراجعة والتدقيق 🟡. لا يمكنك الدخول إلى لوحة التحكم حتى يتم قبول الحساب من طرف الإدارة.",
          403
        );
      }

      // If SUSPENDED / REJECTED
      if (user.pharmacy.status === "SUSPENDED" || user.pharmacy.status === "REJECTED") {
        return errorResponse(
          "حساب هذه الصيدلية غير مفعّل أو معلّق. يرجى التواصل مع إدارة تطبيق ويب دوائي.",
          403
        );
      }
    }

    // Response for ACTIVE pharmacist or ADMIN
    const response = successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        pharmacyId: user.pharmacy?.id,
        pharmacyName: user.pharmacy?.name,
        pharmacyStatus: user.pharmacy?.status || "ACTIVE",
      },
      token: `token_${user.id}_${Date.now()}`,
    });

    // Set cookie for session resolution
    response.cookies.set("edawa_user_email", user.email, {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error("[Login API Error]:", err);
    return errorResponse("حدث خطأ أثناء تسجيل الدخول", 500);
  }
}
