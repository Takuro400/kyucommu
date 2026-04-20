"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Bookmark, LogOut, LogIn, PlusCircle, Users, Save } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import BookmarkedCirclesClient from "./BookmarkedCirclesClient";
import RegisterCircleModal from "./RegisterCircleModal";
import AvatarUpload from "./AvatarUpload";
import { Circle } from "@/lib/types";

const DEMO_MODE = !supabaseConfigured;

const GRADES = ["1年生", "2年生", "3年生", "4年生", "大学院生"];

const FACULTY_DEPARTMENTS: Record<string, string[]> = {
  "工学部": ["建設社会類", "機械類", "電気類", "物質理工学類", "総合類"],
  "情報工学部": ["知能情報類", "電子情報通信類", "知的システム類", "生命情報類"],
};

const UPPER_DEPARTMENTS = ["Ⅰ類", "Ⅱ類", "Ⅲ類", "Ⅳ類", "Ⅴ類"];

export default function MyPageClient() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [grade, setGrade] = useState<string>("");
  const [faculty, setFaculty] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
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
          .select("display_name, avatar_url, grade, faculty, department")
          .eq("user_id", data.user.id)
          .maybeSingle();
        setProfileName(profile?.display_name ?? null);
        setAvatarUrl(profile?.avatar_url ?? null);
        setGrade(profile?.grade ?? "");
        setFaculty(profile?.faculty ?? "");
        setDepartment(profile?.department ?? "");
      }
      setLoading(false);
    }
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  function handleGradeChange(val: string) {
    setGrade(val);
    setFaculty("");
    setDepartment("");
  }

  function handleFacultyChange(val: string) {
    setFaculty(val);
    setDepartment("");
  }

  async function handleSaveProfile() {
    if (!user || DEMO_MODE) return;
    setSaving(true);
    setSaveMsg(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          grade: grade || null,
          faculty: faculty || null,
          department: department || null,
        },
        { onConflict: "user_id" }
      );
    setSaving(false);
    if (error) {
      console.error("プロフィール保存エラー:", error.message, error.code);
      setSaveMsg(`失敗: ${error.message}`);
    } else {
      setSaveMsg("保存しました！");
    }
    setTimeout(() => setSaveMsg(null), 3000);
  }

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
  const firstYear = grade === "1年生";
  const deptOptions = firstYear
    ? (faculty ? FACULTY_DEPARTMENTS[faculty] ?? [] : [])
    : UPPER_DEPARTMENTS;

  return (
    <main className="px-4 py-5">
      {/* プロフィールカード */}
      <div className="bg-white rounded-2xl p-5 mb-4">
        <div className="flex items-center gap-4 mb-4">
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
            <div className="flex items-center gap-1 mt-1.5 flex-wrap">
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: "#E6F1FB", color: "#185FA5" }}
              >
                九工大生
              </span>
              {grade && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                  {grade}
                </span>
              )}
              {department && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">
                  {department}
                </span>
              )}
              {DEMO_MODE && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-600">
                  デモ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 学年・学部・類の選択 */}
        <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">

          {/* 学年 */}
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">学年</label>
            <select
              value={grade}
              onChange={(e) => handleGradeChange(e.target.value)}
              disabled={DEMO_MODE}
              className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-[#185FA5]"
            >
              <option value="">未設定</option>
              {GRADES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* 学部（1年生のみ表示） */}
          {firstYear && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">学部</label>
              <select
                value={faculty}
                onChange={(e) => handleFacultyChange(e.target.value)}
                disabled={DEMO_MODE}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-[#185FA5]"
              >
                <option value="">未設定</option>
                {Object.keys(FACULTY_DEPARTMENTS).map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          )}

          {/* 類（学年が選ばれていれば表示） */}
          {grade && (
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">類</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={(firstYear && !faculty) || DEMO_MODE}
                className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 focus:outline-none focus:border-[#185FA5] disabled:opacity-40"
              >
                <option value="">未設定</option>
                {deptOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* 保存ボタン */}
          {user && !DEMO_MODE && (
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-medium transition-opacity active:opacity-80"
              style={{ background: "#185FA5" }}
            >
              <Save size={14} />
              {saving ? "保存中..." : saveMsg ?? "保存する"}
            </button>
          )}
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
