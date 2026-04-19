"use client";

import { useEffect, useRef, useState } from "react";
import { CampusLocation, Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import { Users, Calendar, DollarSign, X, Navigation } from "lucide-react";
import Link from "next/link";

interface Props {
  locations: CampusLocation[];
  circles: Circle[];
}

const TYPE_ICON: Record<string, string> = {
  building: "🏛️",
  hall: "🏟️",
  court: "🎾",
  ground: "⛳",
  other: "📍",
};

// カテゴリ → マーカー色
const CAT_COLOR: Record<string, string> = {
  tech: "#185FA5",
  sport: "#1D9E75",
  culture: "#D4537E",
  default: "#6B7280",
};

export default function CampusMap({ locations, circles }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapRef = useRef<any>(null);
  const [selected, setSelected] = useState<{ loc: CampusLocation; circles: Circle[] } | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Leaflet CSS を動的に挿入（<link>をJSXに書くと hydration エラーになるため）
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
    }

    // React Strict Mode の二重発火・ナビゲーション戻りで
    // "Map container is already initialized" を防ぐフラグ
    let isMounted = true;

    // Leaflet を動的 import（SSR回避）
    import("leaflet").then((L) => {
      if (!isMounted || !mapRef.current) return;

      // 既に初期化済みのコンテナを安全にリセット
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((mapRef.current as any)._leaflet_id) {
        if (leafletMapRef.current) {
          leafletMapRef.current.remove();
          leafletMapRef.current = null;
        }
      }
      if (!isMounted || !mapRef.current) return;
      // デフォルトマーカーアイコンのパス修正
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      // 九工大 戸畑キャンパス中心 (仙水町1-1)
      const map = L.map(mapRef.current!, {
        center: [33.8893, 130.8400],
        zoom: 17,
        zoomControl: false,
      });

      // ズームボタンを右下に
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // OpenStreetMap タイル
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // 各場所にカスタムマーカーを配置
      locations.forEach((loc) => {
        const locCircles = circles.filter((c) => loc.circles.includes(c.id));

        // マーカーの色決定（複数サークル → 最初のサークルのカテゴリ色）
        const mainCircle = locCircles[0];
        const color = mainCircle
          ? CAT_COLOR[mainCircle.category] ?? CAT_COLOR.default
          : CAT_COLOR.default;

        // SVG カスタムアイコン
        const svgIcon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:40px; height:40px;
              background:${color};
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              display:flex; align-items:center; justify-content:center;
            ">
              <span style="
                transform:rotate(45deg);
                font-size:18px;
                line-height:1;
              ">${TYPE_ICON[loc.type] ?? "📍"}</span>
            </div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -44],
        });

        const marker = L.marker([loc.lat, loc.lng], { icon: svgIcon }).addTo(map);

        // クリックでボトムシート表示
        marker.on("click", () => {
          setSelected({ loc, circles: locCircles });
        });
      });

      leafletMapRef.current = map;
    });

    return () => {
      isMounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [locations, circles]);

  return (
    <div className="relative w-full h-full">
      {/* 地図本体 */}
      <div ref={mapRef} className="w-full h-full" />

      {/* 凡例 */}
      <div className="absolute top-3 left-3 z-[1000] bg-white rounded-xl shadow-md px-3 py-2 flex flex-col gap-1">
        <p className="text-[10px] font-bold text-gray-500 mb-0.5">カテゴリ</p>
        {[
          { color: CAT_COLOR.tech, label: "技術系" },
          { color: CAT_COLOR.sport, label: "体育系" },
          { color: CAT_COLOR.culture, label: "文化系" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
            <span className="text-[10px] text-gray-600">{label}</span>
          </div>
        ))}
      </div>

      {/* 場所の説明ボトムシート */}
      {selected && (
        <>
          <div
            className="absolute inset-0 z-[999]"
            onClick={() => setSelected(null)}
          />
          <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-2xl shadow-2xl max-h-[60%] overflow-y-auto">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1" />

            {/* ヘッダー */}
            <div className="flex items-start justify-between px-4 pt-2 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{TYPE_ICON[selected.loc.type]}</span>
                <div>
                  <p className="text-base font-bold text-gray-900">{selected.loc.name}</p>
                  <p className="text-xs text-gray-400">
                    {selected.circles.length > 0
                      ? `${selected.circles.length}つのサークルが活動`
                      : "合同イベント会場"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-1.5 rounded-full hover:bg-gray-100 flex-shrink-0"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* サークルカード一覧 */}
            {selected.circles.length > 0 ? (
              <div className="flex flex-col gap-2 px-4 pb-5">
                {selected.circles.map((circle) => {
                  const cat = CATEGORY_MAP[circle.category];
                  return (
                    <Link key={circle.id} href={`/circle/${circle.id}`}>
                      <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3 active:opacity-70">
                        <div
                          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
                          style={{ background: cat.bg }}
                        >
                          {circle.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-gray-900">{circle.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-0.5">
                              <Users size={11} /> {circle.member_count}人
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Calendar size={11} /> {circle.frequency}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <DollarSign size={11} /> {formatFee(circle.monthly_fee)}
                            </span>
                          </div>
                          <div className="flex gap-1 mt-1.5">
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                              style={{ background: cat.bg, color: cat.text }}
                            >
                              {cat.label}
                            </span>
                            {circle.beginner_ok && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-50 text-amber-700">
                                初心者歓迎
                              </span>
                            )}
                          </div>
                        </div>
                        <Navigation size={14} className="text-gray-300 flex-shrink-0" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-400 pb-6">
                合同イベントなどで使用される広場です
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
