"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Users, Calendar, DollarSign, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { MOCK_CIRCLES, MOCK_EVENTS } from "@/lib/mockData";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import { parseISO, format } from "date-fns";
import { ja } from "date-fns/locale";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Circle, Event } from "@/lib/types";

export default function CircleDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [circle, setCircle] = useState<Circle | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (supabaseConfigured) {
        const supabase = createClient();
        const { data } = await supabase.from("circles").select("*").eq("id", id).maybeSingle();
        if (data) {
          setCircle(data as Circle);
          const { data: evs } = await supabase.from("events").select("*").eq("circle_id", id);
          setEvents((evs as Event[]) ?? []);
          setLoading(false);
          return;
        }
      }
      // fallback to mock
      const mock = MOCK_CIRCLES.find((c) => c.id === id) ?? null;
      setCircle(mock);
      setEvents(MOCK_EVENTS.filter((e) => e.circle_id === id));
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-2 border-[#185FA5] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-gray-500 mb-4">サークルが見つかりませんでした</p>
        <Link href="/search" className="text-[#185FA5] text-sm">探すページへ戻る</Link>
      </div>
    );
  }

  const cat = CATEGORY_MAP[circle.category];

  return (
    <div className="pb-8">
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40 flex items-center gap-3 px-4 py-3">
        <Link href="/search" className="p-1.5 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <p className="text-base font-medium text-gray-900">{circle.name}</p>
      </header>

      {/* ヒーロー */}
      <div className="w-full aspect-[16/7] flex items-center justify-center overflow-hidden" style={{ background: cat.bg }}>
        {circle.icon_url
          ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
          : <span className="text-8xl">{circle.emoji}</span>}
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-xl font-bold text-gray-900">{circle.name}</h1>
          <div className="flex gap-1 flex-wrap justify-end">
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: cat.bg, color: cat.text }}>
              {cat.label}
            </span>
            {circle.beginner_ok && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-700">初心者歓迎</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { icon: Users, label: "部員数", value: `${circle.member_count}人` },
            { icon: Calendar, label: "活動頻度", value: circle.frequency },
            { icon: DollarSign, label: "月会費", value: formatFee(circle.monthly_fee) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3 text-center">
              <Icon size={16} className="mx-auto mb-1 text-gray-400" />
              <p className="text-base font-bold text-gray-900">{value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {circle.location && (
          <p className="text-xs text-gray-500 mb-3">📍 {circle.location}</p>
        )}

        <p className="text-sm text-gray-700 leading-relaxed mb-5">{circle.description}</p>

        {/* 新歓イベント */}
        {events.length > 0 && (
          <div className="mb-5">
            <p className="text-sm font-medium text-gray-900 mb-2">新歓イベント</p>
            <div className="flex flex-col gap-2">
              {events.map((ev) => (
                <div key={ev.id} className="rounded-xl p-3" style={{ background: "#E6F1FB" }}>
                  <p className="text-sm font-medium" style={{ color: "#0C447C" }}>{ev.title}</p>
                  <p className="text-xs mt-1" style={{ color: "#185FA5" }}>
                    {format(parseISO(ev.event_date), "M月d日(E)", { locale: ja })}
                    {ev.start_time}〜{ev.end_time}　／　{ev.location}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SNSリンク */}
        {(circle.instagram_url || circle.twitter_url || circle.line_url || circle.sns_url) && (
          <div className="mb-5 flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-900">連絡先・SNS</p>
            {circle.instagram_url && (
              <a href={circle.instagram_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#185FA5] bg-blue-50 px-4 py-2.5 rounded-xl">
                <span>📸</span> Instagram <ExternalLink size={12} className="ml-auto" />
              </a>
            )}
            {circle.twitter_url && (
              <a href={circle.twitter_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#185FA5] bg-blue-50 px-4 py-2.5 rounded-xl">
                <span>🐦</span> Twitter / X <ExternalLink size={12} className="ml-auto" />
              </a>
            )}
            {circle.line_url && (
              <a href={circle.line_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[#185FA5] bg-blue-50 px-4 py-2.5 rounded-xl">
                <span>💬</span> LINEオープンチャット <ExternalLink size={12} className="ml-auto" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
