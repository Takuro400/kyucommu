"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Bell, ChevronRight, LogOut, LogIn, PlusCircle, Bookmark, Users } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import BookmarkedPostsClient from "./BookmarkedPostsClient";
import RegisterCircleModal from "./RegisterCircleModal";
import AvatarUpload from "./AvatarUpload";
import MyCirclesClient from "./MyCirclesClient";
import { Circle } from "@/lib/types";

const DEMO_MODE = !supabaseConfigured;

export default function MyPageClient() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [showRegister, setShowRegister] = useState(false);
  const [circleRefresh, setCircleRefresh] = useState(0);

  useEffect(() => {
    if (DEMO_MODE) return;
    const supabase = createClient();

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setProfileName(profile?.display_name ?? null);
        setAvatarUrl(profile?.avatar_url ?? null);
      }
      setLoading(false);
    }
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    if (DEMO_MODE) return;
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }

  function handleCircleRegistered(circle: Circle) {
    setCircleRefresh((n) => n + 1);
    console.log("新規サークル登録:", circle.name);
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-[#185FA5] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!user && !DEMO_MODE) {
    return (
      <main className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <LogIn size={36} className="text-gray-400" />
        </div>
        <p className="text-base font-medium text-gray-700 mb-2">ログインしていません</p>
        <p className="text-sm text-gray-400 mb-6">
          ログインすると、気になるサークルをブックマークしたり、サークルを登録できます。
        </p>
        <Link
          href="/login"
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium text-sm"
          style={{ background: "#185FA5" }}
        >
          <LogIn size={16} />
          ログイン／新規登録
        </Link>
      </main>
    );
  }

  const displayEmail = DEMO_MODE ? "demo@mail.kyutech.ac.jp" : (user?.email ?? "");
  const displayName = profileName ?? displayEmail.split("@")[0];

  return (
    <main className="px-4 py-5">
      {/* プロフィールカード */}
      <div className="bg-white rounded-2xl p-5 flex items-center gap-4 mb-4">
        {/* アバター（タップで写真変更） */}
        {user && !DEMO_MODE ? (
          <AvatarUpload
            userId={user.id}
            avatarUrl={avatarUrl}
            onUpload={(url) => setAvatarUrl(url)}
          />
        ) : (
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: "#E6F1FB" }}
          >
            🎓
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-gray-900 truncate">{displayName}</p>
          <p className="text-xs text-gray-400 truncate mt-0.5">{displayEmail}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: "#E6F1FB", color: "#185FA5" }}
            >
              九工大生
            </span>
            {DEMO_MODE && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">
                デモ
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 自分のサークル */}
      <div className="mb-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2">
            <Users size={15} style={{ color: "#185FA5" }} />
            <p className="text-sm font-bold text-gray-800">自分のサークル</p>
          </div>
          {(user || DEMO_MODE) && (
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full"
              style={{ background: "#E6F1FB", color: "#185FA5" }}
            >
              <PlusCircle size={13} />
              登録する
            </button>
          )}
        </div>
        <div className="bg-white rounded-2xl px-3 py-3">
          {user ? (
            <MyCirclesClient userId={user.id} refresh={circleRefresh} />
          ) : (
            <p className="text-xs text-gray-400 text-center py-3">
              ログインするとサークルを登録できます
            </p>
          )}
        </div>
      </div>

      {/* 保存した投稿 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 px-1 mb-2">
          <Bookmark size={15} style={{ color: "#185FA5" }} />
          <p className="text-sm font-bold text-gray-800">保存した投稿</p>
        </div>
        {user ? (
          <BookmarkedPostsClient userId={user.id} />
        ) : (
          <div className="bg-white rounded-2xl px-4 py-5 text-center">
            <p className="text-xs text-gray-400">ログインすると保存した投稿が表示されます</p>
          </div>
        )}
      </div>

      {/* メニュー */}
      <div className="bg-white rounded-2xl overflow-hidden mb-4">
        <button className="w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "#E6F1FB" }}
          >
            <Bell size={16} style={{ color: "#185FA5" }} />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-gray-800">通知設定</p>
            <p className="text-xs text-gray-400">新着情報のお知らせ</p>
          </div>
          <ChevronRight size={16} className="text-gray-300" />
        </button>
      </div>

      {/* ログアウト */}
      {!DEMO_MODE && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl active:bg-gray-50 text-red-400"
        >
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-red-400" />
          </div>
          <span className="text-sm font-medium">ログアウト</span>
        </button>
      )}

      <p className="text-center text-xs text-gray-300 mt-6">キューコミュ v1.0.0</p>

      {/* サークル登録モーダル */}
      {showRegister && user && (
        <RegisterCircleModal
          userId={user.id}
          onClose={() => setShowRegister(false)}
          onSuccess={(circle) => {
            handleCircleRegistered(circle);
            setShowRegister(false);
          }}
        />
      )}
    </main>
  );
}
