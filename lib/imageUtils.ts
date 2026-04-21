/**
 * 画像ファイルをCanvas経由でリサイズし、base64 JPEG文字列として返す。
 * Supabase Storageが使えない場合のフォールバック用。
 */
export function resizeImageToBase64(
  file: File,
  maxPx = 600,
  quality = 0.92
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const scale = Math.min(1, maxPx / img.width, maxPx / img.height);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0, w, h);

      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像の読み込みに失敗しました"));
    };

    img.src = url;
  });
}

/**
 * Supabase Storageへのアップロードを試み、失敗時はbase64にフォールバックする。
 * @returns { url, warn } url=保存先URL, warn=Storageが使えなかった場合の警告文
 */
export async function uploadIcon(
  file: File,
  supabase: ReturnType<typeof import("@supabase/supabase-js").createClient>,
  storagePath: string
): Promise<{ url: string; warn?: string }> {
  // Supabase Storage へアップロード試行
  const { error: uploadErr } = await supabase.storage
    .from("circle-icons")
    .upload(storagePath, file, { upsert: true, contentType: file.type });

  if (!uploadErr) {
    const { data } = supabase.storage
      .from("circle-icons")
      .getPublicUrl(storagePath);
    return { url: `${data.publicUrl}?t=${Date.now()}` };
  }

  // Storage が使えない場合 → 高画質 base64 にフォールバック
  const base64 = await resizeImageToBase64(file, 600, 0.92);
  return {
    url: base64,
    warn: "ストレージバケット未設定のため、圧縮画像で保存しました。Supabase Storageを設定すると原画質で保存できます。",
  };
}
