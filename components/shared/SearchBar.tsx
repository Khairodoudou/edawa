"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Mic } from "lucide-react";
import { medicines } from "@/lib/mock-data";

interface SearchBarProps {
  size?: "sm" | "md" | "lg";
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  size = "md",
  placeholder = "ابحث عن اسم الدواء...",
  className = "",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<typeof medicines>([]);
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const handleInput = (val: string) => {
    setQuery(val);
    if (val.length >= 2) {
      const filtered = medicines.filter(
        (m) =>
          m.name.includes(val) ||
          m.genericName.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 5));
    } else {
      setSuggestions([]);
    }
  };

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
      setSuggestions([]);
      setFocused(false);
    }
  };

  const sizeClasses = {
    sm: "h-11 text-sm",
    md: "h-13 text-base",
    lg: "h-16 text-lg",
  };

  const iconSize = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`relative flex items-center bg-white dark:bg-card border-2 rounded-2xl overflow-visible transition-all duration-200 ${
          focused
            ? "border-[#0EA96E] shadow-lg shadow-[#0EA96E]/15"
            : "border-transparent shadow-xl shadow-black/10"
        }`}
      >
        {/* Search Icon */}
        <div className="flex items-center pr-4 pl-2">
          <Search className={`${iconSize[size]} text-[#0EA96E]`} />
        </div>

        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder={placeholder}
          className={`flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium py-3 ${sizeClasses[size]}`}
          dir="rtl"
          id="main-search-input"
          aria-label="البحث عن دواء"
          autoComplete="off"
        />

        {/* Search Button */}
        <div className="pl-2 pr-2">
          <button
            onClick={() => handleSearch()}
            className={`bg-gradient-to-l from-[#0EA96E] to-[#0A7A50] text-white font-semibold rounded-xl hover:shadow-md hover:shadow-[#0EA96E]/30 active:scale-95 transition-all duration-200 ${
              size === "lg" ? "px-7 py-3 text-base" : "px-5 py-2.5 text-sm"
            }`}
          >
            بحث
          </button>
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {focused && suggestions.length > 0 && (
        <div className="absolute top-full right-0 left-0 mt-2 bg-white dark:bg-card rounded-2xl shadow-2xl border border-border overflow-hidden z-50">
          {suggestions.map((med) => (
            <button
              key={med.id}
              onMouseDown={() => {
                setQuery(med.name);
                handleSearch(med.name);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0EA96E]/5 transition-colors text-right"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0EA96E]/10 flex items-center justify-center shrink-0">
                <Search className="w-3.5 h-3.5 text-[#0EA96E]" />
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-semibold text-foreground">{med.name}</p>
                <p className="text-xs text-muted-foreground">{med.category}</p>
              </div>
            </button>
          ))}
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <button
              onMouseDown={() => handleSearch()}
              className="text-xs text-[#0EA96E] font-medium hover:underline"
            >
              عرض جميع نتائج &ldquo;{query}&rdquo;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
