import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

export type StatusType =
  | "available"
  | "limited"
  | "unavailable"
  | "active"
  | "pending"
  | "suspended"
  | "rejected"
  | "approved"
  | "completed"
  | "expired"
  | "none"
  | "paid"
  | "failed"
  | "resolved"
  | "reviewing";

interface StatusBadgeProps {
  status: StatusType | string;
  customLabel?: string;
}

const statusConfig: Record<
  string,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  available: {
    label: "متوفر",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  limited: {
    label: "محدود",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/30",
    icon: AlertTriangle,
  },
  unavailable: {
    label: "غير متوفر",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/30",
    icon: XCircle,
  },
  active: {
    label: "نشط",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  pending: {
    label: "قيد الانتظار",
    bg: "bg-amber-500/10",
    text: "text-amber-700 dark:text-amber-400",
    border: "border-amber-500/30",
    icon: Clock,
  },
  suspended: {
    label: "معطّل",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/30",
    icon: XCircle,
  },
  rejected: {
    label: "مرفوض",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/30",
    icon: XCircle,
  },
  approved: {
    label: "مقبول",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  completed: {
    label: "مكتمل",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/30",
    icon: CheckCircle2,
  },
  expired: {
    label: "منتهي",
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-500/30",
    icon: Clock,
  },
  none: {
    label: "غير مشترك",
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-500/30",
    icon: Clock,
  },
  paid: {
    label: "مدفوع",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  failed: {
    label: "فشل",
    bg: "bg-rose-500/10",
    text: "text-rose-700 dark:text-rose-400",
    border: "border-rose-500/30",
    icon: XCircle,
  },
  resolved: {
    label: "معالج",
    bg: "bg-emerald-500/10",
    text: "text-emerald-700 dark:text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle2,
  },
  reviewing: {
    label: "قيد المراجعة",
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-500/30",
    icon: Clock,
  },
};

export default function StatusBadge({ status, customLabel }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase();
  const config = statusConfig[normalized] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      {customLabel || config.label}
    </span>
  );
}
