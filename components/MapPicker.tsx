"use client";

import { useState, useRef } from "react";
import { X, MapPin, Check } from "lucide-react";

interface Props {
  value: { x: number; y: number } | null;
  onChange: (pos: { x: number; y: number }) => void;
}

export default function MapPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(value);

  // pinch-zoom state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const lastTouches = useRef<React.TouchList | null>(null);
  const lastDist = useRef<number | null>(null);
  const lastMid = useRef<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  function dist(a: React.Touch, b: React.Touch) {
    return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
  }

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      lastDist.current = dist(e.touches[0], e.touches[1]);
      lastMid.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1) {
      lastMid.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    lastTouches.current = e.touches;
  }

  function handleTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    if (e.touches.length === 2 && lastDist.current !== null) {
      const newDist = dist(e.touches[0], e.touches[1]);
      const ratio = newDist / lastDist.current;
      setScale((s) => Math.min(5, Math.max(1, s * ratio)));
      lastDist.current = newDist;

      const mid = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
      if (lastMid.current) {
        const dx = mid.x - lastMid.current.x;
        const dy = mid.y - lastMid.current.y;
        setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
      }
      lastMid.current = mid;
    } else if (e.touches.length === 1 && lastMid.current) {
      const dx = e.touches[0].clientX - lastMid.current.x;
      const dy = e.touches[0].clientY - lastMid.current.y;
      setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
      lastMid.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (e.changedTouches.length === 1 && e.touches.length === 0) {
      // シングルタップ判定：touchstartとtouchendの位置がほぼ同じ
      const touch = e.changedTouches[0];
      const rect = imgRef.current?.getBoundingClientRect();
      if (!rect) return;
      // imgの座標に変換
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
        setDraft({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
      }
    }
    lastDist.current = null;
    lastMid.current = null;
  }

  function handleConfirm() {
    if (draft) onChange(draft);
    setOpen(false);
  }

  function handleOpen() {
    setDraft(value);
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setOpen(true);
  }

  return (
    <>
      {/* トリガー：コンパクトなプレビューカード */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed border-kpink/30 bg-kpink/5 hover:border-kpink/50 transition-all tap-scale text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-kpink/10 flex items-center justify-center flex-shrink-0">
          <MapPin size={16} className="text-kpink" />
        </div>
        <div className="flex-1 min-w-0">
          {value ? (
            <>
              <p className="text-xs font-bold text-kpink">📍 場所を選択済み</p>
              <p className="text-[10px] text-muted mt-0.5">タップしてマップを開き変更</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold text-charcoal">マップで場所を選択</p>
              <p className="text-[10px] text-muted mt-0.5">タップしてキャンパスマップを開く</p>
            </>
          )}
        </div>
        <span className="text-xs text-kpink font-semibold flex-shrink-0">開く →</span>
      </button>

      {/* フルスクリーンマップオーバーレイ */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          {/* ヘッダー */}
          <div className="flex items-center justify-between px-4 pt-12 pb-3 bg-black/80 backdrop-blur-sm flex-shrink-0">
            <div>
              <p className="text-sm font-bold text-white">活動場所を選択</p>
              <p className="text-[10px] text-white/60 mt-0.5">
                {draft ? "📍 タップして変更 / ピンチで拡大" : "タップして場所を選択 / ピンチで拡大"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center"
            >
              <X size={18} className="text-white" />
            </button>
          </div>

          {/* マップエリア */}
          <div
            ref={containerRef}
            className="flex-1 overflow-hidden relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: "none" }}
          >
            <div
              ref={imgRef}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                transformOrigin: "center center",
                width: "100%",
                height: "100%",
                position: "absolute",
                inset: 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/campus-map.png"
                alt="キャンパスマップ"
                className="w-full h-full object-contain pointer-events-none select-none"
                draggable={false}
              />

              {/* ドラフトピン */}
              {draft && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${draft.x}%`,
                    top: `${draft.y}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-kpink border-3 border-white shadow-lg flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                    <div className="w-0.5 h-4 bg-kpink" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* フッター：確定ボタン */}
          <div className="flex-shrink-0 bg-black/80 backdrop-blur-sm px-4 pb-10 pt-3 flex gap-3">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3.5 rounded-2xl border border-white/20 text-white text-sm font-semibold"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!draft}
              className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-40"
              style={{ background: draft ? "linear-gradient(135deg,#FF6B9D,#FF8E53)" : "#555" }}
            >
              <Check size={16} />
              {draft ? "この場所を選択" : "場所をタップしてください"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
