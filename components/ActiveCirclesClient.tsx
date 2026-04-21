"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { MOCK_CIRCLES } from "@/lib/mockData";
import { Circle } from "@/lib/types";
import { CATEGORY_MAP } from "@/lib/utils";
import Link from "next/link";

export default function ActiveCirclesClient() {
  const [circles, setCircles] = useState<Circle[]>([]);

  useEffect(() => {
    if (!supabaseConfigured) {
      // デモ用：最初の2件をアクティブとして表示
      setCircles(MOCK_CIRCLES.slice(0, 2).map(c => ({ ...c, is_active: true })));
      return;
    }
    const supabase = createClient();
    supabase
      .from("circles")
      .select("*")
      .eq("status", "approved")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setCircles(data as Circle[]);
      });
  }, []);

  if (circles.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base float-fire">🔥</span>
        <p className="text-sm font-bold text-charcoal">今日活動中のサークル</p>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
        {circles.map(circle => {
          const cat = CATEGORY_MAP[circle.category];
          return (
            <Link
              key={circle.id}
              href={`/circle/${circle.id}`}
              className="card flex-shrink-0 w-44 p-3.5 flex flex-col gap-2 tap-scale"
            >
              {/* アイコン */}
              <div className="flex items-center gap-2.5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={{ background: cat.bg }}
                >
                  {circle.icon_url
                    ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
                    : circle.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-charcoal truncate">{circle.name}</p>
                  <span className="text-[9px] font-bold text-red-400 bg-red-50 px-1.5 py-0.5 rounded-full">
                    🔥 活動中
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-muted leading-snug line-clamp-2">
                {circle.description}
              </p>

              <span
                className="text-[9px] px-2 py-0.5 rounded-full font-semibold self-start"
                style={{ background: cat.bg, color: cat.text }}
              >
                {cat.label}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
