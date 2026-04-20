import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const isConfigured =
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("placeholder") &&
    !SUPABASE_URL.includes("your_") &&
    SUPABASE_ANON_KEY.length > 20;

  // Supabase未設定（デモモード）はそのまま通す
  if (!isConfigured) return NextResponse.next({ request });

  try {
    let supabaseResponse = NextResponse.next({ request });

    // Cookieのリフレッシュのみ行う（ページリダイレクトはしない）
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options as any)
          );
        },
      },
    });

    // セッションのCookieをリフレッシュするだけ（強制リダイレクトなし）
    await supabase.auth.getUser();

    return supabaseResponse;
  } catch {
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
