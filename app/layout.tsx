import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "キューコミュ | 九工大サークル・部活マッチング",
  description: "九州工業大学のサークル・部活動を探せるプラットフォーム。新入生と先輩をつなぐ。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#185FA5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="max-w-md mx-auto bg-white min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
