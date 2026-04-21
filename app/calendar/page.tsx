"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { MOCK_EVENTS, MOCK_CIRCLES } from "@/lib/mockData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { CATEGORY_MAP } from "@/lib/utils";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

export default function CalendarPage() {
  const [current, setCurrent] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart);

  function prevMonth() { setCurrent(new Date(current.getFullYear(), current.getMonth() - 1, 1)); setSelectedDay(null); }
  function nextMonth() { setCurrent(new Date(current.getFullYear(), current.getMonth() + 1, 1)); setSelectedDay(null); }

  function eventsOnDay(date: Date) {
    return MOCK_EVENTS.filter((e) => isSameDay(parseISO(e.event_date), date));
  }

  const displayedEvents = selectedDay
    ? eventsOnDay(selectedDay)
    : MOCK_EVENTS.filter((e) => {
        const d = parseISO(e.event_date);
        return d.getFullYear() === current.getFullYear() && d.getMonth() === current.getMonth();
      }).sort((a, b) => a.event_date.localeCompare(b.event_date));

  return (
    <div className="pb-24 bg-cream min-h-screen">
      <header className="sticky top-0 bg-white/85 backdrop-blur-xl border-b border-kpink/10 z-40 px-4 pt-12 pb-3">
        <p className="text-lg font-bold text-charcoal">新歓カレンダー</p>
      </header>

      <main>
        {/* カレンダー本体 */}
        <div className="bg-white px-4 pt-4 pb-3">
          {/* 月ナビ */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-full bg-gray-100 tap-scale">
              <ChevronLeft size={18} className="text-charcoal" />
            </button>
            <p className="text-base font-semibold text-charcoal font-display">
              {format(current, "yyyy年 M月", { locale: ja })}
            </p>
            <button onClick={nextMonth} className="p-2 rounded-full bg-gray-100 tap-scale">
              <ChevronRight size={18} className="text-charcoal" />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map((d, i) => (
              <div key={d} className={`text-center text-xs py-1 font-medium
                ${i === 0 ? "text-red-400" : i === 6 ? "text-lav" : "text-muted"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: startPad }).map((_, i) => (
              <div key={`pad-${i}`} />
            ))}

            {days.map((day) => {
              const evs = eventsOnDay(day);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const isTodayDay = isToday(day);
              const dow = getDay(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                  className="flex flex-col items-center py-1 rounded-xl transition-all tap-scale"
                  style={{ background: isSelected ? "#FDE8EF" : "transparent" }}
                >
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm
                      ${isTodayDay ? "gradient-pink text-white font-bold" : ""}
                      ${!isTodayDay && isSelected ? "font-bold" : ""}
                      ${!isTodayDay && dow === 0 ? "text-red-400" : ""}
                      ${!isTodayDay && dow === 6 ? "text-lav" : ""}
                      ${!isTodayDay && dow > 0 && dow < 6 ? "text-charcoal" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="flex gap-0.5 mt-0.5 h-1.5">
                    {evs.slice(0, 3).map((e, i) => {
                      const circle = MOCK_CIRCLES.find((c) => c.id === e.circle_id);
                      const cat = circle ? CATEGORY_MAP[circle.category] : null;
                      return (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: cat ? cat.text : "#F2A7BB" }}
                        />
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* イベントリスト */}
        <div className="mt-3 px-4">
          <p className="text-xs text-muted mb-3">
            {selectedDay
              ? `${format(selectedDay, "M月d日(E)", { locale: ja })}のイベント`
              : `${format(current, "M月", { locale: ja })}のイベント一覧`}
          </p>

          {displayedEvents.length === 0 && (
            <p className="text-center text-muted text-sm py-10">
              {selectedDay ? "この日のイベントはありません" : "イベントはありません"}
            </p>
          )}

          <div className="flex flex-col gap-2.5">
            {displayedEvents.map((ev) => {
              const circle = MOCK_CIRCLES.find((c) => c.id === ev.circle_id);
              const evDate = parseISO(ev.event_date);
              const cat = circle ? CATEGORY_MAP[circle.category] : null;

              return (
                <div key={ev.id} className="card p-4 flex gap-3 items-start tap-scale">
                  {/* 日付バッジ */}
                  <div className="gradient-soft rounded-xl px-2.5 py-2 text-center flex-shrink-0 w-12">
                    <p className="text-xl font-bold leading-none text-kpink font-display">
                      {format(evDate, "d")}
                    </p>
                    <p className="text-[10px] mt-0.5 text-kpink font-medium">
                      {format(evDate, "M月")}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {circle && (
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                          style={{ background: cat?.bg }}>
                          {circle.icon_url
                            ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover rounded-lg" />
                            : circle.emoji}
                        </div>
                      )}
                      <p className="text-sm font-semibold text-charcoal truncate">{ev.title}</p>
                    </div>
                    {circle && <p className="text-[11px] text-muted mt-0.5">{circle.name}</p>}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <Clock size={11} /> {ev.start_time}〜{ev.end_time}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        <MapPin size={11} /> {ev.location}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
