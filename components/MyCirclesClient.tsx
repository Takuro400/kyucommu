"use client";

import { useState, useEffect } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import { Users, Calendar, DollarSign, Trash2, Pencil, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import EditCircleModal from "./EditCircleModal";

interface Props {
  userId: string;
  refresh: number;
}

function StatusBadge({ status, rejectReason }: { status?: string; rejectReason?: string }) {
  if (!status || status === "pending") {
    return (
      <div className="mt-1.5 flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-600">
          <Clock size={9} /> 審査中
        </span>
      </div>
    );
  }
  if (status === "approved") {
    return (
      <div className="mt-1.5">
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-green-50 text-green-600">
          <CheckCircle size={9} /> 公開中
        </span>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="mt-1.5 flex flex-col gap-1">
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-500">
          <XCircle size={9} /> 却下
        </span>
        {rejectReason && (
          <p className="text-[10px] text-red-400 leading-snug">理由: {rejectReason}</p>
        )}
      </div>
    );
  }
  return null;
}

export default function MyCirclesClient({ userId, refresh }: Props) {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingCircle, setEditingCircle] = useState<Circle | null>(null);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    if (!supabaseConfigured) { setLoading(false); return; }

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

  function handleEditSuccess(updated: Circle) {
    setCircles((prev) => prev.map((c) => c.id === updated.id ? updated : c));
    setEditingCircle(null);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="w-5 h-5 rounded-full border-2 border-kpink border-t-transparent animate-spin" />
      </div>
    );
  }

  if (circles.length === 0) {
    return <p className="text-xs text-muted text-center py-4">まだサークルを登録していません</p>;
  }

  return (
    <>
      <div className="flex flex-col gap-2">
        {circles.map((circle) => {
          const cat = CATEGORY_MAP[circle.category];
          return (
            <div key={circle.id} className="bg-gray-50 rounded-xl p-3 flex items-start gap-2">
              <Link href={`/circle/${circle.id}`} className="flex items-start gap-3 flex-1 min-w-0 active:opacity-70">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 overflow-hidden mt-0.5"
                  style={{ background: cat.bg }}
                >
                  {circle.icon_url
                    ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
                    : circle.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-charcoal truncate">{circle.name}</p>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted">
                    <span className="flex items-center gap-0.5"><Users size={10} /> {circle.member_count}人</span>
                    <span className="flex items-center gap-0.5"><Calendar size={10} /> {circle.frequency}</span>
                    <span className="flex items-center gap-0.5"><DollarSign size={10} /> {formatFee(circle.monthly_fee)}</span>
                  </div>
                  <StatusBadge status={circle.status} rejectReason={circle.reject_reason} />
                </div>
              </Link>

              <div className="flex flex-col gap-1 flex-shrink-0">
                <button
                  onClick={() => setEditingCircle(circle)}
                  className="p-2 rounded-full hover:bg-kpink-light text-muted hover:text-kpink"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(circle.id, circle.name)}
                  disabled={deleting === circle.id}
                  className="p-2 rounded-full hover:bg-red-50 text-muted hover:text-red-400"
                >
                  {deleting === circle.id
                    ? <div className="w-3.5 h-3.5 rounded-full border-2 border-red-400 border-t-transparent animate-spin" />
                    : <Trash2 size={14} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingCircle && (
        <EditCircleModal
          circle={editingCircle}
          onClose={() => setEditingCircle(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
