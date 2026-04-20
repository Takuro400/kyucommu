"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import PostCard from "./PostCard";
import { MOCK_CIRCLES, MOCK_POSTS } from "@/lib/mockData";

export default function FeedClient() {
  const [userId, setUserId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const uid = data.user.id;
      setUserId(uid);

      // 自分のいいね一覧を取得
      const [{ data: likes }, { data: bookmarks }] = await Promise.all([
        supabase.from("likes").select("post_id").eq("user_id", uid),
        supabase.from("bookmarks").select("post_id").eq("user_id", uid),
      ]);

      if (likes) setLikedIds(new Set(likes.map((l) => l.post_id as string)));
      if (bookmarks) setBookmarkedIds(new Set(bookmarks.map((b) => b.post_id as string)));
    });
  }, []);

  const postsWithCircle = MOCK_POSTS.map((p) => ({
    post: p,
    circle: MOCK_CIRCLES.find((c) => c.id === p.circle_id)!,
  })).filter((x) => x.circle);

  return (
    <main>
      {postsWithCircle.map(({ post, circle }) => (
        <PostCard
          key={post.id}
          post={post}
          circle={circle}
          userId={userId}
          initialLiked={likedIds.has(post.id)}
          initialBookmarked={bookmarkedIds.has(post.id)}
        />
      ))}
    </main>
  );
}
