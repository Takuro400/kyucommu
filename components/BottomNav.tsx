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
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-gray-200 flex z-50">
      {NAV.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] transition-colors
              ${active ? "text-[#185FA5]" : "text-gray-400 hover:text-gray-600"}`}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
