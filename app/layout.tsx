import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP, DM_Sans } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm",
  display: "swap",
});

export const metadata: Metadata = {
  title: "キューコミュ | 九工大サークル・部活マッチング",
  description: "九州工業大学のサークル・部活動を探せるプラットフォーム。新入生と先輩をつなぐ。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F2A7BB",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={`${notoSansJP.variable} ${dmSans.variable}`}>
      <body className="max-w-[430px] mx-auto bg-cream min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
