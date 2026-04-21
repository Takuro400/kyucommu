/**
 * 画像ファイルをCanvas経由でリサイズし、base64 JPEG文字列として返す。
 * Supabase Storageなしでアイコンを保存できる。
 * @param file     元の画像ファイル
 * @param maxPx    長辺の最大ピクセル数（デフォルト 300px）
 * @param quality  JPEG品質 0〜1（デフォルト 0.82）
 */
export function resizeImageToBase64(
  file: File,
  maxPx = 300,
  quality = 0.82
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
