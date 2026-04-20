"use client";

import { useState, useRef } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { X, ChevronDown, Camera } from "lucide-react";
import { Circle, Category } from "@/lib/types";
import { CATEGORY_MAP } from "@/lib/utils";

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
  const [location, setLocation] = useState("");
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
      location: location.trim(),
      sns_url: instagramUrl.trim() || twitterUrl.trim() || lineUrl.trim() || undefined,
      icon_url: iconUrl ?? undefined,
      instagram_url: instagramUrl.trim() || undefined,
      twitter_url: twitterUrl.trim() || undefined,
      line_url: lineUrl.trim() || undefined,
      contact_handle: "",
      created_by: userId,
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
          <p className="text-lg font-bold text-gray-900 mb-1">登録完了！</p>
          <p className="text-sm text-gray-400 mb-6">「{name}」を登録しました</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl text-white font-semibold" style={{ background: "#185FA5" }}>
            閉じる
          </button>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_MAP[category];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="w-10 h-1 bg-gray-200 rounded-full absolute left-1/2 -translate-x-1/2 top-3" />
          <p className="text-base font-bold text-gray-900">サークルを登録する</p>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-5 pb-6 flex flex-col gap-5">

          {/* サークル名 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">サークル名 *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="例：ロボット研究会" maxLength={30}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">カテゴリ *</label>
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
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              サークルアイコン <span className="text-gray-400 font-normal">（任意）</span>
            </label>
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => iconInputRef.current?.click()}
                className="w-16 h-16 rounded-full flex items-center justify-center text-3xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-[#185FA5] flex-shrink-0"
                style={{ background: iconPreview ? "transparent" : cat.bg }}>
                {iconPreview
                  ? <img src={iconPreview} alt="" className="w-full h-full object-cover" />
                  : <span>{emoji}</span>}
              </button>
              <div>
                <button type="button" onClick={() => iconInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-full"
                  style={{ background: "#E6F1FB", color: "#185FA5" }}>
                  <Camera size={12} /> 画像をアップロード
                </button>
                <p className="text-[10px] text-gray-400 mt-1">5MB以下・未設定は絵文字表示</p>
              </div>
            </div>
            <input ref={iconInputRef} type="file" accept="image/*" className="hidden" onChange={handleIconChange} />
          </div>

          {/* 絵文字（画像未設定時） */}
          {!iconPreview && (
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">絵文字アイコン</label>
              <div className="flex gap-2 flex-wrap">
                {CATEGORY_EMOJIS[category].map((e) => (
                  <button key={e} type="button" onClick={() => setEmoji(e)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${emoji === e ? "border-[#185FA5] bg-blue-50 scale-110" : "border-gray-100 bg-gray-50"}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 活動頻度 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">活動頻度 *</label>
            <div className="relative">
              <select value={frequency} onChange={(e) => setFrequency(e.target.value)}
                className="w-full appearance-none px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5] bg-white">
                {FREQUENCIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* 月会費・部員数 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">月会費（円）</label>
              <input type="number" value={fee} onChange={(e) => setFee(e.target.value)} min="0" placeholder="0"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
              <p className="text-[10px] text-gray-400 mt-0.5">0円は「無料」と表示</p>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">部員数（人）</label>
              <input type="number" value={memberCount} onChange={(e) => setMemberCount(e.target.value)} min="1" placeholder="10"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
            </div>
          </div>

          {/* 初心者歓迎 */}
          <label className="flex items-center gap-3 bg-amber-50 px-4 py-3 rounded-xl cursor-pointer">
            <input type="checkbox" checked={beginnerOk} onChange={(e) => setBeginnerOk(e.target.checked)} className="w-4 h-4 accent-amber-500" />
            <div>
              <p className="text-sm font-medium text-amber-800">初心者歓迎</p>
              <p className="text-[10px] text-amber-600">未経験者でも参加できます</p>
            </div>
          </label>

          {/* 説明 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">サークルの説明 *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="どんな活動をしているか、どんな人に来てほしいかなど..." rows={4} maxLength={300}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5] resize-none" />
            <p className="text-[10px] text-gray-400 text-right">{description.length}/300</p>
          </div>

          {/* 活動場所 */}
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
              活動場所 <span className="text-gray-400 font-normal">（任意）</span>
            </label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="例：工学棟B棟103号室" maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
          </div>

          {/* SNS */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-gray-600 block">
              連絡先SNS <span className="text-gray-400 font-normal">（任意）</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0">📸</span>
              <input type="url" value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="Instagram URL" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0">🐦</span>
              <input type="url" value={twitterUrl} onChange={(e) => setTwitterUrl(e.target.value)}
                placeholder="Twitter / X URL" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg flex-shrink-0">💬</span>
              <input type="url" value={lineUrl} onChange={(e) => setLineUrl(e.target.value)}
                placeholder="LINEオープンチャット URL" className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#185FA5]" />
            </div>
          </div>

          {error && <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "#185FA5" }}>
            {loading
              ? <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              : <><span className="text-lg">{emoji}</span>登録する</>}
          </button>
        </form>
      </div>
    </div>
  );
}
