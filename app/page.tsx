import BottomNav from "@/components/BottomNav";
import CircleCard from "@/components/CircleCard";
import ActiveCirclesClient from "@/components/ActiveCirclesClient";
import { MOCK_CIRCLES, MOCK_EVENTS } from "@/lib/mockData";
import { CATEGORY_MAP } from "@/lib/utils";
import { MapPin, Clock, ArrowRight, Sparkles } from "lucide-react";
import { parseISO, format, isAfter, startOfDay } from "date-fns";
import Link from "next/link";

export default function HomePage() {
  const today = startOfDay(new Date());

  const upcomingEvents = MOCK_EVENTS
    .filter((e) => isAfter(parseISO(e.event_date), today) || format(parseISO(e.event_date), "yyyy-MM-dd") === format(today, "yyyy-MM-dd"))
    .sort((a, b) => a.event_date.localeCompare(b.event_date))
    .slice(0, 5);

  const pickupCircles = MOCK_CIRCLES.slice(0, 3);

  return (
    <div className="pb-24 bg-cream min-h-screen">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-kpink/10 px-5 pt-12 pb-4 sticky top-0 z-40">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-bold tracking-tight text-charcoal">kyucommu</span>
          <span className="text-kpink text-xl font-bold">.</span>
        </div>
        <p className="text-[11px] text-muted mt-0.5 tracking-wide">九工大サークル・部活マッチング</p>
      </header>

      <main className="px-4 pt-5 flex flex-col gap-7">

        {/* ウェルカムバナー */}
        <div className="gradient-pink rounded-3xl px-5 py-5 text-white relative overflow-hidden shadow-pink">
          <p className="text-base font-bold leading-snug">新入生のみなさん、<br />ようこそ九工大へ🎓</p>
          <p className="text-xs mt-1.5 opacity-85">気になるサークルをブックマークして比較しよう</p>
          <Link
            href="/search"
            className="inline-flex items-center gap-1.5 mt-3.5 bg-white/25 backdrop-blur-sm text-white text-xs font-semibold px-4 py-2 rounded-full tap-scale"
          >
            サークルを探す <ArrowRight size={12} />
          </Link>
          <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute right-6 bottom-3 w-14 h-14 rounded-full bg-white/10" />
          <div className="absolute -right-2 -bottom-4 w-20 h-20 rounded-full bg-lav/30" />
        </div>

        {/* 今日活動中のサークル */}
        <ActiveCirclesClient />

        {/* 近日開催の新歓 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full gradient-warm flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <p className="text-sm font-bold text-charcoal">近日開催の新歓</p>
            </div>
            <Link href="/calendar" className="text-xs text-kpink flex items-center gap-0.5 font-medium">
              すべて見る <ArrowRight size={11} />
            </Link>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="card p-5 text-center">
              <p className="text-sm text-muted">現在予定されているイベントはありません</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
              {upcomingEvents.map((ev) => {
                const circle = MOCK_CIRCLES.find((c) => c.id === ev.circle_id);
                const evDate = parseISO(ev.event_date);
                const cat = circle ? CATEGORY_MAP[circle.category] : null;
                return (
                  <div key={ev.id} className="card flex-shrink-0 w-56 p-4 flex flex-col gap-2.5 tap-scale">
                    <div className="flex items-start justify-between">
                      <div className="gradient-soft rounded-xl px-2.5 py-2 text-center w-12">
                        <p className="text-lg font-bold leading-none text-kpink font-display">
                          {format(evDate, "d")}
                        </p>
                        <p className="text-[9px] mt-0.5 text-kpink font-medium">
                          {format(evDate, "M月")}
                        </p>
                      </div>
                      {circle && cat && (
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                          style={{ background: cat.bg }}
                        >
                          {circle.icon_url
                            ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover rounded-xl" />
                            : circle.emoji}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-charcoal leading-snug">{ev.title}</p>
                      {circle && (
                        <p className="text-[11px] text-muted mt-0.5">{circle.name}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-[10px] text-muted">
                        <Clock size={9} /> {ev.start_time}〜{ev.end_time}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-muted">
                        <MapPin size={9} /> {ev.location}
                      </span>
                    </div>
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
              <p className="text-sm font-bold text-charcoal">新着サークル</p>
            </div>
            <Link href="/search" className="text-xs text-kpink flex items-center gap-0.5 font-medium">
              すべて見る <ArrowRight size={11} />
            </Link>
          </div>
          <div className="flex flex-col gap-2.5">
            {pickupCircles.map((c) => (
              <CircleCard key={c.id} circle={c} showBookmark />
            ))}
          </div>
        </section>

        {/* CTA */}
        <Link
          href="/search"
          className="gradient-warm flex items-center justify-center gap-2 py-4 rounded-2xl text-white font-semibold text-sm shadow-pink tap-scale mb-2"
        >
          すべてのサークルを見る
          <ArrowRight size={16} />
        </Link>

      </main>
      <BottomNav />
    </div>
  );
}
