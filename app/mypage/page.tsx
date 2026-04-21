import BottomNav from "@/components/BottomNav";
import MyPageClient from "@/components/MyPageClient";

export default function MyPage() {
  return (
    <div className="pb-24 bg-cream min-h-screen">
      <header className="sticky top-0 bg-white/85 backdrop-blur-xl border-b border-kpink/10 z-40 px-4 pt-12 pb-3">
        <p className="text-lg font-bold text-charcoal">マイページ</p>
      </header>
      <MyPageClient />
      <BottomNav />
    </div>
  );
}
