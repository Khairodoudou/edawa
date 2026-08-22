import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: "green" | "blue" | "amber" | "rose" | "purple";
}

const colorStyles = {
  green: {
    bg: "bg-[#0EA96E]/10",
    text: "text-[#0EA96E]",
    border: "border-[#0EA96E]/20",
  },
  blue: {
    bg: "bg-[#1A6EBD]/10",
    text: "text-[#1A6EBD]",
    border: "border-[#1A6EBD]/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-500/20",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-500/20",
  },
};

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "green",
}: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-muted-foreground text-xs font-semibold">{title}</span>
        <div className={`w-10 h-10 rounded-xl ${styles.bg} ${styles.text} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl font-black text-foreground">{value}</span>
        {trend && (
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              trend.isUp ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
            }`}
          >
            {trend.isUp ? "↑" : "↓"} {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}
