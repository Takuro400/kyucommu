"use client";

import { useRef } from "react";

interface Props {
  value: { x: number; y: number } | null;
  onChange: (pos: { x: number; y: number }) => void;
}

export default function MapPicker({ value, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onChange({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  function handleTouch(e: React.TouchEvent<HTMLDivElement>) {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    onChange({ x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-[10px] text-muted">マップをタップして活動場所を選択</p>
      <div
        ref={containerRef}
        className="relative w-full rounded-2xl overflow-hidden border-2 border-kpink/20 cursor-crosshair"
        style={{ aspectRatio: "4/3" }}
        onClick={handleClick}
        onTouchEnd={handleTouch}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/campus-map.png"
          alt="キャンパスマップ"
          className="w-full h-full object-cover pointer-events-none select-none"
          draggable={false}
        />

        {/* 選択済みピン */}
        {value && (
          <div
            className="absolute -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{ left: `${value.x}%`, top: `${value.y}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-kpink border-2 border-white shadow-pink flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="w-0.5 h-3 bg-kpink" />
            </div>
          </div>
        )}

        {/* 未選択のヒント */}
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-medium text-charcoal shadow-soft">
              📍 タップして場所を選択
            </div>
          </div>
        )}
      </div>
      {value && (
        <p className="text-[10px] text-kpink font-medium">
          ✓ 場所を選択済み（タップで変更）
        </p>
      )}
    </div>
  );
}
