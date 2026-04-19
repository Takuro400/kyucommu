"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import CircleCard from "@/components/CircleCard";
import { MOCK_CIRCLES } from "@/lib/mockData";
import { CATEGORY_MAP } from "@/lib/utils";
import { Category } from "@/lib/types";

const CATS: { key: Category | "beginner"; label: string; emoji: string }[] = [
  { key: "tech",     label: "技術系",    emoji: "💻" },
  { key: "sport",    label: "体育系",    emoji: "⚽" },
  { key: "culture",  label: "文化系",    emoji: "🎨" },
  { key: "beginner", label: "初心者歓迎", emoji: "🌱" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered = MOCK_CIRCLES.filter((c) => {
    const matchQuery =
      !query ||
      c.name.includes(query) ||
      c.description.includes(query) ||
      CATEGORY_MAP[c.category].label.includes(query);

    const matchFilter =
      !activeFilter ||
      (activeFilter === "beginner" ? c.beginner_ok : c.category === activeFilter);

    return matchQuery && matchFilter;
  });

  return (
    <div className="pb-20">
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40 px-4 py-3">
        <p className="text-lg font-bold text-gray-900 mb-3">探す</p>
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
          <Search size={16} className="text-gray-400" />
          <input
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
            placeholder="サークル名・キーワード"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActiveFilter(null); }}
          />
        </div>
      </header>

      <main className="px-4 pt-4">
        {/* カテゴリグリッド */}
        {!query && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {CATS.map((cat) => {
              const isActive = activeFilter === cat.key;
              const color = cat.key !== "beginner"
                ? CATEGORY_MAP[cat.key as Category]
                : { bg: "#EAF3DE", text: "#27500A" };
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveFilter(isActive ? null : cat.key)}
                  className="flex items-center gap-3 rounded-xl p-4 transition-opacity active:opacity-70"
                  style={{
                    background: isActive ? color.text : color.bg,
                    color: isActive ? "#fff" : color.text,
                  }}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="text-sm font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* サークル一覧 */}
        <p className="text-xs text-gray-400 mb-2">
          {activeFilter
            ? `${CATS.find((c) => c.key === activeFilter)?.label} (${filtered.length}件)`
            : query
            ? `「${query}」の検索結果 (${filtered.length}件)`
            : `すべてのサークル (${filtered.length}件)`}
        </p>
        <div className="flex flex-col gap-2">
          {filtered.length > 0
            ? filtered.map((c) => <CircleCard key={c.id} circle={c} />)
            : <p className="text-center text-gray-400 text-sm py-12">該当するサークルが見つかりませんでした</p>
          }
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
