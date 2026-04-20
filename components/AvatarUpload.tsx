"use client";

import { useRef, useState } from "react";
import { createClient, supabaseConfigured } from "@/lib/supabase";
import { Camera } from "lucide-react";

interface Props {
  userId: string;
  avatarUrl: string | null;
  onUpload: (url: string) => void;
}

export default function AvatarUpload({ userId, avatarUrl, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      alert("5MB以下の画像を選択してください");
      return;
    }

    setUploading(true);

    if (!supabaseConfigured) {
      // デモモード: FileReaderでローカル表示
      const reader = new FileReader();
      reader.onload = (ev) => {
        onUpload(ev.target?.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
      return;
    }

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/avatar.${ext}`;

      // Storageにアップロード（上書き）
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) {
        alert(`アップロードエラー: ${uploadError.message}`);
        setUploading(false);
        return;
      }

      // 公開URLを取得
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      // profilesテーブルを更新
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", userId);

      onUpload(publicUrl);
    } catch (err) {
      alert("アップロードに失敗しました");
      console.error(err);
    } finally {
      setUploading(false);
      // inputをリセット（同じファイルを再選択できるように）
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="relative flex-shrink-0">
      {/* アバター表示 */}
      <div
        className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center text-2xl"
        style={{ background: "#E6F1FB" }}
      >
        {uploading ? (
          <div className="w-6 h-6 rounded-full border-2 border-[#185FA5] border-t-transparent animate-spin" />
        ) : avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          "🎓"
        )}
      </div>

      {/* カメラアイコンオーバーレイ */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#185FA5] flex items-center justify-center shadow-md active:opacity-80"
      >
        <Camera size={12} color="white" />
      </button>

      {/* 非表示のファイル入力 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
