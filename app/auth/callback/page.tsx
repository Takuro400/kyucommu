"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";

function AuthCallbackInner() {
  const router = useRouter();
  const [message, setMessage] = useState("ログイン中...");

  useEffect(() => {
    if (!supabaseConfigured) {
      router.replace("/login");
      return;
    }

    const supabase = createClient();

    // implicit flow: Supabase がURLハッシュ (#access_token=...) を自動検出して
    // onAuthStateChange で SIGNED_IN イベントを発火する
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          subscription.unsubscribe();

          // 初回ログインかチェック
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("user_id", session.user.id)
            .maybeSingle();

          router.replace(profile ? "/" : "/onboarding");
        }
      }
    );

    // すでにセッションがある場合のフォールバック
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        subscription.unsubscribe();
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle();
        router.replace(profile ? "/" : "/onboarding");
      }
    });

    // 15秒タイムアウト
    const timeout = setTimeout(() => {
      subscription.unsubscribe();
      setMessage("ログインに失敗しました。もう一度メールを送り直してください。");
      setTimeout(() => router.replace("/login"), 3000);
    }, 15000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F8FF]">
      <div className="text-center px-6">
        <div
          className="w-12 h-12 rounded-full animate-spin mx-auto mb-4"
          style={{ border: "3px solid #185FA5", borderTopColor: "transparent" }}
        />
        <p className="text-sm text-gray-500">{message}</p>
        {message.includes("失敗") && (
          <button
            onClick={() => router.replace("/login")}
            className="mt-4 text-sm text-[#185FA5] underline"
          >
            ログイン画面に戻る
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F5F8FF]">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{ border: "3px solid #185FA5", borderTopColor: "transparent" }}
          />
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}
