# キューコミュ

九州工業大学のサークル・部活動マッチングプラットフォーム。

## セットアップ

### 1. リポジトリをクローン
```bash
git clone https://github.com/あなたのユーザー名/kyucommu.git
cd kyucommu
```

### 2. 依存パッケージをインストール
```bash
npm install
```

### 3. 環境変数を設定
```bash
cp .env.local.example .env.local
```
`.env.local` を開いて、Supabase の URL と Anon Key を入力してください。

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxxxx
```

### 4. Supabase のセットアップ

1. [supabase.com](https://supabase.com) で新規プロジェクトを作成
2. `supabase/schema.sql` の内容を **SQL Editor** に貼り付けて実行
3. URLとAnon Keyをコピーして `.env.local` に貼り付け

### 5. 開発サーバーを起動
```bash
npm run dev
```

http://localhost:3000 で確認できます。

## デプロイ（Vercel）

1. GitHub にプッシュ
2. [vercel.com](https://vercel.com) で新規プロジェクトとして import
3. Environment Variables に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
4. Deploy ボタンを押す

## 技術スタック

- **フレームワーク**: Next.js 14 (App Router)
- **スタイリング**: Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel

## 画面構成

| パス | 内容 |
|------|------|
| `/` | フィード（インスタ風タイムライン） |
| `/search` | サークル検索・カテゴリ絞り込み |
| `/calendar` | 新歓イベント月次カレンダー |
| `/circle/[id]` | サークル詳細ページ |
| `/mypage` | マイページ（ログイン機能は近日追加） |

## 今後追加予定の機能

- [ ] Supabase Auth によるログイン
- [ ] サークルの先輩からのメッセージ機能
- [ ] 画像アップロード（Supabase Storage）
- [ ] サークル登録フォーム（先輩向け）
- [ ] スカウト通知
