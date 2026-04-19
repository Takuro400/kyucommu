"use client";

import { useState } from "react";
import { X, Flag, CheckCircle } from "lucide-react";

const REASONS = [
  "不適切なコンテンツ",
  "スパム・宣伝",
  "誤解を招く情報",
  "著作権の侵害",
  "その他",
];

interface Props {
  postId: string;
  onClose: () => void;
}

export default function ReportModal({ postId, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleSubmit() {
    if (!selected) return;
    // In production: send report to Supabase reports table
    console.log("Report submitted:", { postId, reason: selected });
    setDone(true);
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />

      {/* ボトムシート */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-2xl z-50 pb-safe">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-4" />

        {done ? (
          <div className="flex flex-col items-center py-8 px-6 text-center">
            <CheckCircle size={44} style={{ color: "#185FA5" }} className="mb-3" />
            <p className="text-base font-bold text-gray-900 mb-1">報告を受け付けました</p>
            <p className="text-sm text-gray-400 mb-6">
              内容を確認のうえ、適切に対応いたします。
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-white font-medium text-sm"
              style={{ background: "#185FA5" }}
            >
              閉じる
            </button>
          </div>
        ) : (
          <div className="px-4 pb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flag size={18} className="text-red-400" />
                <p className="text-base font-bold text-gray-900">報告する</p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-4">報告の理由を選んでください</p>

            <div className="flex flex-col gap-2 mb-5">
              {REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setSelected(reason)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-colors text-left ${
                    selected === reason
                      ? "border-[#185FA5] bg-[#E6F1FB]"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      selected === reason
                        ? "border-[#185FA5] bg-[#185FA5]"
                        : "border-gray-300"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      selected === reason ? "text-[#185FA5]" : "text-gray-700"
                    }`}
                  >
                    {reason}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="w-full py-3.5 rounded-xl text-white font-medium text-sm transition-opacity disabled:opacity-40"
              style={{ background: "#e24b4a" }}
            >
              この投稿を報告する
            </button>
          </div>
        )}
      </div>
    </>
  );
}
