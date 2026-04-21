"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import BottomNav from "@/components/BottomNav";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { MOCK_CIRCLES } from "@/lib/mockData";
import { Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import { X, Users, DollarSign, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function MapPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selected, setSelected] = useState<Circle | null>(null);

  // ピンチズーム状態
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const lastTouchRef = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const isDragging = useRef(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!supabaseConfigured) {
      // モックはロケーション情報がないので demo 用にダミー座標を付与
      const withPos = MOCK_CIRCLES.map((c, i) => ({
        ...c,
        status: "approved" as const,
        location_x: 20 + (i % 4) * 20,
        location_y: 25 + Math.floor(i / 4) * 25,
        location_name: c.location ?? `エリア${i + 1}`,
      }));
      setCircles(withPos);
      return;
    }
    const supabase = createClient();
    supabase
      .from("circles")
      .select("*")
      .eq("status", "approved")
      .not("location_x", "is", null)
      .then(({ data }) => {
        if (data) setCircles(data as Circle[]);
      });
  }, []);

  // タッチ操作
  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 1) {
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging.current = false;
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchRef.current = { x: 0, y: 0, dist };
    }
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (!lastTouchRef.current) return;
    if (e.touches.length === 1) {
      const dx = e.touches[0].clientX - lastTouchRef.current.x;
      const dy = e.touches[0].clientY - lastTouchRef.current.y;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isDragging.current = true;
      setPos(p => ({ x: p.x + dx, y: p.y + dy }));
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && lastTouchRef.current.dist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / lastTouchRef.current.dist;
      setScale(s => Math.min(Math.max(s * ratio, 0.8), 4));
      lastTouchRef.current = { ...lastTouchRef.current, dist };
    }
  }

  function onTouchEnd() {
    lastTouchRef.current = null;
  }

  function handlePinClick(e: React.MouseEvent, circle: Circle) {
    if (isDragging.current) return;
    e.stopPropagation();
    setSelected(circle);
  }

  function resetView() {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }

  const pinnedCircles = circles.filter(
    c => c.location_x != null && c.location_y != null
  );

  return (
    <div className="flex flex-col h-screen bg-cream">
      {/* ヘッダー */}
      <header className="bg-white/85 backdrop-blur-xl border-b border-kpink/10 px-4 pt-12 pb-3 flex-shrink-0 z-30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-charcoal">キャンパスマップ</p>
            <p className="text-[10px] text-muted mt-0.5">九工大 戸畑キャンパス — ピンをタップで詳細</p>
          </div>
          <button
            onClick={resetView}
            className="text-xs text-kpink font-semibold px-3 py-1.5 rounded-full bg-kpink-light tap-scale"
          >
            リセット
          </button>
        </div>
      </header>

      {/* マップエリア */}
      <div
        className="flex-1 overflow-hidden relative"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "none" }}
        onClick={() => setSelected(null)}
      >
        <div
          ref={mapRef}
          style={{
            transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: "transform 0.05s linear",
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* キャンパスマップ画像 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/campus-map.png"
            alt="キャンパスマップ"
            className="w-full h-full object-contain select-none pointer-events-none"
            draggable={false}
          />

          {/* ピン */}
          {pinnedCircles.map(circle => {
            const cat = CATEGORY_MAP[circle.category];
            return (
              <div
                key={circle.id}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${circle.location_x}%`,
                  top: `${circle.location_y}%`,
                  transform: "translate(-50%, -100%)",
                }}
                onClick={(e) => handlePinClick(e, circle)}
              >
                {/* 活動中の炎 */}
                {circle.is_active && (
                  <span className="text-base float-fire mb-0.5">🔥</span>
                )}
                {/* バブルピン */}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-pink border-2 border-white cursor-pointer tap-scale"
                  style={{ background: "#F2A7BB" }}
                >
                  <span className="text-sm leading-none">
                    {circle.icon_url
                      ? <img src={circle.icon_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                      : circle.emoji}
                  </span>
                  <span className="text-[10px] font-bold text-white whitespace-nowrap max-w-[80px] truncate">
                    {circle.name}
                  </span>
                </div>
                {/* ピンの足 */}
                <div className="w-0.5 h-2 bg-kpink" />
                <div className="w-1.5 h-1.5 rounded-full bg-kpink" />
              </div>
            );
          })}
        </div>

        {/* ピンがない場合 */}
        {pinnedCircles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-soft text-center">
              <p className="text-sm font-semibold text-charcoal">まだピンがありません</p>
              <p className="text-xs text-muted mt-1">サークル登録時に活動場所を選択すると表示されます</p>
            </div>
          </div>
        )}
      </div>

      {/* 選択されたサークルのボトムシート */}
      {selected && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelected(null)}
        >
          <div
            className="absolute bottom-20 left-0 right-0 max-w-[430px] mx-auto px-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="card p-4 scale-in">
              {/* 閉じるボタン */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 text-muted tap-scale"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3 pr-8">
                {/* アイコン */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={{ background: CATEGORY_MAP[selected.category].bg }}
                >
                  {selected.icon_url
                    ? <img src={selected.icon_url} alt={selected.name} className="w-full h-full object-cover" />
                    : selected.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base font-bold text-charcoal">{selected.name}</p>
                    {selected.is_active && (
                      <span className="text-[10px] font-bold bg-red-50 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        🔥 活動中
                      </span>
                    )}
                  </div>
                  {selected.location_name && (
                    <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                      <MapPin size={10} className="text-kpink" /> {selected.location_name}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <Users size={10} /> {selected.member_count}人
                    </span>
                    <span className="text-[10px] text-muted flex items-center gap-1">
                      <DollarSign size={10} /> {formatFee(selected.monthly_fee)}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: CATEGORY_MAP[selected.category].bg, color: CATEGORY_MAP[selected.category].text }}
                    >
                      {CATEGORY_MAP[selected.category].label}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-charcoal leading-relaxed mt-3 line-clamp-3">
                {selected.description}
              </p>

              <Link
                href={`/circle/${selected.id}`}
                className="mt-3 gradient-pink flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-white text-xs font-semibold tap-scale"
              >
                詳細を見る <ExternalLink size={11} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
