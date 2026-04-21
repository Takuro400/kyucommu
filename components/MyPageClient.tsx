"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Bookmark, LogOut, LogIn, PlusCircle, Users, Save, Pencil, X, Check } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import BookmarkedCirclesClient from "./BookmarkedCirclesClient";
import RegisterCircleModal from "./RegisterCircleModal";
import AvatarUpload from "./AvatarUpload";
import MyCirclesClient from "./MyCirclesClient";
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
  const [circleRefresh, setCircleRefresh] = useState(0);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [nameSaving, setNameSaving] = useState(false);
  const [nameMsg, setNameMsg] = useState<string | null>(null);

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

  function startEditName(current: string) {
    setNameInput(current);
    setEditingName(true);
    setNameMsg(null);
  }

  function cancelEditName() {
    setEditingName(false);
    setNameMsg(null);
  }

  async function saveDisplayName() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameMsg("ニックネームを入力してください"); return; }
    if (trimmed.length > 20) { setNameMsg("20文字以内で入力してください"); return; }
    if (!user || DEMO_MODE) return;
    setNameSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("user_id", user.id);
    setNameSaving(false);
    if (error) {
      setNameMsg("保存に失敗しました");
    } else {
      setProfileName(trimmed);
      setEditingName(false);
      setNameMsg("保存しました");
      setTimeout(() => setNameMsg(null), 2000);
    }
  }

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
      .update({
        grade: grade || null,
        faculty: faculty || null,
        department: department || null,
      })
      .eq("user_id", user.id);
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
    setCircleRefresh((n) => n + 1);
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-2 border-kpink border-t-transparent animate-spin" />
      </main>
    );
  }

  if (!user && !DEMO_MODE) {
    return (
      <main className="flex flex-col items-center justify-center py-20 px-8 text-center">
        <div className="w-20 h-20 rounded-full gradient-soft flex items-center justify-center mb-4">
          <LogIn size={32} className="text-kpink" />
        </div>
        <p className="text-base font-semibold text-charcoal mb-2">ログインしていません</p>
        <p className="text-sm text-muted mb-6 leading-relaxed">
          ログインすると、気になるサークルをブックマークしたり、サークルを登録できます。
        </p>
        <Link
          href="/login"
          className="gradient-pink flex items-center gap-2 px-7 py-3 rounded-2xl text-white font-semibold text-sm shadow-pink tap-scale"
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

  const selectClass = "w-full text-sm px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-charcoal focus:outline-none focus:border-kpink transition-colors";

  return (
    <main className="px-4 py-5 flex flex-col gap-4">

      {/* プロフィールカード */}
      <div className="card p-5">
        <div className="flex items-center gap-4 mb-5">
          {user && !DEMO_MODE ? (
            <div className="ring-2 ring-kpink ring-offset-2 rounded-full flex-shrink-0">
              <AvatarUpload
                userId={user.id}
                avatarUrl={avatarUrl}
                onUpload={(url) => setAvatarUrl(url)}
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full gradient-soft flex items-center justify-center text-2xl flex-shrink-0 ring-2 ring-kpink ring-offset-2">
              🎓
            </div>
          )}

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  maxLength={20}
                  autoFocus
                  className="text-sm font-bold border border-kpink rounded-xl px-2.5 py-1.5 w-full focus:outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={saveDisplayName}
                    disabled={nameSaving}
                    className="gradient-pink flex items-center gap-1 text-[11px] px-3 py-1 rounded-full text-white font-semibold tap-scale"
                  >
                    <Check size={11} />
                    {nameSaving ? "保存中..." : "保存"}
                  </button>
                  <button
                    onClick={cancelEditName}
                    className="flex items-center gap-1 text-[11px] px-3 py-1 rounded-full bg-gray-100 text-muted font-semibold tap-scale"
                  >
                    <X size={11} />
                    キャンセル
                  </button>
                </div>
                {nameMsg && <p className="text-[10px] text-red-400">{nameMsg}</p>}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-bold text-charcoal truncate">{displayName}</p>
                  {user && !DEMO_MODE && (
                    <button
                      onClick={() => startEditName(displayName)}
                      className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 text-muted tap-scale"
                    >
                      <Pencil size={12} />
                    </button>
                  )}
                </div>
                {nameMsg && <p className="text-[10px] text-green-500 mt-0.5">{nameMsg}</p>}
                <p className="text-xs text-muted truncate mt-0.5">{displayEmail}</p>
                <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-kpink-light text-kpink">
                    九工大生
                  </span>
                  {grade && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-muted">
                      {grade}
                    </span>
                  )}
                  {department && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-gray-100 text-muted">
                      {department}
                    </span>
                  )}
                  {DEMO_MODE && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-terra-light text-terra">
                      デモ
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* 学年・学部・類 */}
        <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">学年</label>
            <select value={grade} onChange={(e) => handleGradeChange(e.target.value)} disabled={DEMO_MODE} className={selectClass}>
              <option value="">未設定</option>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {firstYear && (
            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">学部</label>
              <select value={faculty} onChange={(e) => handleFacultyChange(e.target.value)} disabled={DEMO_MODE} className={selectClass}>
                <option value="">未設定</option>
                {Object.keys(FACULTY_DEPARTMENTS).map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          )}

          {grade && (
            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">類</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={(firstYear && !faculty) || DEMO_MODE}
                className={selectClass + " disabled:opacity-40"}
              >
                <option value="">未設定</option>
                {deptOptions.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {user && !DEMO_MODE && (
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="gradient-pink flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold tap-scale"
            >
              <Save size={14} />
              {saving ? "保存中..." : saveMsg ?? "保存する"}
            </button>
          )}
        </div>
      </div>

      {/* 自分のサークル */}
      {user && (
        <div>
          <div className="flex items-center justify-between px-1 mb-2.5">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-kpink" />
              <p className="text-sm font-bold text-charcoal">自分のサークル</p>
            </div>
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-kpink-light text-kpink tap-scale"
            >
              <PlusCircle size={13} />
              登録する
            </button>
          </div>
          <div className="card px-3 py-3">
            <MyCirclesClient userId={user.id} refresh={circleRefresh} />
          </div>
        </div>
      )}

      {/* ブックマーク */}
      <div>
        <div className="flex items-center gap-2 px-1 mb-2.5">
          <Bookmark size={15} className="text-kpink" />
          <p className="text-sm font-bold text-charcoal">ブックマーク中のサークル</p>
        </div>
        {user || DEMO_MODE ? (
          <BookmarkedCirclesClient userId={user?.id ?? "demo"} />
        ) : (
          <div className="card px-4 py-5 text-center">
            <p className="text-xs text-muted">ログインするとブックマークが表示されます</p>
          </div>
        )}
      </div>

      {/* サークル登録CTA */}
      <div className="card p-4">
        <p className="text-xs text-muted mb-3 leading-relaxed">
          あなたのサークル・部活をキューコミュに登録して、新入生にアピールしよう！
        </p>
        {(user || DEMO_MODE) ? (
          <button
            onClick={() => setShowRegister(true)}
            className="gradient-warm w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm tap-scale"
          >
            <PlusCircle size={15} />
            サークルを登録する
          </button>
        ) : (
          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm bg-kpink-light text-kpink tap-scale"
          >
            <LogIn size={15} />
            ログインして登録する
          </Link>
        )}
      </div>

      {/* ログアウト */}
      {!DEMO_MODE && user && (
        <button
          onClick={handleLogout}
          className="card w-full flex items-center gap-3 px-4 py-4 tap-scale"
        >
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <LogOut size={16} className="text-red-400" />
          </div>
          <span className="text-sm font-medium text-red-400">ログアウト</span>
        </button>
      )}

      <p className="text-center text-xs text-muted/50 pb-2">キューコミュ v1.0.0</p>

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
