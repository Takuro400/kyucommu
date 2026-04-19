import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = cookies();

    // Supabaseが設定したいCookieを一時保存するリスト
    const pendingCookies: { name: string; value: string; options?: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            // NextResponseに直接セットするため一時保存
            pendingCookies.push(...cookiesToSet);
          },
        },
      }
    );

    const { data } = await supabase.auth.exchangeCodeForSession(code);

    // リダイレクト先を決める
    let redirectTo = `${origin}/`;

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!profile) {
        redirectTo = `${origin}/onboarding`;
      }
    }

    // NextResponseを作ってからCookieをセット（これが重要！）
    const response = NextResponse.redirect(redirectTo);
    pendingCookies.forEach(({ name, value, options }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response.cookies.set(name, value, options as any);
    });
    return response;
  }

  return NextResponse.redirect(`${origin}/login`);
}
