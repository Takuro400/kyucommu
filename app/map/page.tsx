"use client";

import dynamic from "next/dynamic";
import BottomNav from "@/components/BottomNav";
import { CAMPUS_LOCATIONS, MOCK_CIRCLES } from "@/lib/mockData";
import { MapPin } from "lucide-react";

// Leaflet は SSR 不可のため dynamic import
const CampusMap = dynamic(() => import("@/components/CampusMap"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-[#185FA5] border-t-transparent animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">マップを読み込み中...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div className="flex flex-col h-screen pb-16">
      {/* ヘッダー */}
      <header className="flex-shrink-0 bg-white border-b border-gray-100 z-10 px-4 py-3">
        <div className="flex items-center gap-2">
          <MapPin size={18} style={{ color: "#185FA5" }} />
          <div>
            <p className="text-base font-bold text-gray-900 leading-tight">
              キャンパスマップ
            </p>
            <p className="text-[10px] text-gray-400">
              九工大 戸畑キャンパス — ピンをタップで詳細表示
            </p>
          </div>
        </div>
      </header>

      {/* マップ（残りの高さをすべて使う） */}
      <div className="flex-1 relative">
        <CampusMap locations={CAMPUS_LOCATIONS} circles={MOCK_CIRCLES} />
      </div>

      <BottomNav />
    </div>
  );
}
