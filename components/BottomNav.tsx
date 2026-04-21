"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, User } from "lucide-react";

const NAV = [
  { href: "/",         icon: Home,         label: "ホーム" },
  { href: "/search",   icon: Search,       label: "探す" },
  { href: "/calendar", icon: CalendarDays, label: "カレンダー" },
  { href: "/mypage",   icon: User,         label: "マイページ" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-50">
      <div className="bg-white/85 backdrop-blur-xl border-t border-kpink/10 flex px-2 pt-1 pb-4">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center gap-0.5 py-1.5 tap-scale"
            >
              <div className={`flex items-center justify-center w-11 h-7 rounded-full transition-all duration-200 ${active ? "bg-kpink/15" : ""}`}>
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.8}
                  className={`transition-colors duration-200 ${active ? "text-kpink" : "text-muted"}`}
                />
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? "text-kpink font-semibold" : "text-muted"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
