"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { User, ArrowRight, CheckCircle } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // デモモードならホームへ
    if (!supabaseConfigured) {
      router.replace("/");
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUserId(data.user.id);

      // すでにプロフィールがあればホームへ
      supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle()
        .then(({ data: profile }) => {
          if (profile) router.replace("/");
        });
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (trimmed.length < 2) {
      setError("2文字以上で入力してください");
      return;
    }
    if (trimmed.length > 20) {
      setError("20文字以内で入力してください");
      return;
    }
    if (!userId) return;

    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({ user_id: userId, display_name: trimmed });

    if (insertError) {
      setError("保存できませんでした。もう一度お試しください。");
      setLoading(false);
      return;
    }

    setDone(true);
    setTimeout(() => router.replace("/"), 1200);
  }

  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F8FF] px-6">
        <CheckCircle size={56} className="text-[#185FA5] mb-4" />
        <p className="text-lg font-bold text-gray-800">ようこそ、{displayName.trim()}さん！</p>
        <p className="text-sm text-gray-400 mt-1">アプリに移動中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F8FF] px-6">
      {/* アイコン */}
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-md"
        style={{ background: "#185FA5" }}
      >
        <User size={36} color="white" />
      </div>

      {/* タイトル */}
      <h1 className="text-xl font-bold text-gray-900 mb-1 text-center">
        ニックネームを設定しよう
      </h1>
      <p className="text-sm text-gray-400 text-center mb-8">
        キューコミュで表示される名前を決めてください（後から変更できます）
      </p>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm flex flex-col gap-4">
        <div>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="例：たくみ、T.Tanaka"
            maxLength={20}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#185FA5] focus:border-transparent"
            autoFocus
          />
          <div className="flex justify-between items-center mt-1.5 px-1">
            {error ? (
              <p className="text-xs text-red-400">{error}</p>
            ) : (
              <p className="text-xs text-gray-400">2〜20文字</p>
            )}
            <p className="text-xs text-gray-300">{displayName.length}/20</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || displayName.trim().length < 2}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-semibold text-sm transition-opacity disabled:opacity-40"
          style={{ background: "#185FA5" }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              キューコミュをはじめる
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
