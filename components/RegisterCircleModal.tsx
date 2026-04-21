"use client";

import { useState, useRef } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { X, ChevronDown, Camera, MapPin } from "lucide-react";
import { Circle, Category } from "@/lib/types";
import { CATEGORY_MAP } from "@/lib/utils";
import MapPicker from "./MapPicker";

const CATEGORY_EMOJIS: Record<Category, string[]> = {
  tech:    ["💻", "🤖", "🔭", "🎮", "📡", "🛠️", "⚙️", "🔬"],
  sport:   ["⚽", "🏀", "🎾", "🏊", "🏃", "🥊", "🏐", "🎿"],
  culture: ["🎸", "📷", "🎨", "🎭", "📚", "🎬", "🎵", "✏️"],
};

const FREQUENCIES = ["週1回", "週2〜3回", "週4回以上", "月数回"];

interface Props {
  userId: string;
  onClose: () => void;
  onSuccess: (circle: Circle) => void;
}

export default function RegisterCircleModal({ userId, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<"form" | "done">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("tech");
  const [emoji, setEmoji] = useState("💻");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [frequency, setFrequency] = useState("週2〜3回");
  const [fee, setFee] = useState("0");
  const [memberCount, setMemberCount] = useState("10");
  const [beginnerOk, setBeginnerOk] = useState(true);
  const [description, setDescription] = useState("");
  const [locationPin, setLocationPin] = useState<{ x: number; y: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [lineUrl, setLineUrl] = useState("");
  const iconInputRef = useRef<HTMLInputElement>(null);

  function handleCategoryChange(cat: Category) {
    setCategory(cat);
    setEmoji(CATEGORY_EMOJIS[cat][0]);
  }

  function handleIconChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError("画像は5MB以下にしてください"); return; }
    setIconFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setIconPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      setError("サークル名・説明は必須です");
      return;
    }
    setLoading(true);
    setError("");

    let iconUrl: string | null = null;

    if (iconFile && supabaseConfigured) {
      const supabase = createClient();
      const ext = iconFile.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("circle-icons")
        .upload(path, iconFile, { upsert: true, contentType: iconFile.type });
      if (!uploadErr) {
        const { data } = supabase.storage.from("circle-icons").getPublicUrl(path);
        iconUrl = data.publicUrl;
      }
    }

    const newCircle = {
      name: name.trim(),
      emoji,
      category,
      frequency,
      monthly_fee: parseInt(fee) || 0,
      member_count: parseInt(memberCount) || 1,
      beginner_ok: beginnerOk,
      description: description.trim(),
      location: locationName.trim() || undefined,
      location_x: locationPin?.x ?? undefined,
      location_y: locationPin?.y ?? undefined,
      location_name: locationName.trim() || undefined,
      sns_url: instagramUrl.trim() || twitterUrl.trim() || lineUrl.trim() || undefined,
      icon_url: iconUrl ?? undefined,
      instagram_url: instagramUrl.trim() || undefined,
      twitter_url: twitterUrl.trim() || undefined,
      line_url: lineUrl.trim() || undefined,
      contact_handle: "",
      created_by: userId,
      status: "pending" as const,
    };

    if (!supabaseConfigured) {
      const demoCircle: Circle = { ...newCircle, id: `demo-${Date.now()}`, created_at: new Date().toISOString() };
      onSuccess(demoCircle);
      setStep("done");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: err } = await supabase.from("circles").insert(newCircle).select().single();

    if (err) {
      setError(`登録エラー: ${err.message}`);
      setLoading(false);
      return;
    }

    onSuccess(data as Circle);
    setStep("done");
    setLoading(false);
  }

  if (step === "done") {
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
        <div className="bg-white w-full max-w-md rounded-t-3xl p-8 text-center">
          {iconPreview
            ? <img src={iconPreview} alt="" className="w-16 h-16 rounded-full mx-auto object-cover mb-4" />
            : <div className="text-5xl mb-4">{emoji}</div>}
          <p className="text-lg font-bold text-charcoal mb-1">申請を送信しました！</p>
          <p className="text-sm text-muted mb-2">「{name}」の申請を受け付けました</p>
          <p className="text-xs text-muted bg-amber-50 px-4 py-2.5 rounded-xl mb-6">
            管理者が審査後、承認されると探す画面に表示されます
          </p>
          <button onClick={onClose} className="w-full py-3 rounded-xl text-white font-semibold gradient-pink tap-scale">
            閉じる
          </button>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_MAP[category];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 pb-[70px]">
      <div className="bg-white w-full max-w-md rounded-t-3xl flex flex-col" style={{ maxHeight: "calc(92vh - 70px)" }}>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0 relative">
          <div className="w-10 h-1 bg-gray-200 rounded-full absolute left-1/2 -translate-x-1/2 top-3" />
          <p className="text-base font-bold text-charcoal">サークルを登録する</p>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} className="text-muted" />
          </button>
        </div>

        <form id="register-circle-form" onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 pb-4 flex flex-col gap-5">

          {/* サークル名 */}
          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">サークル名 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="例：ロボット研究会" maxLength={30}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink" />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">カテゴリ *</label>
            <div className="flex gap-2">
              {(["tech", "sport", "culture"] as Category[]).map((c) => {
                const cm = CATEGORY_MAP[c];
                const active = category === c;
                return (
                  <button key={c} type="button" onClick={() => handleCategoryChange(c)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all"
                    style={{ background: active ? cm.bg : "white", color: active ? cm.text : "#9CA3AF", borderColor: active ? cm.text : "#E5E7EB" }}>
                    {cm.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* アイコン */}
          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">
              サークルアイコン <span className="text-muted/60 font-normal">（任意）</span>
            </label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => iconInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl overflow-hidden border-2 border-dashed border-kpink/30 hover:border-kpink flex-shrink-0"
                style={{ background: iconPreview ? "transparent" : cat.bg }}>
                {iconPreview
                  ? <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                  : <span>{emoji}</span>}
              </button>
              <div>
                <button type="button" onClick={() => iconInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full bg-kpink-light text-kpink tap-scale">
                  <Camera size={12} /> 画像をアップロード
                </button>
                <p className="text-[10px] text-muted mt-1">5MB以下・未設定は絵文字表示</p>
              </div>
            </div>
            <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
          </div>

          {/* 絵文字（画像未設定時） */}
          {!iconPreview && (
            <div>
              <label className="text-xs font-semibold text-muted mb-1.5 block">絵文字アイコン</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_EMOJIS[category].map((e) => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${emoji === e ? "border-kpink bg-kpink-light scale-110" : "border-gray-100 bg-gray-50"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 活動頻度 */}
          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">活動頻度 *</label>
            <div className="relative">
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)}
                className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink">
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            </div>
          </div>

          {/* 月会費・部員数 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted mb-1.5 block">月会費（円）</label>
              <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} min="0" placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink" />
              <p className="text-[10px] text-muted mt-0.5">0円は「無料」と表示</p>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-muted mb-1.5 block">部員数（人）</label>
              <input type="number" value={memberCount} onChange={(e) => setMemberCount(e.target.value)} min="1" placeholder="10"
                className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink" />
            </div>
          </div>

          {/* 初心者歓迎 */}
          <label className="flex items-center gap-3 bg-terra-light px-4 py-3 rounded-xl cursor-pointer">
            <input type="checkbox" checked={beginnerOk} onChange={(e) => setBeginnerOk(e.target.checked)} className="w-4 h-4 accent-terra" />
            <div>
              <p className="text-sm font-semibold text-terra">初心者歓迎</p>
              <p className="text-[10px] text-terra/70">未経験者でも参加できます</p>
            </div>
          </label>

          {/* 説明 */}
          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 block">サークルの説明 *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="どんな活動をしているか、どんな人に来てほしいかなど..." rows={4} maxLength={300}
              className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink resize-none" />
            <p className="text-[10px] text-muted text-right">{description.length}/300</p>
          </div>

          {/* 活動場所（マップ選択） */}
          <div>
            <label className="text-xs font-semibold text-muted mb-1.5 flex items-center gap-1.5 block">
              <MapPin size={12} className="text-kpink" />
              活動場所 <span className="text-muted/60 font-normal">（任意）</span>
            </label>
            <MapPicker value={locationPin} onChange={setLocationPin} />
            <input
              type="text"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="建物名・部屋番号（例：工学棟B棟103号室）"
              maxLength={50}
              className="mt-2 w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink"
            />
          </div>

          {/* SNS */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-muted block">
              連絡先SNS <span className="text-muted/60 font-normal">（任意）</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0">📸</span>
              <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="Instagram URL" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0">🐦</span>
              <input type="url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="Twitter / X URL" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0">💬</span>
              <input type="url" value={lineUrl} onChange={(e) => setLineUrl(e.target.value)}
                placeholder="LINEオープンチャット URL" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm focus:outline-none focus:border-kpink" />
            </div>
          </div>

          {error && <p className="text-xs text-red-400 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

        </form>

        {/* 固定フッター：ボトムナビと重ならない */}
        <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <button
            type="submit"
            form="register-circle-form"
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 gradient-pink shadow-pink tap-scale"
          >
            {loading
              ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <><span className="text-lg">{emoji}</span>申請する</>}
          </button>
        </div>
      </div>
    </div>
  );
}
