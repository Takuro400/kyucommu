"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { createClient, supabaseConfigured } from "@/lib/supabase";

export default function CircleBookmarkButton({ circleId }: { circleId: string }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setUserId(data.user.id);
      const { data: bm } = await supabase
        .from("circle_bookmarks")
        .select("id")
        .eq("circle_id", circleId)
        .eq("user_id", data.user.id)
        .maybeSingle();
      setBookmarked(!!bm);
    });
  }, [circleId]);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId) {
      setHint(true);
      setTimeout(() => setHint(false), 2000);
      return;
    }
    const next = !bookmarked;
    setBookmarked(next);
    if (!supabaseConfigured) return;
    const supabase = createClient();
    if (next) {
      await supabase.from("circle_bookmarks").insert({ circle_id: circleId, user_id: userId });
    } else {
      await supabase.from("circle_bookmarks").delete()
        .eq("circle_id", circleId).eq("user_id", userId);
    }
  }

  return (
    <div className="relative">
      <button onClick={toggle} className="p-2 rounded-full hover:bg-gray-50 active:scale-90 transition-transform">
        <Bookmark
          size={18}
          strokeWidth={1.8}
          fill={bookmarked ? "currentColor" : "none"}
          className={bookmarked ? "text-[#185FA5]" : "text-gray-300"}
        />
      </button>
      {hint && (
        <div className="absolute right-0 bottom-10 bg-gray-800 text-white text-[10px] px-2 py-1 rounded-lg whitespace-nowrap z-10">
          ログインが必要です
        </div>
      )}
    </div>
  );
}
