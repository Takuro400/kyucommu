"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import {
  Lock, CheckCircle, XCircle, Clock, Users, DollarSign, MapPin,
  Instagram, Twitter, MessageCircle, ExternalLink, ChevronDown, ChevronUp,
} from "lucide-react";

type Tab = "pending" | "approved" | "rejected";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [rejectInput, setRejectInput] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchCircles = useCallback(async () => {
    if (!supabaseConfigured) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("circles")
      .select("*")
      .order("created_at", { ascending: false });
    setCircles((data as Circle[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authed) fetchCircles();
  }, [authed, fetchCircles]);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (pw === (process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "kyucommu_admin")) {
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
    }
  }

  async function handleApprove(circleId: string) {
    setProcessing(circleId);
    const supabase = createClient();
    await supabase.from("circles").update({ status: "approved", reject_reason: null }).eq("id", circleId);
    setMsg("承認しました");
    await fetchCircles();
    setProcessing(null);
    setTimeout(() => setMsg(null), 2000);
  }

  async function handleReject(circleId: string) {
    const reason = rejectInput[circleId]?.trim();
    if (!reason) { setMsg("却下理由を入力してください"); return; }
    setProcessing(circleId);
    const supabase = createClient();
    await supabase.from("circles").update({ status: "rejected", reject_reason: reason }).eq("id", circleId);
    setMsg("却下しました");
    setRejectInput((prev) => { const n = { ...prev }; delete n[circleId]; return n; });
    await fetchCircles();
    setProcessing(null);
    setTimeout(() => setMsg(null), 2000);
  }

  // ── ログイン画面 ──────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream px-6">
        <form onSubmit={handleLogin} className="card p-8 w-full max-w-sm flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-pink flex items-center justify-center">
              <Lock size={18} className="text-white" />
            </div>
            <div>
              <p className="text-base font-bold text-charcoal">管理画面</p>
              <p className="text-xs text-muted">kyucommu admin</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">パスワード</label>
            <input
              type="password"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false); }}
              className={`w-full text-sm px-4 py-3 rounded-xl border bg-gray-50 outline-none transition-colors
                ${pwError ? "border-red-300 focus:border-red-400" : "border-gray-100 focus:border-kpink"}`}
              placeholder="パスワードを入力"
              autoFocus
            />
            {pwError && <p className="text-xs text-red-400 mt-1">パスワードが違います</p>}
          </div>

          <button
            type="submit"
            className="gradient-pink py-3 rounded-xl text-white font-semibold text-sm tap-scale"
          >
            ログイン
          </button>
        </form>
      </div>
    );
  }

  // ── 管理画面 ──────────────────────────────
  const filtered = circles.filter((c) => {
    if (tab === "pending") return !c.status || c.status === "pending";
    return c.status === tab;
  });

  const counts = {
    pending: circles.filter((c) => !c.status || c.status === "pending").length,
    approved: circles.filter((c) => c.status === "approved").length,
    rejected: circles.filter((c) => c.status === "rejected").length,
  };

  const TABS: { key: Tab; label: string; color: string }[] = [
    { key: "pending",  label: "審査中",   color: "text-amber-600" },
    { key: "approved", label: "承認済み", color: "text-green-600" },
    { key: "rejected", label: "却下",     color: "text-red-500"  },
  ];

  return (
    <div className="min-h-screen bg-cream pb-10">
      {/* ヘッダー */}
      <header className="bg-white border-b border-kpink/10 px-4 py-4 flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-xl text-charcoal">kyucommu<span className="text-kpink">.</span></p>
          <p className="text-xs text-muted">管理画面 — サークル審査</p>
        </div>
        {msg && (
          <span className="text-xs font-semibold bg-green-50 text-green-600 px-3 py-1.5 rounded-full">
            {msg}
          </span>
        )}
      </header>

      {/* タブ */}
      <div className="flex border-b border-gray-100 bg-white px-4">
        {TABS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors
              ${tab === key ? `border-kpink ${color}` : "border-transparent text-muted"}`}
          >
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold
              ${tab === key ? "bg-kpink-light text-kpink" : "bg-gray-100 text-muted"}`}>
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* リスト */}
      <main className="px-4 pt-4 flex flex-col gap-3 max-w-2xl mx-auto">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-kpink border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted text-sm py-10">該当するサークルはありません</p>
        )}

        {filtered.map((circle) => {
          const cat = CATEGORY_MAP[circle.category];
          const isOpen = expanded === circle.id;

          return (
            <div key={circle.id} className="card overflow-hidden">
              {/* サマリー行 */}
              <button
                onClick={() => setExpanded(isOpen ? null : circle.id)}
                className="w-full flex items-center gap-3 p-4 text-left tap-scale"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={{ background: cat.bg }}
                >
                  {circle.icon_url
                    ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
                    : circle.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-charcoal truncate">{circle.name}</p>
                  <p className="text-xs text-muted mt-0.5">{circle.created_at ? new Date(circle.created_at).toLocaleDateString("ja-JP") : "—"}</p>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold mt-1"
                    style={{ background: cat.bg, color: cat.text }}>
                    {cat.label}
                  </span>
                </div>
                {isOpen ? <ChevronUp size={16} className="text-muted flex-shrink-0" /> : <ChevronDown size={16} className="text-muted flex-shrink-0" />}
              </button>

              {/* 詳細展開 */}
              {isOpen && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 flex flex-col gap-3">
                  {/* スタッツ */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: Users, value: `${circle.member_count}人`, label: "部員数" },
                      { icon: DollarSign, value: formatFee(circle.monthly_fee), label: "月会費" },
                    ].map(({ icon: Icon, value, label }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-2.5 text-center">
                        <Icon size={13} className="mx-auto mb-1 text-muted" />
                        <p className="text-xs font-bold text-charcoal">{value}</p>
                        <p className="text-[9px] text-muted">{label}</p>
                      </div>
                    ))}
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-muted mb-1">活動頻度</p>
                      <p className="text-xs font-bold text-charcoal">{circle.frequency}</p>
                    </div>
                  </div>

                  {circle.location && (
                    <p className="flex items-center gap-1.5 text-xs text-muted">
                      <MapPin size={12} className="text-kpink" /> {circle.location}
                    </p>
                  )}

                  <p className="text-xs text-charcoal leading-relaxed bg-gray-50 rounded-xl p-3">
                    {circle.description}
                  </p>

                  {/* SNSリンク */}
                  {(circle.instagram_url || circle.twitter_url || circle.line_url) && (
                    <div className="flex flex-wrap gap-2">
                      {circle.instagram_url && (
                        <a href={circle.instagram_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-pink-50 text-pink-500 px-3 py-1.5 rounded-full">
                          <Instagram size={12} /> Instagram <ExternalLink size={10} />
                        </a>
                      )}
                      {circle.twitter_url && (
                        <a href={circle.twitter_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-500 px-3 py-1.5 rounded-full">
                          <Twitter size={12} /> Twitter <ExternalLink size={10} />
                        </a>
                      )}
                      {circle.line_url && (
                        <a href={circle.line_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full">
                          <MessageCircle size={12} /> LINE <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  )}

                  {/* 却下済みの場合：現在の理由を表示 */}
                  {circle.status === "rejected" && circle.reject_reason && (
                    <p className="text-xs text-red-400 bg-red-50 rounded-xl px-3 py-2">
                      却下理由: {circle.reject_reason}
                    </p>
                  )}

                  {/* アクション */}
                  {tab === "pending" && (
                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={() => handleApprove(circle.id)}
                        disabled={processing === circle.id}
                        className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-green-500 text-white text-sm font-semibold tap-scale disabled:opacity-50"
                      >
                        <CheckCircle size={15} />
                        {processing === circle.id ? "処理中..." : "承認する"}
                      </button>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="却下理由を入力..."
                          value={rejectInput[circle.id] ?? ""}
                          onChange={(e) => setRejectInput((p) => ({ ...p, [circle.id]: e.target.value }))}
                          className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:border-red-300"
                        />
                        <button
                          onClick={() => handleReject(circle.id)}
                          disabled={processing === circle.id}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold tap-scale disabled:opacity-50"
                        >
                          <XCircle size={13} />
                          却下
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 承認済みを却下に変更 / 却下を承認に変更 */}
                  {tab !== "pending" && (
                    <div className="flex gap-2 pt-1">
                      {tab === "rejected" && (
                        <button
                          onClick={() => handleApprove(circle.id)}
                          disabled={processing === circle.id}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold tap-scale"
                        >
                          <CheckCircle size={13} /> 承認に変更
                        </button>
                      )}
                      {tab === "approved" && (
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            placeholder="却下理由..."
                            value={rejectInput[circle.id] ?? ""}
                            onChange={(e) => setRejectInput((p) => ({ ...p, [circle.id]: e.target.value }))}
                            className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:border-red-300"
                          />
                          <button
                            onClick={() => handleReject(circle.id)}
                            disabled={processing === circle.id}
                            className="flex items-center gap-1 px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold tap-scale"
                          >
                            <XCircle size={13} /> 却下
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
}
