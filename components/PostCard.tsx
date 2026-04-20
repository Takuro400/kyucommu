"use client";

import { useState } from "react";
import { Post, Circle } from "@/lib/types";
import { CATEGORY_MAP, timeAgo } from "@/lib/utils";
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import ReportModal from "./ReportModal";
import { createClient, supabaseConfigured } from "@/lib/supabase";

interface Props {
  post: Post;
  circle: Circle;
  userId: string | null;
  initialLiked: boolean;
  initialBookmarked: boolean;
}

export default function PostCard({
  post,
  circle,
  userId,
  initialLiked,
  initialBookmarked,
}: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [popping, setPopping] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [loginHint, setLoginHint] = useState(false);

  const cat = CATEGORY_MAP[circle.category];

  async function handleLike() {
    if (!userId) {
      setLoginHint(true);
      setTimeout(() => setLoginHint(false), 2000);
      return;
    }

    const newLiked = !liked;
    // 楽観的UI更新
    setLiked(newLiked);
    setLikeCount((c) => c + (newLiked ? 1 : -1));
    setPopping(true);
    setTimeout(() => setPopping(false), 300);

    if (supabaseConfigured) {
      const supabase = createClient();
      if (newLiked) {
        await supabase.from("likes").insert({ post_id: post.id, user_id: userId });
      } else {
        await supabase.from("likes").delete()
          .eq("post_id", post.id).eq("user_id", userId);
      }
    }
  }

  async function handleBookmark() {
    if (!userId) {
      setLoginHint(true);
      setTimeout(() => setLoginHint(false), 2000);
      return;
    }

    const newBookmarked = !bookmarked;
    setBookmarked(newBookmarked);

    if (supabaseConfigured) {
      const supabase = createClient();
      if (newBookmarked) {
        await supabase.from("bookmarks").insert({ post_id: post.id, user_id: userId });
      } else {
        await supabase.from("bookmarks").delete()
          .eq("post_id", post.id).eq("user_id", userId);
      }
    }
  }

  return (
    <>
      <article className="bg-white mb-2 fade-in-up">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 px-4 py-3">
          <Link href={`/circle/${circle.id}`}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: cat.bg }}
            >
              {circle.emoji}
            </div>
          </Link>
          <div className="flex-1 min-w-0">
            <Link href={`/circle/${circle.id}`}>
              <p className="text-sm font-medium text-gray-900 truncate">{circle.name}</p>
            </Link>
            <p className="text-xs text-gray-400">{timeAgo(post.created_at)}</p>
          </div>
          <button
            className="text-xs px-3 py-1.5 rounded-full font-medium border mr-1"
            style={{ borderColor: "#185FA5", color: "#185FA5" }}
          >
            フォロー
          </button>
          {/* 三点メニュー */}
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <MoreHorizontal size={18} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-40 w-36 overflow-hidden">
                  <button
                    onClick={() => { setShowMenu(false); setShowReport(true); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-50"
                  >
                    投稿を報告する
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 画像エリア */}
        <div
          className="w-full aspect-[4/3] flex items-center justify-center text-7xl select-none"
          style={{ background: cat.bg }}
        >
          {post.image_emoji}
        </div>

        {/* ログイン促進トースト */}
        {loginHint && (
          <div className="mx-4 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg text-center">
            ログインするといいね・ブックマークできます
          </div>
        )}

        {/* アクション */}
        <div className="flex items-center gap-4 px-4 pt-3 pb-1">
          <button onClick={handleLike} className="flex items-center gap-1.5">
            <Heart
              size={24}
              className={`transition-all ${popping ? "scale-125" : "scale-100"}`}
              fill={liked ? "#e24b4a" : "none"}
              stroke={liked ? "#e24b4a" : "currentColor"}
              strokeWidth={1.8}
            />
            <span className="text-sm text-gray-700">{likeCount}</span>
          </button>
          <button className="flex items-center gap-1.5 text-gray-500">
            <MessageCircle size={24} strokeWidth={1.8} />
            <span className="text-sm">{post.comment_count}</span>
          </button>
          <button onClick={handleBookmark} className="ml-auto text-gray-500">
            <Bookmark
              size={22}
              strokeWidth={1.8}
              fill={bookmarked ? "currentColor" : "none"}
              className={bookmarked ? "text-[#185FA5]" : ""}
            />
          </button>
        </div>

        {/* キャプション */}
        <div className="px-4 pb-4">
          <p className="text-sm text-gray-800 leading-relaxed">
            <span className="font-medium">{circle.name}</span>{"　"}
            {post.caption}
          </p>
          <p className="text-sm mt-1" style={{ color: "#185FA5" }}>
            {post.tags.join(" ")}
          </p>
        </div>
      </article>

      {showReport && (
        <ReportModal postId={post.id} onClose={() => setShowReport(false)} />
      )}
    </>
  );
}
