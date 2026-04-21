"use client";

import { useState } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const ALLOWED_DOMAINS = ["@mail.kyutech.jp", "@gmail.com"];
const DEMO_MODE = !supabaseConfigured;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const lower = email.toLowerCase();
  const isValidEmail = ALLOWED_DOMAINS.some((d) => lower.endsWith(d));
  const isGmail = lower.endsWith("@gmail.com");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidEmail) {
      setErrorMsg("@mail.kyutech.jp のメールアドレスのみ登録できます");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    if (DEMO_MODE) {
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
      if (error.message.includes("rate limit") || error.status === 429) {
        setErrorMsg("送信が多すぎます。数分待ってから再試行してください。");
      } else if (error.message.includes("invalid") || error.status === 400) {
        setErrorMsg("メールアドレスの形式が正しくありません。");
      } else {
        setErrorMsg(`送信エラー: ${error.message}`);
      }
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  if (status === "sent") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream">
        <div className="w-full max-w-sm text-center fade-in-up">
          <div className="w-20 h-20 rounded-full gradient-soft flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-kpink" />
          </div>
          <h1 className="text-xl font-bold text-charcoal mb-2">メールを送信しました</h1>
          <p className="text-sm text-muted leading-relaxed">
            <span className="font-semibold text-charcoal">{email}</span>{" "}
            にログインリンクを送りました。
            <br />
            メールを開いてリンクをタップしてください。
          </p>
          {DEMO_MODE && (
            <div className="mt-6 bg-terra-light border border-terra/20 rounded-2xl p-4 text-left">
              <p className="text-xs text-terra font-semibold mb-1">デモモード</p>
              <p className="text-xs text-terra/80">
                Supabaseが未設定のため実際のメールは送信されていません。
              </p>
            </div>
          )}
          <button onClick={() => setStatus("idle")} className="mt-6 text-sm text-muted underline">
            メールアドレスを変更する
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream">
      <div className="w-full max-w-sm fade-in-up">
        {/* ロゴ */}
        <div className="text-center mb-10">
          <div className="gradient-pink w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-pink">
            🎓
          </div>
          <h1 className="font-display text-3xl font-bold text-charcoal tracking-tight">
            kyucommu<span className="text-kpink">.</span>
          </h1>
          <p className="text-xs text-muted mt-1.5 tracking-wide">九工大サークル・部活マッチング</p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">大学メールアドレス</label>
            <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 focus-within:border-kpink transition-colors shadow-soft">
              <Mail size={17} className="text-muted flex-shrink-0" />
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
                className="flex-1 text-sm outline-none text-charcoal placeholder:text-muted/50"
                required
              />
            </div>
          </div>

          {status === "error" && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <AlertCircle size={15} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-400">{errorMsg}</p>
            </div>
          )}

          {!isValidEmail && email.length > 0 && status !== "error" && (
            <p className="text-xs text-terra">※ @mail.kyutech.jp のアドレスのみ利用できます</p>
          )}
          {isGmail && status !== "error" && (
            <p className="text-xs text-muted">※ Gmailはテスト用です</p>
          )}

          <button
            type="submit"
            disabled={status === "loading" || !email}
            className="gradient-pink flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-sm shadow-pink tap-scale disabled:opacity-50"
          >
            {status === "loading" ? (
              <span className="animate-pulse">送信中...</span>
            ) : (
              <>ログインリンクを送る <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <p className="text-xs text-muted text-center mt-6 leading-relaxed">
          九州工業大学の学生専用サービスです。
          <br />
          大学発行のメールアドレスのみ登録できます。
        </p>

        {DEMO_MODE && (
          <div className="mt-4 bg-kpink-light rounded-2xl p-3 text-center">
            <p className="text-xs text-kpink">
              デモモード：Supabaseを設定するとメール認証が有効になります
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
