// =============================
// Zod Validators — دوائي Platform (Zod v4 Compatible)
// =============================

import { z } from "zod";

// ========================
// Common / Shared
// ========================

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const IdParamSchema = z.object({
  id: z.string().min(1, "المعرف مطلوب"),
});

// ========================
// Auth Schemas
// ========================

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RegisterPharmacySchema = z.object({
  // Personal info
  ownerName: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل"),
  email: z
    .string()
    .min(1, "البريد الإلكتروني مطلوب")
    .email("صيغة البريد الإلكتروني غير صحيحة"),
  phone: z
    .string()
    .min(9, "رقم الهاتف غير صحيح"),
  password: z
    .string()
    .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
  confirmPassword: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
  // Pharmacy info
  pharmacyName: z
    .string()
    .min(3, "اسم الصيدلية يجب أن يكون 3 أحرف على الأقل"),
  registrationNumber: z
    .string()
    .min(5, "رقم التسجيل غير صحيح"),
  wilaya: z.string().min(1, "الولاية مطلوبة"),
  city: z.string().min(2, "المدينة مطلوبة"),
  address: z
    .string()
    .min(10, "العنوان يجب أن يكون أكثر تفصيلاً"),
  // Plan
  plan: z.enum(["monthly", "yearly"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين",
  path: ["confirmPassword"],
});
export type RegisterPharmacyInput = z.infer<typeof RegisterPharmacySchema>;

// ========================
// Stock Schemas
// ========================

export const StockItemCreateSchema = z.object({
  medicineId: z.string().min(1, "معرف الدواء مطلوب"),
  name: z.string().optional(),
  genericName: z.string().optional(),
  category: z.string().optional(),
  form: z.string().optional(),
  dosage: z.string().optional(),
  quantity: z
    .number()
    .int("يجب أن تكون الكمية عدداً صحيحاً")
    .min(0, "الكمية لا يمكن أن تكون سالبة"),
  status: z.enum(["available", "limited", "unavailable"]).optional(),
  expiryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "صيغة التاريخ غير صحيحة (YYYY-MM-DD)"),
});
export type StockItemCreateInput = z.infer<typeof StockItemCreateSchema>;

export const StockItemUpdateSchema = StockItemCreateSchema.partial().extend({
  status: z.enum(["available", "limited", "unavailable"]).optional(),
});
export type StockItemUpdateInput = z.infer<typeof StockItemUpdateSchema>;

export const StockFilterSchema = PaginationSchema.extend({
  search: z.string().optional(),
  status: z.enum(["available", "limited", "unavailable", "all"]).default("all"),
  category: z.string().optional(),
});
export type StockFilterInput = z.infer<typeof StockFilterSchema>;

// ========================
// Exchange Schemas
// ========================

export const ExchangeRequestCreateSchema = z.object({
  toPharmacyId: z.string().min(1, "الصيدلية المستقبِلة مطلوبة"),
  medicineName: z.string().min(2, "اسم الدواء مطلوب"),
  genericName: z.string().min(2, "الاسم العلمي مطلوب"),
  requestedQuantity: z
    .number()
    .int()
    .min(1, "يجب أن تكون الكمية أكبر من صفر"),
  offeredMedicineName: z.string().optional(),
  offeredQuantity: z.number().int().min(1).optional(),
  notes: z.string().max(500, "الملاحظات لا يمكن أن تتجاوز 500 حرف").optional(),
});
export type ExchangeRequestCreateInput = z.infer<typeof ExchangeRequestCreateSchema>;

export const ExchangeStatusUpdateSchema = z.object({
  status: z.enum(["approved", "rejected", "completed"]),
  notes: z.string().max(500).optional(),
});
export type ExchangeStatusUpdateInput = z.infer<typeof ExchangeStatusUpdateSchema>;

// ========================
// Subscription Schemas
// ========================

export const SubscriptionCreateSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
  paymentMethod: z.enum(["baridimob", "cib", "virement"]),
  transactionRef: z
    .string()
    .min(6, "رقم العملية غير صحيح"),
});
export type SubscriptionCreateInput = z.infer<typeof SubscriptionCreateSchema>;

// ========================
// Pharmacy Profile Schemas
// ========================

export const PharmacyProfileUpdateSchema = z.object({
  name: z.string().min(3).optional(),
  phone: z.string().min(9).optional(),
  address: z.string().min(10).optional(),
  city: z.string().min(2).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  hours: z.string().optional(),
  hoursDetail: z
    .object({
      weekdays: z.string(),
      saturday: z.string(),
      sunday: z.string(),
    })
    .optional(),
  isOnDuty: z.boolean().optional(),
});
export type PharmacyProfileUpdateInput = z.infer<typeof PharmacyProfileUpdateSchema>;

// ========================
// Admin — Medicine Catalog Schemas
// ========================

export const MedicineCreateSchema = z.object({
  name: z.string().min(2, "اسم الدواء مطلوب"),
  genericName: z.string().min(2, "الاسم العلمي مطلوب"),
  category: z.string().min(2, "الفئة مطلوبة"),
  form: z.string().min(2, "الشكل الصيدلاني مطلوب"),
  dosage: z.string().min(1, "الجرعة مطلوبة"),
  manufacturer: z.string().min(2, "المصنّع مطلوب"),
});
export type MedicineCreateInput = z.infer<typeof MedicineCreateSchema>;

export const MedicineUpdateSchema = MedicineCreateSchema.partial();
export type MedicineUpdateInput = z.infer<typeof MedicineUpdateSchema>;

// ========================
// Admin — Pharmacy Action Schemas
// ========================

export const PharmacyActionSchema = z.object({
  action: z.enum(["approve", "suspend", "reject", "activate"]),
  reason: z.string().max(500).optional(),
});
export type PharmacyActionInput = z.infer<typeof PharmacyActionSchema>;

// ========================
// Admin — Report Action Schema
// ========================

export const ReportActionSchema = z.object({
  status: z.enum(["reviewing", "resolved", "dismissed"]),
  notes: z.string().max(500).optional(),
});
export type ReportActionInput = z.infer<typeof ReportActionSchema>;

// ========================
// Search / Filter Schemas
// ========================

export const PublicSearchSchema = PaginationSchema.extend({
  q: z.string().optional(),
  category: z.string().optional(),
  wilaya: z.string().optional(),
  isOpen: z.coerce.boolean().optional(),
  isOnDuty: z.coerce.boolean().optional(),
  sort: z.enum(["nearest", "rating", "name"]).default("nearest"),
});
export type PublicSearchInput = z.infer<typeof PublicSearchSchema>;

export const AdminPharmaciesFilterSchema = PaginationSchema.extend({
  search: z.string().optional(),
  status: z
    .enum(["active", "pending", "suspended", "rejected", "all"])
    .default("all"),
  wilaya: z.string().optional(),
  subscriptionStatus: z.enum(["active", "expired", "none", "all"]).default("all"),
});
export type AdminPharmaciesFilterInput = z.infer<typeof AdminPharmaciesFilterSchema>;
