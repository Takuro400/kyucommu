"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Circle } from "@/lib/types";
import { CATEGORY_MAP, formatFee } from "@/lib/utils";
import {
  Lock, CheckCircle, XCircle, Users, DollarSign, MapPin,
  Instagram, Twitter, MessageCircle, ExternalLink, ChevronDown, ChevronUp, X,
} from "lucide-react";

type Tab = "pending" | "approved" | "rejected";

const QUICK_REASONS = [
  "情報が不足しています",
  "同名のサークルがすでに登録済みです",
  "活動実態が確認できません",
  "連絡先が記載されていません",
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);

  const [circles, setCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);

  // 却下モーダル
  const [rejectTarget, setRejectTarget] = useState<Circle | null>(null);
  const [rejectInput, setRejectInput] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }

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

  // 楽観的に status を更新
  function optimisticUpdate(id: string, patch: Partial<Circle>) {
    setCircles((prev) => prev.map((c) => c.id === id ? { ...c, ...patch } : c));
  }

  async function handleApprove(circle: Circle) {
    setProcessing(circle.id);
    optimisticUpdate(circle.id, { status: "approved", reject_reason: undefined });
    const supabase = createClient();
    await supabase.from("circles").update({ status: "approved", reject_reason: null }).eq("id", circle.id);
    setProcessing(null);
    showToast(`「${circle.name}」を承認しました`);
  }

  async function handleRejectConfirm() {
    if (!rejectTarget) return;
    const reason = rejectInput.trim();
    if (!reason) return;
    setProcessing(rejectTarget.id);
    const id = rejectTarget.id;
    const name = rejectTarget.name;
    optimisticUpdate(id, { status: "rejected", reject_reason: reason });
    setRejectTarget(null);
    setRejectInput("");
    const supabase = createClient();
    await supabase.from("circles").update({ status: "rejected", reject_reason: reason }).eq("id", id);
    setProcessing(null);
    showToast(`「${name}」を却下しました`);
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
                ${pwError ? "border-red-300" : "border-gray-100 focus:border-kpink"}`}
              placeholder="パスワードを入力"
              autoFocus
            />
            {pwError && <p className="text-xs text-red-400 mt-1">パスワードが違います</p>}
          </div>
          <button type="submit" className="gradient-pink py-3 rounded-xl text-white font-semibold text-sm tap-scale">
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
    pending:  circles.filter((c) => !c.status || c.status === "pending").length,
    approved: circles.filter((c) => c.status === "approved").length,
    rejected: circles.filter((c) => c.status === "rejected").length,
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "pending",  label: "審査中" },
    { key: "approved", label: "承認済み" },
    { key: "rejected", label: "却下" },
  ];

  const TAB_COLOR: Record<Tab, string> = {
    pending:  "text-amber-600 border-amber-400",
    approved: "text-green-600 border-green-400",
    rejected: "text-red-500 border-red-400",
  };

  return (
    <div className="min-h-screen bg-cream pb-10">
      {/* ヘッダー */}
      <header className="bg-white border-b border-kpink/10 px-4 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <p className="font-display font-bold text-xl text-charcoal">kyucommu<span className="text-kpink">.</span></p>
          <p className="text-xs text-muted">管理画面 — サークル審査</p>
        </div>
        {toast && (
          <span className="text-xs font-semibold bg-green-50 text-green-600 px-3 py-1.5 rounded-full animate-fade-in">
            {toast}
          </span>
        )}
      </header>

      {/* タブ */}
      <div className="flex border-b border-gray-100 bg-white px-4 sticky top-[61px] z-20">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-colors
              ${tab === key ? TAB_COLOR[key] : "border-transparent text-muted"}`}
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
          const busy = processing === circle.id;

          return (
            <div key={circle.id} className="card overflow-hidden">
              {/* メイン行：常時表示 */}
              <div className="flex items-center gap-3 p-3">
                {/* アイコン */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={{ background: cat.bg }}
                >
                  {circle.icon_url
                    ? <img src={circle.icon_url} alt={circle.name} className="w-full h-full object-cover" />
                    : circle.emoji}
                </div>

                {/* 名前・情報 */}
                <button
                  onClick={() => setExpanded(isOpen ? null : circle.id)}
                  className="flex-1 min-w-0 text-left"
                >
                  <p className="text-sm font-bold text-charcoal truncate">{circle.name}</p>
                  <p className="text-[11px] text-muted mt-0.5">
                    {circle.created_at ? new Date(circle.created_at).toLocaleDateString("ja-JP") : "—"}
                    　<span style={{ color: cat.text }}>{cat.label}</span>
                    {circle.beginner_ok && "　🌱初心者歓迎"}
                  </p>
                  {circle.status === "rejected" && circle.reject_reason && (
                    <p className="text-[10px] text-red-400 mt-0.5 truncate">却下理由: {circle.reject_reason}</p>
                  )}
                </button>

                {/* アクションボタン */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* 承認ボタン（審査中 or 却下済みに表示） */}
                  {(tab === "pending" || tab === "rejected") && (
                    <button
                      onClick={() => handleApprove(circle)}
                      disabled={busy}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-green-500 text-white text-xs font-semibold tap-scale disabled:opacity-40"
                    >
                      <CheckCircle size={13} />
                      承認
                    </button>
                  )}
                  {/* 却下ボタン（審査中 or 承認済みに表示） */}
                  {(tab === "pending" || tab === "approved") && (
                    <button
                      onClick={() => { setRejectTarget(circle); setRejectInput(""); }}
                      disabled={busy}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold tap-scale disabled:opacity-40"
                    >
                      <XCircle size={13} />
                      却下
                    </button>
                  )}
                  {/* 展開トグル */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : circle.id)}
                    className="p-2 rounded-xl bg-gray-100 text-muted tap-scale"
                  >
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* 詳細展開 */}
              {isOpen && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3 flex flex-col gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <Users size={12} className="mx-auto mb-1 text-muted" />
                      <p className="text-xs font-bold text-charcoal">{circle.member_count}人</p>
                      <p className="text-[9px] text-muted">部員数</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <DollarSign size={12} className="mx-auto mb-1 text-muted" />
                      <p className="text-xs font-bold text-charcoal">{formatFee(circle.monthly_fee)}</p>
                      <p className="text-[9px] text-muted">月会費</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-2.5 text-center">
                      <p className="text-[9px] text-muted mb-1">活動頻度</p>
                      <p className="text-xs font-bold text-charcoal">{circle.frequency}</p>
                    </div>
                  </div>

                  {circle.location && (
                    <p className="flex items-center gap-1.5 text-xs text-muted">
                      <MapPin size={11} className="text-kpink" /> {circle.location}
                    </p>
                  )}

                  <p className="text-xs text-charcoal leading-relaxed bg-gray-50 rounded-xl p-3">
                    {circle.description}
                  </p>

                  {(circle.instagram_url || circle.twitter_url || circle.line_url) && (
                    <div className="flex flex-wrap gap-2">
                      {circle.instagram_url && (
                        <a href={circle.instagram_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-pink-50 text-pink-500 px-3 py-1.5 rounded-full">
                          <Instagram size={11} /> Instagram <ExternalLink size={9} />
                        </a>
                      )}
                      {circle.twitter_url && (
                        <a href={circle.twitter_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-blue-50 text-blue-500 px-3 py-1.5 rounded-full">
                          <Twitter size={11} /> Twitter <ExternalLink size={9} />
                        </a>
                      )}
                      {circle.line_url && (
                        <a href={circle.line_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full">
                          <MessageCircle size={11} /> LINE <ExternalLink size={9} />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>

      {/* 却下モーダル */}
      {rejectTarget && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) { setRejectTarget(null); setRejectInput(""); } }}
        >
          <div className="bg-white w-full max-w-[430px] rounded-t-3xl p-5 pb-8 flex flex-col gap-4 scale-in">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-charcoal">却下理由を選択</p>
              <button onClick={() => { setRejectTarget(null); setRejectInput(""); }}
                className="p-1.5 rounded-full bg-gray-100 text-muted tap-scale">
                <X size={14} />
              </button>
            </div>

            <p className="text-xs text-muted -mt-2">「{rejectTarget.name}」を却下します</p>

            {/* クイック選択 */}
            <div className="flex flex-col gap-2">
              {QUICK_REASONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRejectInput(r)}
                  className={`text-left text-xs px-4 py-3 rounded-xl border transition-colors tap-scale
                    ${rejectInput === r
                      ? "border-red-400 bg-red-50 text-red-500 font-semibold"
                      : "border-gray-100 bg-gray-50 text-charcoal"}`}
                >
                  {r}
                </button>
              ))}
            </div>

            {/* カスタム入力 */}
            <input
              type="text"
              placeholder="その他の理由を入力..."
              value={rejectInput}
              onChange={(e) => setRejectInput(e.target.value)}
              className="text-sm px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 outline-none focus:border-red-300"
            />

            {/* 確定ボタン */}
            <button
              onClick={handleRejectConfirm}
              disabled={!rejectInput.trim()}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-500 text-white font-semibold text-sm tap-scale disabled:opacity-40"
            >
              <XCircle size={16} />
              却下を確定する
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
