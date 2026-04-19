"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Clock } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { MOCK_EVENTS, MOCK_CIRCLES } from "@/lib/mockData";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

const DOT_COLORS: Record<string, string> = {
  tech: "#185FA5",
  sport: "#1D9E75",
  culture: "#D4537E",
};

export default function CalendarPage() {
  const [current, setCurrent] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = getDay(monthStart); // 月初の曜日（0=日）

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
    <div className="pb-20">
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40 px-4 py-3">
        <p className="text-lg font-bold text-gray-900">新歓カレンダー</p>
      </header>

      <main>
        {/* カレンダー本体 */}
        <div className="bg-white px-4 pt-4 pb-2">
          {/* 月ナビ */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-full hover:bg-gray-100">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <p className="text-base font-medium text-gray-900">
              {format(current, "yyyy年 M月", { locale: ja })}
            </p>
            <button onClick={nextMonth} className="p-1.5 rounded-full hover:bg-gray-100">
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map((d, i) => (
              <div key={d} className={`text-center text-xs py-1 font-medium
                ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}>
                {d}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-y-1">
            {/* 空白パディング */}
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
                  className="flex flex-col items-center py-1 rounded-lg transition-colors"
                  style={{ background: isSelected ? "#E6F1FB" : "transparent" }}
                >
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm
                      ${isTodayDay ? "bg-[#185FA5] text-white font-bold" : ""}
                      ${!isTodayDay && dow === 0 ? "text-red-400" : ""}
                      ${!isTodayDay && dow === 6 ? "text-blue-400" : ""}
                      ${!isTodayDay && dow > 0 && dow < 6 ? "text-gray-700" : ""}
                    `}
                  >
                    {format(day, "d")}
                  </span>
                  {/* イベントドット */}
                  <div className="flex gap-0.5 mt-0.5 h-1.5">
                    {evs.slice(0, 3).map((e, i) => {
                      const circle = MOCK_CIRCLES.find((c) => c.id === e.circle_id);
                      const color = circle ? DOT_COLORS[circle.category] : "#185FA5";
                      return (
                        <div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: color }}
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
        <div className="mt-2">
          <p className="text-xs text-gray-400 px-4 py-2">
            {selectedDay
              ? `${format(selectedDay, "M月d日(E)", { locale: ja })}のイベント`
              : `${format(current, "M月", { locale: ja })}のイベント一覧`}
          </p>

          {displayedEvents.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-10">
              {selectedDay ? "この日のイベントはありません" : "イベントはありません"}
            </p>
          )}

          <div className="flex flex-col gap-2 px-4">
            {displayedEvents.map((ev) => {
              const circle = MOCK_CIRCLES.find((c) => c.id === ev.circle_id);
              const dotColor = circle ? DOT_COLORS[circle.category] : "#185FA5";
              const evDate = parseISO(ev.event_date);

              return (
                <div key={ev.id} className="bg-white rounded-xl p-4 flex gap-3 items-start">
                  {/* 日付バッジ */}
                  <div
                    className="rounded-xl px-3 py-2 text-center flex-shrink-0 min-w-[48px]"
                    style={{ background: "#E6F1FB" }}
                  >
                    <p className="text-xl font-bold leading-none" style={{ color: "#185FA5" }}>
                      {format(evDate, "d")}
                    </p>
                    <p className="text-[10px] mt-0.5" style={{ color: "#185FA5" }}>
                      {format(evDate, "M月")}
                    </p>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {circle && <span className="text-base">{circle.emoji}</span>}
                      <p className="text-sm font-medium text-gray-900 truncate">{ev.title}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-gray-400">
                      <Clock size={12} />
                      <span className="text-xs">{ev.start_time}〜{ev.end_time}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-gray-400">
                      <MapPin size={12} />
                      <span className="text-xs">{ev.location}</span>
                    </div>
                  </div>

                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ background: dotColor }}
                  />
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
