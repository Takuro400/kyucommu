"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import { Users, Calendar, DollarSign, Trash2 } from "lucide-react";
import Link from "next/link";

interface Props {
  userId: string;
  refresh: number; // 外から増やすと再取得
}

export default function MyCirclesClient({ userId, refresh }: Props) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    if (!supabaseConfigured) {
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase
      .from("circles")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCircles((data as Circle[]) ?? []);
        setLoading(false);
      });
  }, [userId, refresh]);

  async function handleDelete(circleId: string, circleName: string) {
    if (!confirm(`「${circleName}」を削除しますか？`)) return;
    setDeleting(circleId);

    const supabase = createClient();
    await supabase.from("circles").delete().eq("id", circleId);
    setCircles((prev) => prev.filter((c) => c.id !== circleId));
    setDeleting(null);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-5 h-5 rounded-full border-2 border-[#185FA5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (circles.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-4">
        まだサークルを登録していません
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {circles.map((circle) => {
        const cat = CATEGORY_MAP[circle.category];
        return (
          <div key={circle.id} className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <Link href={`/circle/${circle.id}`} className="flex items-center gap-3 flex-1 min-w-0 active:opacity-70">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: cat.bg }}
              >
                {circle.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{circle.name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
                  <span className="flex items-center gap-0.5">
                    <Users size={10} /> {circle.member_count}人
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Calendar size={10} /> {circle.frequency}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <DollarSign size={10} /> {formatFee(circle.monthly_fee)}
                  </span>
                </div>
                <span
                  className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium mt-1"
                  style={{ background: cat.bg, color: cat.text }}
                >
                  {cat.label}
                </span>
              </div>
            </Link>
            {/* 削除ボタン */}
            <button
              onClick={() => handleDelete(circle.id, circle.name)}
              disabled={deleting === circle.id}
              className="p-2 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 flex-shrink-0"
            >
              {deleting === circle.id ? (
                <div className="w-4 h-4 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
}
