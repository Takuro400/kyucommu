"use client";

import { Circle } from "@/lib/types";
import Link from "next/link";

interface Props {
  circles: Circle[];
}

export default function StoryBar({ circles }: Props) {
  return (
    <div className="flex gap-3 px-4 py-3 overflow-x-auto scrollbar-hide bg-white border-b border-gray-100">
      {/* 追加ボタン */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer">
        <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xl">
          ＋
        </div>
        <span className="text-[10px] text-gray-400 w-14 text-center truncate">登録する</span>
      </div>

      {circles.map((c) => (
        <Link key={c.id} href={`/circle/${c.id}`} className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="w-14 h-14 rounded-full p-0.5"
            style={{ background: "linear-gradient(135deg, #185FA5, #1D9E75)" }}>
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-2xl">
              {c.emoji}
            </div>
          </div>
          <span className="text-[10px] text-gray-500 w-14 text-center truncate">{c.name.substring(0, 5)}</span>
        </Link>
      ))}
    </div>
  );
}
