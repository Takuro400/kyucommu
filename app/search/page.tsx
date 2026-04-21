"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CircleCard from "@/components/CircleCard";
import { MOCK_CIRCLES } from "@/lib/mockData";
import { CATEGORY_MAP } from "@/lib/utils";
import { Category, Circle } from "@/lib/types";
import { createClient, supabaseConfigured } from "@/lib/supabase";

const CATS: { key: Category | "beginner" | "active"; label: string; emoji: string }[] = [
  { key: "active",   label: "活動中",    emoji: "🔥" },
  { key: "tech",     label: "技術系",    emoji: "💻" },
  { key: "sport",    label: "体育系",    emoji: "⚽" },
  { key: "culture",  label: "文化系",    emoji: "🎨" },
  { key: "beginner", label: "初心者歓迎", emoji: "🌱" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [circles, setCircles] = useState<Circle[]>(MOCK_CIRCLES);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    supabase
      .from("circles")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) setCircles(data as Circle[]);
      });
  }, []);

  const filtered = circles.filter((c) => {
    const matchQuery =
      !query ||
      c.name.includes(query) ||
      c.description.includes(query) ||
      CATEGORY_MAP[c.category].label.includes(query);
    const matchFilter =
      !activeFilter ||
      (activeFilter === "beginner" ? c.beginner_ok :
       activeFilter === "active"   ? c.is_active :
       c.category === activeFilter);
    return matchQuery && matchFilter;
  });

  return (
    <div className="pb-24 bg-cream min-h-screen">
      <header className="sticky top-0 bg-white/85 backdrop-blur-xl border-b border-kpink/10 z-40 px-4 pt-12 pb-3">
        <p className="text-lg font-bold text-charcoal mb-3">探す</p>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.5">
          <Search size={15} className="text-muted flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm text-charcoal placeholder:text-muted outline-none"
            placeholder="サークル名・キーワード"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveFilter(null); }}
          />
        </div>
      </header>

      <main className="px-4 pt-4">
        {!query && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 mb-5">
            {CATS.map((cat) => {
              const isActive = activeFilter === cat.key;
              let bg = "#F3F4F6";
              let textColor = "#6B7280";
              let activeBg = "#374151";

              if (cat.key === "active") {
                bg = "#FEF2F2"; textColor = "#EF4444"; activeBg = "#EF4444";
              } else if (cat.key === "beginner") {
                bg = "#EAF3DE"; textColor = "#27500A"; activeBg = "#27500A";
              } else {
                const color = CATEGORY_MAP[cat.key as Category];
                bg = color.bg; textColor = color.text; activeBg = color.text;
              }

              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(isActive ? null : cat.key)}
                  className="flex-shrink-0 flex items-center gap-2 rounded-full px-4 py-2 transition-all tap-scale"
                  style={{
                    background: isActive ? activeBg : bg,
                    color: isActive ? "#fff" : textColor,
                  }}
                >
                  <span className={`text-base ${cat.key === "active" && isActive ? "float-fire" : ""}`}>
                    {cat.emoji}
                  </span>
                  <span className="text-xs font-semibold">{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <p className="text-xs text-muted mb-3">
          {activeFilter
            ? `${CATS.find((c) => c.key === activeFilter)?.label} (${filtered.length}件)`
            : query
            ? `「${query}」の検索結果 (${filtered.length}件)`
            : `すべてのサークル (${filtered.length}件)`}
        </p>

        <div className="flex flex-col gap-2.5">
          {filtered.length > 0
            ? filtered.map((c) => (
                <div key={c.id} className="relative">
                  {c.is_active && (
                    <div className="absolute -top-1.5 left-3 z-10">
                      <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                        <span className="float-fire">🔥</span> 活動中
                      </span>
                    </div>
                  )}
                  <CircleCard circle={c} />
                </div>
              ))
            : <p className="text-center text-muted text-sm py-12">該当するサークルが見つかりませんでした</p>}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
