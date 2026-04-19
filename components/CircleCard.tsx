import { Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import Link from "next/link";
import { Users } from "lucide-react";

interface Props {
  circle: Circle;
}

export default function CircleCard({ circle }: Props) {
  const cat = CATEGORY_MAP[circle.category];
  return (
    <Link href={`/circle/${circle.id}`}>
      <div className="bg-white rounded-xl p-4 flex items-center gap-3 active:opacity-70 transition-opacity">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: cat.bg }}
        >
          {circle.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{circle.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {circle.frequency}　{formatFee(circle.monthly_fee)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span
              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{ background: cat.bg, color: cat.text }}
            >
              {cat.label}
            </span>
            {circle.beginner_ok && (
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700">
                初心者歓迎
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 text-gray-400 flex-shrink-0">
          <Users size={13} />
          <span className="text-xs">{circle.member_count}</span>
        </div>
      </div>
    </Link>
  );
}
