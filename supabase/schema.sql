-- キューコミュ データベーススキーマ
-- Supabase SQL Editor で実行してください

-- サークル・部活テーブル
create table if not exists circles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  emoji text not null default '🎯',
  category text not null check (category in ('tech', 'sport', 'culture')),
  frequency text not null,
  monthly_fee integer not null default 0,
  beginner_ok boolean not null default true,
  description text not null,
  member_count integer not null default 0,
  contact_handle text not null default '',
  created_at timestamptz default now()
);

-- 投稿テーブル
create table if not exists posts (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references circles(id) on delete cascade,
  image_emoji text not null default '📸',
  caption text not null,
  tags text[] not null default '{}',
  like_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz default now()
);

-- イベントテーブル
create table if not exists events (
  id uuid default gen_random_uuid() primary key,
  circle_id uuid references circles(id) on delete set null,
  title text not null,
  event_date date not null,
  start_time time not null,
  end_time time not null,
  location text not null,
  created_at timestamptz default now()
);

-- いいねテーブル
create table if not exists likes (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references posts(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz default now(),
  unique(post_id, user_id)
);

-- RLS（Row Level Security）有効化
alter table circles enable row level security;
alter table posts enable row level security;
alter table events enable row level security;
alter table likes enable row level security;

-- 全員が読める
create policy "circles_read" on circles for select using (true);
create policy "posts_read" on posts for select using (true);
create policy "events_read" on events for select using (true);
create policy "likes_read" on likes for select using (true);

-- 認証ユーザーが書ける（サークル登録・投稿・いいね）
create policy "circles_insert" on circles for insert with check (true);
create policy "posts_insert" on posts for insert with check (true);
create policy "events_insert" on events for insert with check (true);
create policy "likes_insert" on likes for insert with check (true);
create policy "likes_delete" on likes for delete using (true);

-- プロフィールテーブル（表示名）
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  display_name text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
create policy "profiles_read"   on profiles for select using (true);
create policy "profiles_insert" on profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update" on profiles for update using (auth.uid() = user_id);

-- サンプルデータ投入
insert into circles (name, emoji, category, frequency, monthly_fee, beginner_ok, description, member_count, contact_handle) values
  ('ロボット研究会', '🤖', 'tech', '週2〜3回', 1000, true, '九工大の技術を活かしてロボットを自作！競技大会にも出場。プログラミング未経験でも大歓迎。', 28, 'robotics_kyutech'),
  ('バスケットボール部', '🏀', 'sport', '週4回以上', 2000, false, '真剣に上手くなりたい人大歓迎。練習は週4回。インカレも目指してます！', 35, 'basketball_kyutech'),
  ('軽音楽部', '🎸', 'culture', '週2〜3回', 500, true, 'バンドを組んで学祭や文化祭で演奏！楽器初心者でも月1のレッスン付きでOK。', 22, 'keion_kyutech'),
  ('写真部', '📷', 'culture', '月数回', 300, true, '風景・ポートレート・街撮りなど自由に撮影。年2回の写真展に向けて活動中。', 15, 'photo_kyutech'),
  ('プログラミングサークル', '💻', 'tech', '週1回', 0, true, '競技プログラミング・Webアプリ開発・AI研究など。完全初心者から上級者まで。無料！', 40, 'prog_kyutech'),
  ('テニスサークル', '🎾', 'sport', '週2〜3回', 800, true, '男女問わず楽しめる雰囲気重視のサークル。試合よりも仲良く楽しくがモットー。', 30, 'tennis_kyutech');

