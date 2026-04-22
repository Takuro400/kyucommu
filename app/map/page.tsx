"use client";

import { useState, useEffect, useRef } from "react";
import BottomNav from "@/components/BottomNav";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { MOCK_CIRCLES } from "@/lib/mockData";
import { Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import { X, Users, DollarSign, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

// ─── アフィン変換（GPS → 画像ピクセル%） ───────────────────────────────
// キャリブレーション点 [lat, lon, px_pct(0-100), py_pct(0-100)]
// 画像サイズ: 848 × 1264
const CALIB: [number, number, number, number][] = [
  [33.88921, 130.83724, (478 / 848) * 100, (141  / 1264) * 100], // W
  [33.89029, 130.84158, (100 / 848) * 100, (251  / 1264) * 100], // X
  [33.89584, 130.83929, (651 / 848) * 100, (1104 / 1264) * 100], // Y
  [33.89535, 130.84160, (316 / 848) * 100, (1037 / 1264) * 100], // Z
];

// 3×3 連立方程式を Cramer の公式で解く
function solve3(A: number[][], b: number[]): number[] {
  const det = (m: number[][]) =>
    m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det(A);
  return [0, 1, 2].map((i) => {
    const Ai = A.map((row, r) => row.map((v, c) => (c === i ? b[r] : v)));
    return det(Ai) / D;
  });
}

// 最小二乗法（正規方程式）でアフィン係数を計算
function buildAffine() {
  const latC = CALIB.reduce((s, c) => s + c[0], 0) / CALIB.length;
  const lonC = CALIB.reduce((s, c) => s + c[1], 0) / CALIB.length;

  // A[k] = [dlat, dlon, 1]
  const A = CALIB.map(([lat, lon]) => [lat - latC, lon - lonC, 1]);
  const bxArr = CALIB.map((c) => c[2]);
  const byArr = CALIB.map((c) => c[3]);

  // ATA = A^T @ A (3×3)
  const ATA: number[][] = Array.from({ length: 3 }, () => [0, 0, 0]);
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      ATA[i][j] = A.reduce((s, row) => s + row[i] * row[j], 0);

  const ATbx = [0, 0, 0];
  const ATby = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    ATbx[i] = A.reduce((s, row, k) => s + row[i] * bxArr[k], 0);
    ATby[i] = A.reduce((s, row, k) => s + row[i] * byArr[k], 0);
  }

  const [ax, bx, cx] = solve3(ATA, ATbx);
  const [ay, by, cy] = solve3(ATA, ATby);
  return { ax, bx, cx, ay, by, cy, latC, lonC };
}

const AFFINE = buildAffine();

function gpsToPercent(lat: number, lon: number) {
  const { ax, bx, cx, ay, by, cy, latC, lonC } = AFFINE;
  return {
    px: ax * (lat - latC) + bx * (lon - lonC) + cx,
    py: ay * (lat - latC) + by * (lon - lonC) + cy,
  };
}

// キャンパス境界（余裕を持たせた GPS 範囲）
const CAMPUS_LAT = { min: 33.883, max: 33.901 };
const CAMPUS_LON = { min: 33.831, max: 130.847 };

function isOnCampus(lat: number, lon: number) {
  const { px, py } = gpsToPercent(lat, lon);
  return px >= -5 && px <= 105 && py >= -5 && py <= 105;
}

// ─── コンポーネント ───────────────────────────────────────────────────────
type GpsStatus = "loading" | "ok" | "outside" | "denied" | "unavailable";

export default function MapPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [selected, setSelected] = useState<Circle | null>(null);

  // ピンチズーム
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const lastTouchRef = useRef<{ x: number; y: number; dist?: number } | null>(null);
  const isDragging = useRef(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // GPS
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("loading");
  const [gpsPos, setGpsPos] = useState<{ px: number; py: number } | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // ─── サークルデータ取得 ───────────────────────────────────────────────
  useEffect(() => {
    if (!supabaseConfigured) {
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

  // ─── GPS 取得 ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGpsStatus("unavailable");
      return;
    }

    function onSuccess(position: GeolocationPosition) {
      const { latitude, longitude } = position.coords;
      if (!isOnCampus(latitude, longitude)) {
        setGpsStatus("outside");
        setGpsPos(null);
        return;
      }
      const result = gpsToPercent(latitude, longitude);
      setGpsPos(result);
      setGpsStatus("ok");
    }

    function onError(err: GeolocationPositionError) {
      if (err.code === err.PERMISSION_DENIED) {
        setGpsStatus("denied");
      } else {
        setGpsStatus("unavailable");
      }
    }

    const id = navigator.geolocation.watchPosition(onSuccess, onError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 5000,
    });
    watchIdRef.current = id;

    return () => {
      if (watchIdRef.current !== null)
        navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, []);

  // ─── タッチ操作 ───────────────────────────────────────────────────────
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
      setPos((p) => ({ x: p.x + dx, y: p.y + dy }));
      lastTouchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else if (e.touches.length === 2 && lastTouchRef.current.dist) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / lastTouchRef.current.dist;
      setScale((s) => Math.min(Math.max(s * ratio, 0.8), 4));
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
    (c) => c.location_x != null && c.location_y != null
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
        {/* GPS ステータスバナー */}
        {gpsStatus === "loading" && (
          <div className="absolute top-3 left-1/2 z-20 gps-banner" style={{ transform: "translateX(-50%)" }}>
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-soft flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2 border-kpink border-t-transparent animate-spin flex-shrink-0" />
              <span className="text-[11px] font-medium text-charcoal whitespace-nowrap">現在地を取得中...</span>
            </div>
          </div>
        )}
        {gpsStatus === "outside" && (
          <div className="absolute top-3 left-1/2 z-20 gps-banner" style={{ transform: "translateX(-50%)" }}>
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-full shadow-soft">
              <span className="text-[11px] font-medium text-amber-700 whitespace-nowrap">📍 キャンパス外</span>
            </div>
          </div>
        )}

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

          {/* GPS 現在地マーカー */}
          {gpsPos && (
            <div
              className="absolute pointer-events-none z-20"
              style={{
                left: `${gpsPos.px}%`,
                top: `${gpsPos.py}%`,
              }}
            >
              {/* パルスリング */}
              <div
                className="gps-pulse absolute w-8 h-8 rounded-full"
                style={{
                  background: "rgba(242,167,187,0.35)",
                  border: "2px solid rgba(242,167,187,0.5)",
                  left: "50%",
                  top: "50%",
                }}
              />
              {/* メインドット */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 20,
                  height: 20,
                  background: "#F2A7BB",
                  border: "3px solid white",
                  boxShadow: "0 2px 8px rgba(242,167,187,0.6)",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              {/* ラベル */}
              <div
                className="absolute whitespace-nowrap"
                style={{
                  bottom: "calc(50% + 14px)",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <span
                  className="text-[9px] font-bold text-white px-2 py-0.5 rounded-full"
                  style={{ background: "#F2A7BB", boxShadow: "0 1px 4px rgba(242,167,187,0.5)" }}
                >
                  📍 現在地
                </span>
              </div>
            </div>
          )}

          {/* サークルピン */}
          {pinnedCircles.map((circle) => {
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
                {circle.is_active && (
                  <span className="text-base float-fire mb-0.5">🔥</span>
                )}
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full shadow-pink border-2 border-white cursor-pointer tap-scale"
                  style={{ background: "#F2A7BB" }}
                >
                  <span className="text-sm leading-none">
                    {circle.icon_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={circle.icon_url} alt="" className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      circle.emoji
                    )}
                  </span>
                  <span className="text-[10px] font-bold text-white whitespace-nowrap max-w-[80px] truncate">
                    {circle.name}
                  </span>
                </div>
                <div className="w-0.5 h-2 bg-kpink" />
                <div className="w-1.5 h-1.5 rounded-full bg-kpink" />
              </div>
            );
          })}
        </div>

        {/* ピンなし案内 */}
        {pinnedCircles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-soft text-center">
              <p className="text-sm font-semibold text-charcoal">まだピンがありません</p>
              <p className="text-xs text-muted mt-1">サークル登録時に活動場所を選択すると表示されます</p>
            </div>
          </div>
        )}
      </div>

      {/* 選択サークル ボトムシート */}
      {selected && (
        <div className="fixed inset-0 z-40" onClick={() => setSelected(null)}>
          <div
            className="absolute bottom-20 left-0 right-0 max-w-[430px] mx-auto px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card p-4 scale-in">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-100 text-muted tap-scale"
              >
                <X size={14} />
              </button>

              <div className="flex items-start gap-3 pr-8">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={{ background: CATEGORY_MAP[selected.category].bg }}
                >
                  {selected.icon_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.icon_url} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    selected.emoji
                  )}
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
                      style={{
                        background: CATEGORY_MAP[selected.category].bg,
                        color: CATEGORY_MAP[selected.category].text,
                      }}
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
