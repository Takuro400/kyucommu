import { NextResponse } from "next/server";

// マジックリンクのcodeをクライアントサイドの確認ページに渡す
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    // クライアントサイドでセッションを処理させる
    return NextResponse.redirect(`${origin}/auth/confirm?code=${code}`);
  }

  return NextResponse.redirect(`${origin}/login`);
}
