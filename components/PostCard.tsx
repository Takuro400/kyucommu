"use client";

import { useState } from "react";
import { Post, Circle } from "@/lib/types";
import { CATEGORY_MAP, timeAgo } from "@/lib/utils";
import { Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import ReportModal from "./ReportModal";

interface Props {
  post: Post;
  circle: Circle;
}

export default function PostCard({ post, circle }: Props) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [popping, setPopping] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const cat = CATEGORY_MAP[circle.category];

  function handleLike() {
    setLiked((prev) => {
      setLikeCount((c) => c + (prev ? -1 : 1));
      return !prev;
    });
    setPopping(true);
    setTimeout(() => setPopping(false), 300);
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
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 z-40 w-36 overflow-hidden">
                  <button
                    onClick={() => { setShowMenu(false); setShowReport(true); }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-50 active:bg-red-50"
                  >
                    投稿を報告する
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 画像エリア（絵文字で代替） */}
        <div
          className="w-full aspect-[4/3] flex items-center justify-center text-7xl select-none"
          style={{ background: cat.bg }}
        >
          {post.image_emoji}
        </div>

        {/* アクション */}
        <div className="flex items-center gap-4 px-4 pt-3 pb-1">
          <button onClick={handleLike} className="flex items-center gap-1.5">
            <Heart
              size={24}
              className={`transition-colors ${popping ? "heart-pop" : ""}`}
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
          <button
            onClick={() => setBookmarked((b) => !b)}
            className="ml-auto text-gray-500"
          >
            <Bookmark
              size={22}
              strokeWidth={1.8}
              fill={bookmarked ? "currentColor" : "none"}
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
