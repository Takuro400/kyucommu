import { Circle, Post, Event, CampusLocation } from "./types";

export const MOCK_CIRCLES: Circle[] = [
  {
    id: "1", name: "ロボット研究会", emoji: "🤖", category: "tech",
    frequency: "週2〜3回", monthly_fee: 1000, beginner_ok: true,
    description: "九工大の技術を活かしてロボットを自作！競技大会にも出場。プログラミング未経験でも大歓迎。",
    member_count: 28, contact_handle: "robotics_kyutech", created_at: "",
  },
  {
    id: "2", name: "バスケットボール部", emoji: "🏀", category: "sport",
    frequency: "週4回以上", monthly_fee: 2000, beginner_ok: false,
    description: "真剣に上手くなりたい人大歓迎。練習は週4回。インカレも目指してます！",
    member_count: 35, contact_handle: "basketball_kyutech", created_at: "",
  },
  {
    id: "3", name: "軽音楽部", emoji: "🎸", category: "culture",
    frequency: "週2〜3回", monthly_fee: 500, beginner_ok: true,
    description: "バンドを組んで学祭や文化祭で演奏！楽器初心者でも月1のレッスン付きでOK。",
    member_count: 22, contact_handle: "keion_kyutech", created_at: "",
  },
  {
    id: "4", name: "写真部", emoji: "📷", category: "culture",
    frequency: "月数回", monthly_fee: 300, beginner_ok: true,
    description: "風景・ポートレート・街撮りなど自由に撮影。年2回の写真展に向けて活動中。",
    member_count: 15, contact_handle: "photo_kyutech", created_at: "",
  },
  {
    id: "5", name: "プログラミングサークル", emoji: "💻", category: "tech",
    frequency: "週1回", monthly_fee: 0, beginner_ok: true,
    description: "競技プログラミング・Webアプリ開発・AI研究など。完全初心者から上級者まで。無料！",
    member_count: 40, contact_handle: "prog_kyutech", created_at: "",
  },
  {
    id: "6", name: "テニスサークル", emoji: "🎾", category: "sport",
    frequency: "週2〜3回", monthly_fee: 800, beginner_ok: true,
    description: "男女問わず楽しめる雰囲気重視のサークル。試合よりも仲良く楽しくがモットー。",
    member_count: 30, contact_handle: "tennis_kyutech", created_at: "",
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: "p1", circle_id: "3", image_emoji: "🎸",
    caption: "昨日の練習風景🎶 新曲「夜に駆ける」のアレンジが完成しました！4月の新歓ライブで演奏予定なので聞きに来てね🙌",
    tags: ["#軽音楽部", "#新歓2025"], like_count: 47, comment_count: 8,
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "p2", circle_id: "5", image_emoji: "💻",
    caption: "先週のLeetCodeコンテスト、チームで初の全完達成🔥 入部したばかりのメンバーも大活躍でした！次回は4/21（月）に説明会やるよ〜",
    tags: ["#プログラミング", "#競プロ"], like_count: 83, comment_count: 14,
    created_at: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: "p3", circle_id: "1", image_emoji: "🤖",
    caption: "ロボコン2025の準備が本格化してきました⚙️ 今年のテーマは「協調制御」。一緒に作ってくれる仲間を募集中！プログラム未経験でも全然OK",
    tags: ["#ロボット研究会", "#初心者歓迎"], like_count: 61, comment_count: 6,
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: "p4", circle_id: "6", image_emoji: "🎾",
    caption: "春の青空の下でテニス日和☀️ 新入生の体験参加もOK！ラケット貸し出しあるよ。毎週火・木・土開催中🎾",
    tags: ["#テニス", "#体験歓迎"], like_count: 39, comment_count: 5,
    created_at: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: "p5", circle_id: "4", image_emoji: "📷",
    caption: "先輩が撮ってくれたポートレート写真📸 カメラ初心者でも上達できる環境が整ってます。機材の貸し出しもあるよ！",
    tags: ["#写真部", "#カメラ初心者OK"], like_count: 72, comment_count: 11,
    created_at: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
];

export const MOCK_EVENTS: Event[] = [
  { id: "e1", circle_id: "1", title: "ロボット研究会 体験入部", event_date: "2026-04-18", start_time: "17:00", end_time: "19:00", location: "工学棟B103", created_at: "" },
  { id: "e2", circle_id: "3", title: "軽音楽部 新歓ライブ", event_date: "2026-04-19", start_time: "13:00", end_time: "15:00", location: "学生会館ホール", created_at: "" },
  { id: "e3", circle_id: "5", title: "プログラミングサークル 説明会", event_date: "2026-04-21", start_time: "18:00", end_time: "19:30", location: "情報棟401", created_at: "" },
  { id: "e4", circle_id: "6", title: "テニスサークル 無料体験", event_date: "2026-04-22", start_time: "16:00", end_time: "18:00", location: "テニスコート", created_at: "" },
  { id: "e5", circle_id: "4", title: "写真部 新歓撮影会", event_date: "2026-04-24", start_time: "14:00", end_time: "17:00", location: "キャンパス内", created_at: "" },
  { id: "e6", circle_id: "2", title: "バスケ部 練習見学会", event_date: "2026-04-26", start_time: "15:00", end_time: "17:00", location: "体育館", created_at: "" },
  { id: "e7", circle_id: null, title: "合同新歓BBQ", event_date: "2026-05-05", start_time: "11:00", end_time: "15:00", location: "グラウンド横広場", created_at: "" },
];

// 九工大 戸畑キャンパス の各活動場所
// キャンパス: 北九州市戸畑区仙水町1-1
// マップで確認した実座標 (OpenStreetMap基準)
export const CAMPUS_LOCATIONS: CampusLocation[] = [
  {
    id: "loc1",
    name: "工学棟B棟",
    lat: 33.8893,
    lng: 130.8393,
    circles: ["1"],   // ロボット研究会
    type: "building",
  },
  {
    id: "loc2",
    name: "学生会館",
    lat: 33.8903,
    lng: 130.8408,
    circles: ["3"],   // 軽音楽部
    type: "hall",
  },
  {
    id: "loc3",
    name: "情報棟",
    lat: 33.8896,
    lng: 130.8400,
    circles: ["5"],   // プログラミングサークル
    type: "building",
  },
  {
    id: "loc4",
    name: "テニスコート",
    lat: 33.8882,
    lng: 130.8413,
    circles: ["6"],   // テニスサークル
    type: "court",
  },
  {
    id: "loc5",
    name: "体育館（GYMLABO）",
    lat: 33.8908,
    lng: 130.8385,
    circles: ["2"],   // バスケットボール部
    type: "building",
  },
  {
    id: "loc6",
    name: "グラウンド",
    lat: 33.8887,
    lng: 130.8407,
    circles: [],      // 合同イベント等
    type: "ground",
  },
  {
    id: "loc7",
    name: "正門・キャンパス全域",
    lat: 33.8892,
    lng: 130.8398,
    circles: ["4"],   // 写真部（キャンパス全体を使う）
    type: "other",
  },
];
