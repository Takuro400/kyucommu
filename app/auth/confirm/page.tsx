"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient, supabaseConfigured } from "@/lib/supabase";

function AuthConfirmInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("ログイン中...");

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code || !supabaseConfigured) {
      router.replace("/login");
      return;
    }

    const supabase = createClient();

    supabase.auth.exchangeCodeForSession(code).then(async ({ data, error }) => {
      if (error || !data.user) {
        setMessage("ログインに失敗しました。もう一度お試しください。");
        setTimeout(() => router.replace("/login"), 2000);
        return;
      }

      // プロフィールがあるかチェック
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (profile) {
        router.replace("/");
      } else {
        router.replace("/onboarding");
      }
    });
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F8FF]">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full animate-spin mx-auto mb-4"
          style={{ border: "3px solid #185FA5", borderTopColor: "transparent" }}
        />
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8FF]">
        <div
          className="w-12 h-12 rounded-full animate-spin"
          style={{ border: "3px solid #185FA5", borderTopColor: "transparent" }}
        />
      </div>
    }>
      <AuthConfirmInner />
    </Suspense>
  );
}
