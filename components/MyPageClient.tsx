"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { User, Bookmark, Bell, ChevronRight, LogOut, LogIn } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";

const DEMO_MODE = !supabaseConfigured;

const MENU_ITEMS = [
  { icon: Bookmark, label: "保存した投稿", sub: "ブックマーク一覧" },
  { icon: Bell, label: "通知設定", sub: "新着情報のお知らせ" },
];

export default function MyPageClient() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(!DEMO_MODE);

  useEffect(() => {
    if (DEMO_MODE) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
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
          <User size={36} className="text-gray-400" />
        </div>
        <p className="text-base font-medium text-gray-700 mb-2">ログインしていません</p>
        <p className="text-sm text-gray-400 mb-6">
          ログインすると、気になるサークルをブックマークしたり、先輩と直接やりとりできます。
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
  const displayName = displayEmail.split("@")[0];

  return (
    <main className="px-4 py-5">
      {/* プロフィールカード */}
      <div className="bg-white rounded-2xl p-5 flex items-center gap-4 mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: "#E6F1FB" }}
        >
          🎓
        </div>
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

      {/* メニュー */}
      <div className="bg-white rounded-2xl overflow-hidden mb-4">
        {MENU_ITEMS.map(({ icon: Icon, label, sub }, i) => (
          <button
            key={label}
            className={`w-full flex items-center gap-3 px-4 py-4 active:bg-gray-50 ${
              i < MENU_ITEMS.length - 1 ? "border-b border-gray-100" : ""
            }`}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "#E6F1FB" }}
            >
              <Icon size={16} style={{ color: "#185FA5" }} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        ))}
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
    </main>
  );
}
