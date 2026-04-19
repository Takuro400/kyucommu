import BottomNav from "@/components/BottomNav";
import MyPageClient from "@/components/MyPageClient";

export default function MyPage() {
  return (
    <div className="pb-20">
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40 px-4 py-3">
        <p className="text-lg font-bold text-gray-900">マイページ</p>
      </header>
      <MyPageClient />
      <BottomNav />
    </div>
  );
}
