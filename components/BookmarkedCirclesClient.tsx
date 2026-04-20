"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { MOCK_CIRCLES } from "@/lib/mockData";
import CircleCard from "./CircleCard";
import type { Circle } from "@/lib/types";

interface Props {
  userId: string;
}

export default function BookmarkedCirclesClient({ userId }: Props) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!supabaseConfigured) {
        // デモモード: モックデータから先頭2件
        setCircles(MOCK_CIRCLES.slice(0, 2));
        setLoading(false);
        return;
      }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("circle_bookmarks")
        .select("circle_id, circles(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error && data) {
        const bookmarked = data
          .map((row: { circle_id: string; circles: Circle | null }) => row.circles)
          .filter((c): c is Circle => c !== null);
        setCircles(bookmarked);
      }
      setLoading(false);
    }
    load();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-6 h-6 rounded-full border-2 border-[#185FA5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (circles.length === 0) {
    return (
      <div className="bg-white rounded-2xl px-4 py-6 text-center">
        <p className="text-2xl mb-2">🔖</p>
        <p className="text-sm text-gray-500 font-medium">まだブックマークがありません</p>
        <p className="text-xs text-gray-400 mt-1">気になるサークルをブックマークしよう</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {circles.map((c) => (
        <CircleCard key={c.id} circle={c} showBookmark={false} />
      ))}
    </div>
  );
}
