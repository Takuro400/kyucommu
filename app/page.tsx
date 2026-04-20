import BottomNav from "@/components/BottomNav";
import CircleCard from "@/components/CircleCard";
import { MOCK_CIRCLES, MOCK_EVENTS } from "@/lib/mockData";
import { CATEGORY_MAP } from "@/lib/utils";
import { MapPin, Clock, ArrowRight, CalendarDays } from "lucide-react";
import { parseISO, format, isAfter, startOfDay } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";

export default function HomePage() {
  const today = startOfDay(new Date());

  // 今後のイベントを日付順に最大4件
  const upcomingEvents = MOCK_EVENTS
    .filter((e) => isAfter(parseISO(e.event_date), today) || format(parseISO(e.event_date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd"))
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 4);

  // 新着サークル3件
  const pickupCircles = MOCK_CIRCLES.slice(0, 3);

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-100 px-4 pt-5 pb-4">
        <p className="text-xl font-bold text-gray-900">キューコミュ</p>
        <p className="text-xs text-gray-400 mt-0.5">九工大のサークル・部活を探そう</p>
      </header>

      <main className="px-4 pt-5 flex flex-col gap-6">

        {/* ウェルカムバナー */}
        <div
          className="rounded-2xl px-5 py-4 text-white relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #185FA5 0%, #1D9E75 100%)" }}
        >
          <p className="text-base font-bold leading-snug">新入生のみなさん、<br />ようこそ九工大へ🎓</p>
          <p className="text-xs mt-1.5 opacity-80">気になるサークルをブックマークして比較しよう</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-1 mt-3 bg-white/20 text-white text-xs font-medium px-3 py-1.5 rounded-full"
          >
            サークルを探す <ArrowRight size={12} />
          </Link>
          {/* 装飾 */}
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="absolute -right-2 bottom-2 w-12 h-12 rounded-full bg-white/10" />
        </div>

        {/* 近日開催の新歓イベント */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} style={{ color: "#185FA5" }} />
              <p className="text-sm font-bold text-gray-800">近日開催の新歓</p>
            </div>
            <Link href="/calendar" className="text-xs text-gray-400 flex items-center gap-0.5">
              すべて見る <ArrowRight size={12} />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="bg-white rounded-xl p-5 text-center">
              <p className="text-sm text-gray-400">現在予定されているイベントはありません</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingEvents.map((ev) => {
                const circle = MOCK_CIRCLES.find((c) => c.id === ev.circle_id);
                const evDate = parseISO(ev.event_date);
                const cat = circle ? CATEGORY_MAP[circle.category] : null;
                return (
                  <div key={ev.id} className="bg-white rounded-xl p-4 flex gap-3 items-center">
                    {/* 日付バッジ */}
                    <div
                      className="rounded-xl px-2.5 py-2 text-center flex-shrink-0 w-12"
                      style={{ background: "#E6F1FB" }}
                    >
                      <p className="text-lg font-bold leading-none" style={{ color: "#185FA5" }}>
                        {format(evDate, "d")}
                      </p>
                      <p className="text-[9px] mt-0.5" style={{ color: "#185FA5" }}>
                        {format(evDate, "M月")}
                      </p>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{ev.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <Clock size={10} /> {ev.start_time}〜{ev.end_time}
                        </span>
                        <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                          <MapPin size={10} /> {ev.location}
                        </span>
                      </div>
                    </div>

                    {circle && cat && (
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{ background: cat.bg }}
                      >
                        {circle.emoji}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 新着サークルピックアップ */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">✨</span>
              <p className="text-sm font-bold text-gray-800">新着サークル</p>
            </div>
            <Link href="/search" className="text-xs text-gray-400 flex items-center gap-0.5">
              すべて見る <ArrowRight size={12} />
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {pickupCircles.map((c) => (
              <CircleCard key={c.id} circle={c} showBookmark />
            ))}
          </div>
        </section>

        {/* 探すへのCTA */}
        <Link
          href="/search"
          className="flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-sm mb-2"
          style={{ background: "#185FA5" }}
        >
          すべてのサークルを見る
          <ArrowRight size={16} />
        </Link>

      </main>
      <BottomNav />
    </div>
  );
}
