"use client";

import { useState } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const ALLOWED_DOMAIN = "@mail.kyutech.jp";
const DEMO_MODE = !supabaseConfigured;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isValidEmail = email.toLowerCase().endsWith(ALLOWED_DOMAIN);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail) {
      setErrorMsg(`@mail.kyutech.jp のメールアドレスのみ登録できます`);
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    if (DEMO_MODE) {
      // Demo mode: simulate success
      await new Promise((r) => setTimeout(r, 800));
      setStatus("sent");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      setErrorMsg("メール送信に失敗しました。しばらく経ってから再試行してください。");
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
        <div className="w-full max-w-sm text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "#E6F1FB" }}
          >
            <CheckCircle size={40} style={{ color: "#185FA5" }} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            メールを送信しました
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            <span className="font-medium text-gray-700">{email}</span>{" "}
            にログインリンクを送りました。
            <br />
            メールを開いてリンクをタップしてください。
          </p>
          {DEMO_MODE && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
              <p className="text-xs text-amber-700 font-medium mb-1">デモモード</p>
              <p className="text-xs text-amber-600">
                Supabaseが未設定のため実際のメールは送信されていません。
              </p>
            </div>
          )}
          <button
            onClick={() => setStatus("idle")}
            className="mt-6 text-sm text-gray-400 underline"
          >
            メールアドレスを変更する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="text-center mb-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl"
            style={{ background: "#185FA5" }}
          >
            🎓
          </div>
          <h1 className="text-2xl font-bold text-gray-900">キューコミュ</h1>
          <p className="text-sm text-gray-400 mt-1">九工大サークル・部活マッチング</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              大学メールアドレス
            </label>
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:border-[#185FA5] transition-colors">
              <Mail size={18} className="text-gray-400 flex-shrink-0" />
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="s00000@mail.kyutech.jp"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                className="flex-1 text-sm outline-none text-gray-800 placeholder:text-gray-300"
                required
              />
            </div>
          </div>

          {status === "error" && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-500">{errorMsg}</p>
            </div>
          )}

          {!isValidEmail && email.length > 0 && status !== "error" && (
            <p className="text-xs text-amber-600">
              ※ @mail.kyutech.jp のアドレスのみ利用できます
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium text-sm transition-opacity disabled:opacity-50"
            style={{ background: "#185FA5" }}
          >
            {status === "loading" ? (
              <span className="animate-pulse">送信中...</span>
            ) : (
              <>
                ログインリンクを送る
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6 leading-relaxed">
          九州工業大学の学生専用サービスです。
          <br />
          大学発行のメールアドレスのみ登録できます。
        </p>

        {DEMO_MODE && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
            <p className="text-xs text-blue-500">
              デモモード：Supabaseを設定するとメール認証が有効になります
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
