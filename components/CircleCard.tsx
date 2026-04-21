import { Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import Link from "next/link";
import { Users } from "lucide-react";
import CircleBookmarkButton from "./CircleBookmarkButton";

interface Props {
  circle: Circle;
  showBookmark?: boolean;
}

export default function CircleCard({ circle, showBookmark = true }: Props) {
  const cat = CATEGORY_MAP[circle.category];
  return (
    <div className="card flex items-center overflow-hidden tap-scale">
      <Link href={`/circle/${circle.id}`} className="flex items-center gap-3.5 flex-1 min-w-0 p-4">
        {/* アイコン */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
          style={{ background: cat.bg }}
        >
          {circle.icon_url
            ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
            : <span>{circle.emoji}</span>}
        </div>

        {/* 情報 */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-charcoal truncate">{circle.name}</p>
          <p className="text-xs text-muted mt-0.5 truncate">
            {circle.frequency}　{formatFee(circle.monthly_fee)}
          </p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span
              className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold"
              style={{ background: cat.bg, color: cat.text }}
            >
              {cat.label}
            </span>
            {circle.beginner_ok && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold bg-terra-light text-terra">
                初心者歓迎
              </span>
            )}
          </div>
        </div>

        {/* 部員数 */}
        <div className="flex items-center gap-1 text-muted flex-shrink-0 mr-1">
          <Users size={12} />
          <span className="text-xs font-medium">{circle.member_count}</span>
        </div>
      </Link>
      {showBookmark && <CircleBookmarkButton circleId={circle.id} />}
    </div>
  );
}
