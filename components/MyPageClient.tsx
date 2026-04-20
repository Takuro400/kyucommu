"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Bookmark, LogOut, LogIn, PlusCircle, Users } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import BookmarkedCirclesClient from "./BookmarkedCirclesClient";
import RegisterCircleModal from "./RegisterCircleModal";
import AvatarUpload from "./AvatarUpload";
import { Circle } from "@/lib/types";

const DEMO_MODE = !supabaseConfigured;

export default function MyPageClient() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!DEMO_MODE);
  const [showRegister, setShowRegister] = useState(false);

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

  const displayEmail = DEMO_MODE ? "demo@mail.kyutech.jp" : (user?.email ?? "");
  const displayName = profileName ?? displayEmail.split("@")[0];

  return (
    <main className="px-4 py-5">
      {/* プロフィールカード */}
      <div className="bg-white rounded-2xl p-5 flex items-center gap-4 mb-4">
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

      {/* ブックマークしたサークル */}
      <div className="mb-4">
        <div className="flex items-center gap-2 px-1 mb-2">
          <Bookmark size={15} style={{ color: "#185FA5" }} />
          <p className="text-sm font-bold text-gray-800">ブックマーク中のサークル</p>
        </div>
        {user || DEMO_MODE ? (
          <BookmarkedCirclesClient userId={user?.id ?? "demo"} />
        ) : (
          <div className="bg-white rounded-2xl px-4 py-5 text-center">
            <p className="text-xs text-gray-400">ログインするとブックマークが表示されます</p>
          </div>
        )}
      </div>

      {/* サークル登録 */}
      <div className="mb-4">
        <div className="flex items-center justify-between px-1 mb-2">
          <div className="flex items-center gap-2">
            <Users size={15} style={{ color: "#185FA5" }} />
            <p className="text-sm font-bold text-gray-800">サークル登録</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4">
          <p className="text-xs text-gray-500 mb-3">
            あなたのサークル・部活をキューコミュに登録して、新入生にアピールしよう！
          </p>
          {(user || DEMO_MODE) ? (
            <button
              onClick={() => setShowRegister(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium text-sm"
              style={{ background: "#185FA5" }}
            >
              <PlusCircle size={15} />
              サークルを登録する
            </button>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm"
              style={{ background: "#E6F1FB", color: "#185FA5" }}
            >
              <LogIn size={15} />
              ログインして登録する
            </Link>
          )}
        </div>
      </div>

      {/* ログアウト */}
      {!DEMO_MODE && user && (
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 bg-white rounded-2xl active:bg-gray-50 text-red-400 mb-4"
        >
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-red-400" />
          </div>
          <span className="text-sm font-medium">ログアウト</span>
        </button>
      )}

      <p className="text-center text-xs text-gray-300 mt-2">キューコミュ v1.0.0</p>

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
