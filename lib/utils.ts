import { Category } from "./types";

export const CATEGORY_MAP: Record<Category, { label: string; bg: string; text: string; emoji: string }> = {
  tech:    { label: "技術系",  bg: "#E6F1FB", text: "#0C447C", emoji: "💻" },
  sport:   { label: "体育系",  bg: "#E1F5EE", text: "#085041", emoji: "⚽" },
  culture: { label: "文化系",  bg: "#EEEDFE", text: "#3C3489", emoji: "🎨" },
};

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}分前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}時間前`;
  return `${Math.floor(h / 24)}日前`;
}

export function formatFee(fee: number): string {
  return fee === 0 ? "無料" : `月¥${fee.toLocaleString()}`;
}
