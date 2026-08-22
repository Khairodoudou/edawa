import type { NextRequest } from "next/server";
import {
  successResponse,
  errorResponse,
} from "@/lib/api-utils";
import { prisma } from "@/lib/prisma";
import { getAlgeriaCoordinates } from "@/lib/algeria-coordinates";
import { revalidateTag } from "next/cache";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const emailParam =
      url.searchParams.get("email") ||
      request.headers.get("x-user-email") ||
      request.cookies.get("edawa_user_email")?.value;

    let ph = null;
    if (emailParam) {
      ph = await prisma.pharmacy.findFirst({
        where: {
          OR: [{ email: emailParam }, { owner: { email: emailParam } }],
          status: "ACTIVE",
        },
        include: { wilaya: true, owner: true },
      });
    }

    if (!ph) {
      ph = await prisma.pharmacy.findFirst({
        where: { status: "ACTIVE" },
        include: { wilaya: true, owner: true },
      });
    }

    if (!ph) {
      return errorResponse("لا توجد صيدلية نشطة", 404);
    }

    return successResponse({
      id: ph.id,
      name: ph.name,
      owner: ph.owner?.name || "الصيدلي المسؤول",
      phone: ph.phone || "",
      email: ph.email || ph.owner?.email || "",
      wilaya: ph.wilaya?.name || "الجزائر",
      city: ph.city || "",
      address: ph.address || "",
      lat: ph.lat?.toString() || "36.7538",
      lng: ph.lng?.toString() || "3.0588",
      registrationNumber: ph.registrationNumber || "REG-2026-DZ",
      isOnDuty: ph.isOnDuty || false,
      isOpen: ph.isOpen || false,
      hoursWeekdays: ph.hoursWeekdays || ph.hours || "08:00 - 20:00",
      hoursSaturday: ph.hoursSaturday || "08:00 - 18:00",
      hoursSunday: ph.hoursSunday || "مغلق",
      notes: "صيدلية معتمدة توفر أدوية الأمراض المزمنة والمستلزمات الطبية.",
    });
  } catch (err) {
    console.error("[Profile GET Error]:", err);
    return errorResponse("حدث خطأ أثناء جلب الملف الشخصي", 500);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      owner,
      phone,
      email,
      wilaya,
      city,
      address,
      lat,
      lng,
      isOnDuty,
      hoursWeekdays,
      hoursSaturday,
      hoursSunday,
    } = body;

    const emailParam =
      request.headers.get("x-user-email") ||
      request.cookies.get("edawa_user_email")?.value;

    let ph = null;
    if (emailParam) {
      ph = await prisma.pharmacy.findFirst({
        where: {
          OR: [{ email: emailParam }, { owner: { email: emailParam } }],
          status: "ACTIVE",
        },
        include: { owner: true },
      });
    }

    if (!ph) {
      ph = await prisma.pharmacy.findFirst({
        where: { status: "ACTIVE" },
        include: { owner: true },
      });
    }

    if (!ph) return errorResponse("لا توجد صيدلية لتحديثها", 404);

    // Resolve wilaya ID cleanly
    let wilayaId = ph.wilayaId;
    if (wilaya) {
      const codeNum = parseInt(wilaya, 10);
      const orConditions: any[] = [
        { name: wilaya },
        { name: { contains: wilaya } },
      ];
      if (!isNaN(codeNum) && codeNum > 0) {
        orConditions.push({ code: codeNum });
      }

      const foundWilaya = await prisma.wilaya.findFirst({
        where: { OR: orConditions },
      });

      if (foundWilaya) {
        wilayaId = foundWilaya.id;
      }
    }

    // Resolve lat/lng
    let finalLat = parseFloat(lat);
    let finalLng = parseFloat(lng);

    if (isNaN(finalLat) || isNaN(finalLng) || (finalLat === 0 && finalLng === 0)) {
      const coords = getAlgeriaCoordinates(wilaya, city, address);
      finalLat = coords[0];
      finalLng = coords[1];
    }

    // Update pharmacy
    const updatedPh = await prisma.pharmacy.update({
      where: { id: ph.id },
      data: {
        name: name || ph.name,
        phone: phone || ph.phone,
        email: email || ph.email,
        city: city || ph.city,
        address: address || ph.address,
        wilayaId,
        lat: finalLat,
        lng: finalLng,
        isOnDuty: typeof isOnDuty === "boolean" ? isOnDuty : ph.isOnDuty,
        hoursWeekdays: hoursWeekdays || ph.hoursWeekdays,
        hoursSaturday: hoursSaturday || ph.hoursSaturday,
        hoursSunday: hoursSunday || ph.hoursSunday,
        hours: hoursWeekdays || ph.hours,
      },
      include: { wilaya: true, owner: true },
    });

    // Update owner user name if changed
    if (owner && ph.ownerId) {
      await prisma.user.update({
        where: { id: ph.ownerId },
        data: { name: owner },
      });
    }

    // Revalidate caches
    revalidateTag("pharmacies", "max");
    revalidateTag(`pharmacy:${ph.id}`, "max");

    return successResponse({
      message: "تم تحديث ملف الصيدلية بنجاح",
      pharmacy: updatedPh,
    });
  } catch (err: any) {
    console.error("[Profile PUT Error]:", err?.message || err);
    return errorResponse(err?.message || "حدث خطأ أثناء حفظ الملف الشخصي", 500);
  }
}
