// ================================================================
// lib/mock-data.ts — Types Only (No Mock Data)
// All mock data has been removed. This file only exports TypeScript
// type definitions and empty arrays used across the application.
// ================================================================

// ── Public Pharmacy ──────────────────────────────────────────────
export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city: string;
  wilaya: string;
  wilayaId?: number;
  phone: string;
  email: string;
  hours: string;
  hoursWeekdays?: string;
  hoursSaturday?: string;
  hoursSunday?: string;
  hoursDetail?: {
    weekdays?: string;
    saturday?: string;
    sunday?: string;
  };
  rating: number;
  reviewCount: number;
  isOpen: boolean;
  isOnDuty: boolean;
  status: "active" | "pending" | "suspended" | "rejected";
  image?: string;
  lat: number;
  lng: number;
  registrationNumber?: string;
  createdAt?: string;
  approvedAt?: string;
  stock?: {
    medicineId?: string;
    medicineName: string;
    genericName?: string;
    category?: string;
    available?: boolean;
    quantity: number;
    status: "available" | "limited" | "unavailable";
  }[];
}

// ── Stock Item ────────────────────────────────────────────────────
export interface StockItem {
  id: string;
  pharmacyId?: string;
  medicineId?: string;
  name: string;
  medicineName?: string;
  pharmacyName?: string;
  wilaya?: string;
  city?: string;
  availableForExchange?: number;
  phone?: string;
  genericName: string;
  category: string;
  dosage: string;
  form?: string;
  quantity: number;
  status: "available" | "limited" | "unavailable";
  expiryDate: string;
  addedAt?: string;
}

// ── Medicine (Catalog) ────────────────────────────────────
export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  dosage: string;
  manufacturer: string;
  image?: string;
  createdAt?: string;
}

// ── Admin Pharmacy ────────────────────────────────────────────────
export interface AdminPharmacy {
  id: string;
  name: string;
  owner: string;
  wilaya: string;
  city: string;
  phone: string;
  email: string;
  registrationNumber: string;
  status: "active" | "pending" | "suspended" | "rejected";
  subscriptionStatus?: "active" | "expired" | "none";
  subscriptionPlan?: string;
  createdAt?: string;
  approvedAt?: string;
}

// ── Admin Medicine ────────────────────────────────────────────────
export interface AdminMedicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  form: string;
  dosage: string;
  manufacturer: string;
  image?: string;
  createdAt?: string;
}

// ── Admin Payment ─────────────────────────────────────────────────
export interface AdminPayment {
  id: string;
  pharmacyName: string;
  amount: number;
  period: string;
  method: string;
  status: "paid" | "pending" | "failed";
  paidAt?: string;
  date?: string;
  createdAt?: string;
}

// ── Admin Subscription ────────────────────────────────────────────
export interface AdminSubscription {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  plan: "monthly" | "yearly";
  status: "active" | "expired" | "cancelled";
  startDate: string;
  endDate: string;
  amount: number;
}

// ── Admin Report ──────────────────────────────────────────────────
export interface AdminReport {
  id: string;
  pharmacyId: string;
  pharmacyName: string;
  type: "INCORRECT_INFO" | "UNAVAILABILITY" | "OTHER";
  reportedBy: string;
  description: string;
  status: "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED";
  notes?: string;
  createdAt?: string;
}

// ── Wilaya ────────────────────────────────────────────────────────
export interface Wilaya {
  id?: number;
  code: number;
  name: string;
}

// ── Exchange Request ──────────────────────────────────────────────
export interface ExchangeRequest {
  id: string;
  fromPharmacyId?: string;
  toPharmacyId?: string;
  fromPharmacy?: string;
  toPharmacy?: string;
  type?: "incoming" | "outgoing" | string;
  medicineName: string;
  genericName?: string;
  offeredMedicineName?: string;
  offeredMedicine?: string;
  requestedQuantity: number;
  offeredQuantity?: number;
  status: "pending" | "approved" | "rejected" | "completed";
  notes?: string;
  createdAt?: string;
}

// ── Platform Stats ─────────────────────────────────────────────────
export interface PlatformStats {
  totalPharmacies: number;
  activePharmacies: number;
  pendingPharmacies: number;
  totalMedicines: number;
  monthlySearches: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalRevenue: number;
}

// ── Medicine Categories List ──────────────────────────────────────
export const medicineCategories = [
  { id: "1", name: "مسكنات الألم" },
  { id: "2", name: "مضادات حيوية" },
  { id: "3", name: "مضادات الالتهاب" },
  { id: "4", name: "فيتامينات ومكملات" },
  { id: "5", name: "أدوية السكري" },
  { id: "6", name: "أدوية القلب" },
  { id: "7", name: "أدوية الجهاز الهضمي" },
  { id: "8", name: "أدوية الغدة الدرقية" },
  { id: "9", name: "مضادات الحساسية" },
  { id: "10", name: "أدوية ضغط الدم" },
  { id: "11", name: "مضادات الاكتئاب" },
  { id: "12", name: "مضادات القلق" },
  { id: "13", name: "أدوية الجهاز التنفسي" },
];

// ── Empty Arrays & Placeholders ───────────────────────────────────
export const pharmacies: Pharmacy[] = [];
export const pharmacistStock: StockItem[] = [];
export const adminPharmacies: AdminPharmacy[] = [];
export const adminPayments: AdminPayment[] = [];
export const medicines: Medicine[] = [];
import { ALGERIAN_WILAYAS_LIST } from "./algeria-coordinates";
export const wilayas: Wilaya[] = ALGERIAN_WILAYAS_LIST as any;
export const testimonials: {
  id: string;
  name: string;
  role: string;
  city: string;
  content?: string;
  text?: string;
  avatar?: string;
  rating: number;
}[] = [];

export const adminGlobalStats: { month: string; searches: number }[] = [];

export const adminTopMedicinesSearched: { name: string; searches: number; count?: number; percentage: number }[] = [];

export const pharmacistDashboardStats = {
  totalMedicines: 0,
  availableMedicines: 0,
  lowStockMedicines: 0,
  outOfStockMedicines: 0,
  available: 0,
  unavailable: 0,
  subscriptionExpiry: "2027-01-01",
  weeklySearches: 0,
  profileViews: 0,
  monthlySearches: 0,
  totalExchanges: 0,
  pendingExchanges: 0,
  completedExchanges: 0,
};

export const pharmacistNotifications: {
  id: string;
  type: string;
  title?: string;
  message: string;
  time: string;
  read: boolean;
}[] = [];

export const pharmacistExchangeRequests: ExchangeRequest[] = [];
export const exchangeableStockList: StockItem[] = [];
export const pharmacistSearchStats: {
  week?: string;
  month?: string;
  searches: number;
}[] = [];

export const pharmacistTopMedicines: {
  name: string;
  searches: number;
  percentage: number;
}[] = [];

export const pharmacistPayments: AdminPayment[] = [];
export const adminOverviewStats: PlatformStats = {
  totalPharmacies: 0,
  activePharmacies: 0,
  pendingPharmacies: 0,
  totalMedicines: 0,
  monthlySearches: 0,
  activeSubscriptions: 0,
  monthlyRevenue: 0,
  totalRevenue: 0,
};
