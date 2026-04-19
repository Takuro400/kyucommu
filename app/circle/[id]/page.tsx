import { ArrowLeft, Users, Calendar, DollarSign, MessageCircle } from "lucide-react";
import Link from "next/link";
import { MOCK_CIRCLES, MOCK_EVENTS } from "@/lib/mockData";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import { parseISO, format } from "date-fns";
import { ja } from "date-fns/locale";
import { notFound } from "next/navigation";

interface Props {
  params: { id: string };
}

export default function CircleDetailPage({ params }: Props) {
  const circle = MOCK_CIRCLES.find((c) => c.id === params.id);
  if (!circle) notFound();

  const cat = CATEGORY_MAP[circle.category];
  const events = MOCK_EVENTS.filter((e) => e.circle_id === circle.id);

  return (
    <div className="pb-8">
      {/* ヘッダー */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40 flex items-center gap-3 px-4 py-3">
        <Link href="/search" className="p-1.5 rounded-full hover:bg-gray-100">
          <ArrowLeft size={20} className="text-gray-700" />
        </Link>
        <p className="text-base font-medium text-gray-900">{circle.name}</p>
      </header>

      {/* ヒーローエリア */}
      <div
        className="w-full aspect-[16/7] flex items-center justify-center text-8xl"
        style={{ background: cat.bg }}
      >
        {circle.emoji}
      </div>

      <div className="px-4 py-4">
        {/* 名前・タグ */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h1 className="text-xl font-bold text-gray-900">{circle.name}</h1>
          <div className="flex gap-1 flex-wrap justify-end">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: cat.bg, color: cat.text }}
            >
              {cat.label}
            </span>
            {circle.beginner_ok && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-700">
                初心者歓迎
              </span>
            )}
          </div>
        </div>

        {/* 統計 */}
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

        {/* 説明 */}
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

        {/* 質問ボタン */}
        <button
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-medium text-sm"
          style={{ background: "#185FA5" }}
        >
          <MessageCircle size={18} />
          先輩に質問する
        </button>
      </div>
    </div>
  );
}
