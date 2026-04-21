"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Users, Calendar, DollarSign, ExternalLink, MapPin } from "lucide-react";
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
      const mock = MOCK_CIRCLES.find((c) => c.id === id) ?? null;
      setCircle(mock);
      setEvents(MOCK_EVENTS.filter((e) => e.circle_id === id));
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-cream">
        <div className="w-8 h-8 rounded-full border-2 border-kpink border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!circle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream px-4">
        <p className="text-muted mb-4">サークルが見つかりませんでした</p>
        <Link href="/search" className="text-kpink text-sm font-medium">探すページへ戻る</Link>
      </div>
    );
  }

  const cat = CATEGORY_MAP[circle.category];

  return (
    <div className="pb-8 bg-cream min-h-screen">
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white/85 backdrop-blur-xl border-b border-kpink/10 z-40 flex items-center gap-3 px-4 pt-12 pb-3">
        <Link href="/search" className="p-2 rounded-full bg-gray-100 tap-scale">
          <ArrowLeft size={18} className="text-charcoal" />
        </Link>
        <p className="text-base font-semibold text-charcoal truncate">{circle.name}</p>
      </header>

      {/* ヒーロー */}
      <div
        className="w-full aspect-[16/7] flex items-center justify-center overflow-hidden"
        style={{ background: cat.bg }}
      >
        {circle.icon_url
          ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
          : <span className="text-8xl">{circle.emoji}</span>}
      </div>

      <div className="px-4 py-5 flex flex-col gap-4">

        {/* タイトル＋バッジ */}
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-xl font-bold text-charcoal">{circle.name}</h1>
          <div className="flex gap-1.5 flex-wrap justify-end flex-shrink-0">
            <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold" style={{ background: cat.bg, color: cat.text }}>
              {cat.label}
            </span>
            {circle.beginner_ok && (
              <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-terra-light text-terra">初心者歓迎</span>
            )}
          </div>
        </div>

        {/* スタッツ */}
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { icon: Users, label: "部員数", value: `${circle.member_count}人` },
            { icon: Calendar, label: "活動頻度", value: circle.frequency },
            { icon: DollarSign, label: "月会費", value: formatFee(circle.monthly_fee) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card p-3 text-center">
              <Icon size={15} className="mx-auto mb-1.5 text-muted" />
              <p className="text-sm font-bold text-charcoal">{value}</p>
              <p className="text-[10px] text-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* 活動場所 */}
        {circle.location && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <MapPin size={14} className="text-kpink flex-shrink-0" />
            <span>{circle.location}</span>
          </div>
        )}

        {/* 説明文 */}
        <div className="card p-4">
          <p className="text-sm text-charcoal leading-relaxed">{circle.description}</p>
        </div>

        {/* 新歓イベント */}
        {events.length > 0 && (
          <div>
            <p className="text-sm font-bold text-charcoal mb-2.5">新歓イベント</p>
            <div className="flex flex-col gap-2">
              {events.map((ev) => (
                <div key={ev.id} className="card p-3.5 gradient-soft">
                  <p className="text-sm font-semibold text-charcoal">{ev.title}</p>
                  <p className="text-xs mt-1 text-muted">
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
          <div>
            <p className="text-sm font-bold text-charcoal mb-2.5">連絡先・SNS</p>
            <div className="flex flex-col gap-2">
              {circle.instagram_url && (
                <a href={circle.instagram_url} target="_blank" rel="noopener noreferrer"
                  className="card flex items-center gap-3 px-4 py-3 tap-scale">
                  <span>📸</span>
                  <span className="text-sm font-medium text-charcoal">Instagram</span>
                  <ExternalLink size={13} className="ml-auto text-muted" />
                </a>
              )}
              {circle.twitter_url && (
                <a href={circle.twitter_url} target="_blank" rel="noopener noreferrer"
                  className="card flex items-center gap-3 px-4 py-3 tap-scale">
                  <span>🐦</span>
                  <span className="text-sm font-medium text-charcoal">Twitter / X</span>
                  <ExternalLink size={13} className="ml-auto text-muted" />
                </a>
              )}
              {circle.line_url && (
                <a href={circle.line_url} target="_blank" rel="noopener noreferrer"
                  className="card flex items-center gap-3 px-4 py-3 tap-scale">
                  <span>💬</span>
                  <span className="text-sm font-medium text-charcoal">LINEオープンチャット</span>
                  <ExternalLink size={13} className="ml-auto text-muted" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* ブックマーク・CTA */}
        <Link
          href="/search"
          className="gradient-pink flex items-center justify-center py-4 rounded-2xl text-white font-semibold text-sm shadow-pink tap-scale"
        >
          他のサークルも見る
        </Link>

      </div>
    </div>
  );
}
