"use client";

import { RefreshCw } from "lucide-react";

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-bold rounded-2xl hover:shadow-lg hover:shadow-[#0EA96E]/25 hover:-translate-y-0.5 transition-all cursor-pointer"
    >
      <RefreshCw className="w-4 h-4" />
      إعادة المحاولة
    </button>
  );
}
