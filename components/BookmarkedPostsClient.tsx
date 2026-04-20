"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { MOCK_POSTS, MOCK_CIRCLES } from "@/lib/mockData";
import { CATEGORY_MAP } from "@/lib/utils";
import { Post, Circle } from "@/lib/types";
import { Bookmark } from "lucide-react";
import Link from "next/link";

interface Props {
  userId: string;
}

export default function BookmarkedPostsClient({ userId }: Props) {
  const [posts, setPosts] = useState<{ post: Post; circle: Circle }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabaseConfigured || !userId) {
      setLoading(false);
      return;
    }
    const supabase = createClient();

    supabase
      .from("bookmarks")
      .select("post_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        const ids = new Set(data.map((b) => b.post_id as string));
        const result = MOCK_POSTS
          .filter((p) => ids.has(p.id))
          .map((p) => ({
            post: p,
            circle: MOCK_CIRCLES.find((c) => c.id === p.circle_id)!,
          }))
          .filter((x) => x.circle);
        setPosts(result);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="w-6 h-6 rounded-full border-2 border-[#185FA5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center px-4">
        <Bookmark size={32} className="text-gray-300 mb-2" />
        <p className="text-sm text-gray-400">保存した投稿はまだありません</p>
        <p className="text-xs text-gray-300 mt-1">投稿のブックマークアイコンをタップで保存できます</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 px-4 pb-4">
      {posts.map(({ post, circle }) => {
        const cat = CATEGORY_MAP[circle.category];
        return (
          <Link key={post.id} href={`/circle/${circle.id}`}>
            <div className="rounded-xl overflow-hidden bg-white shadow-sm active:opacity-70">
              <div
                className="aspect-square flex items-center justify-center text-4xl"
                style={{ background: cat.bg }}
              >
                {post.image_emoji}
              </div>
              <div className="p-2">
                <p className="text-xs font-medium text-gray-800 truncate">{circle.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-2">{post.caption}</p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
