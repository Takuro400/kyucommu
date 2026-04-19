import { Bell } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import StoryBar from "@/components/StoryBar";
import PostCard from "@/components/PostCard";
import { MOCK_CIRCLES, MOCK_POSTS } from "@/lib/mockData";

export default function HomePage() {
  const postsWithCircle = MOCK_POSTS.map((p) => ({
    post: p,
    circle: MOCK_CIRCLES.find((c) => c.id === p.circle_id)!,
  })).filter((x) => x.circle);

  return (
    <div className="pb-20">
      {/* トップバー */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-lg font-bold text-gray-900">キューコミュ</p>
          <p className="text-[10px] text-gray-400">九工大サークル・部活マッチング</p>
        </div>
        <button className="relative p-2">
          <Bell size={22} strokeWidth={1.8} className="text-gray-700" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold">
            2
          </span>
        </button>
      </header>

      {/* ストーリーバー */}
      <StoryBar circles={MOCK_CIRCLES} />

      {/* フィード */}
      <main>
        {postsWithCircle.map(({ post, circle }) => (
          <PostCard key={post.id} post={post} circle={circle} />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
