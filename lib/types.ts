export type Category = "tech" | "sport" | "culture";

export interface Circle {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  frequency: string;
  monthly_fee: number;
  beginner_ok: boolean;
  description: string;
  member_count: number;
  contact_handle: string;
  location?: string;
  sns_url?: string;
  icon_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  line_url?: string;
  created_by?: string;
  created_at: string;
  status?: "pending" | "approved" | "rejected";
  reject_reason?: string;
  location_x?: number;
  location_y?: number;
  location_name?: string;
  is_active?: boolean;
}

export interface Post {
  id: string;
  circle_id: string;
  image_emoji: string;
  caption: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  circle?: Circle;
}

export interface Event {
  id: string;
  circle_id: string | null;
  title: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  created_at: string;
  circle?: Circle;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

// キャンパス上の場所
export interface CampusLocation {
  id: string;
  name: string;          // 建物・場所の名前
  lat: number;
  lng: number;
  circles: string[];     // ここを使うサークルのID一覧
  type: "building" | "court" | "hall" | "ground" | "other";
}
