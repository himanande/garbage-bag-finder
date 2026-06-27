# 水野真紀の魔法のレストラン 紹介店検索 — 仕様書

最終更新: 2026-06-20
このファイルは本プロジェクトの正本ドキュメントです。今後の変更はこのファイルに追記・更新してください。

## 1. 概要

MBS（毎日放送）のテレビ番組「水野真紀の魔法のレストラン」で紹介された店舗を検索できるWebサイト。
番組公式サイト（mahou-contents.mbs.jp）から収集した店舗データ（2016年〜現在、2778件）を、都道府県・市区町村・ジャンル・キーワード・現在地から検索できる。

- 本番URL: https://mahoresu-search.com （2026-06-19取得・設定完了。`magic-restaurant-search.vercel.app`からもアクセス可）
- リポジトリ: https://github.com/himanande/magic-restaurant-search

## 2. システム構成図

```
┌─────────────────────────────────────────────────────────┐
│  ユーザーのブラウザ                                          │
│  - Next.js (App Router, クライアントコンポーネント)            │
│  - Geolocation API（現在地検索）                              │
│  - Leaflet（地図表示、OpenStreetMapタイル）                    │
└───────────────────────┬─────────────────────────────────┘
                         │ 静的ホスティング (Vercel)
┌───────────────────────┴─────────────────────────────────┐
│  Next.js アプリ（ビルド時に静的書き出し）                       │
│  src/data/restaurants.json … 全店舗データ（ビルドに同梱）       │
└─────────────────────────────────────────────────────────┘

【データ収集パイプライン（ビルド前・オフラインで実行、別ディレクトリ）】
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ MBS公式サイト       │ → │ scrape.py         │ → │ data/raw/*.html   │
│ mahou-contents.    │   │ (onairページ取得)   │   │ data/shops/*.json │
│ mbs.jp             │   └──────────────────┘   └──────────────────┘
└──────────────────┘                                      │
                                                            ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ 国土地理院         │ ← │ geocode.py         │ ← │ merge.py           │
│ ジオコーディングAPI │   │ (座標付与)          │   │ (draft-restaurants │
└──────────────────┘   └──────────────────┘   │  .json生成)         │
                                                 └──────────────────┘
                                                            │
                                                            ▼
                                          src/data/restaurants.json
                                          （アプリ側にコピーしてビルド）
```

## 3. ディレクトリ構成

本プロジェクトは**2つの独立したディレクトリ（別gitクローン、別ブランチ）**で構成される。今後の作業では両方の場所を意識すること。

### 3-1. アプリ本体（Next.js）
パス: `/home/ike3/work/ike3memo/magic-restaurant-search`
ブランチ: `main`（2026-06-19、PR #4にて`claude/magic-restaurant-data-update`からマージ済み。CISSP学習サービスは別ブランチ`claude/cissp-learning-service-gr4asr`に分離されており、`main`には含まれない）

```
magic-restaurant-search/
├── docs/
│   └── SPEC.md                      … 本ファイル
├── public/
│   └── leaflet/                     … Leafletマーカー画像
├── src/
│   ├── app/
│   │   ├── layout.tsx                … 全体レイアウト・メタデータ・OGP（metadataBaseはNEXT_PUBLIC_SITE_URLを参照）
│   │   ├── page.tsx                  … トップページ（RestaurantSearchを表示）
│   │   ├── globals.css               … Tailwind + Leaflet CSS読み込み
│   │   ├── robots.ts                 … robots.txt生成
│   │   ├── sitemap.ts                … sitemap.xml生成
│   │   ├── about/page.tsx            … 「このサイトについて」（免責事項・データ出典・著作権）
│   │   └── privacy/page.tsx          … プライバシーポリシー（AdSense・アフィリエイト記載含む）
│   ├── components/
│   │   ├── RestaurantSearch.tsx      … メイン検索UI（フィルタ・一覧・地図切替）
│   │   └── RestaurantMap.tsx         … Leaflet地図コンポーネント
│   └── data/
│       ├── restaurants.json          … 店舗データ本体（2778件、ビルドに同梱）
│       └── restaurants.ts            … 型定義 + JSONインポート + REGIONS/GENRES/PREFECTURES定数
├── package.json
├── next.config.ts                    … セキュリティヘッダー設定（X-Frame-Options等）
└── tsconfig.json
```

**注:** CISSP学習サービスは別ブランチ（`claude/cissp-learning-service-gr4asr`）に存在するが、本番（`main`）には含まれていない。同一Vercelプロジェクトを共有しているため、CISSPを将来公開する場合はVercelプロジェクトの分割を検討すること。

### 3-2. データ収集パイプライン（スクレイピング・整形スクリプト）
パス: `/home/ike3/work/ike3memo/app-dev/store-search/magic-restaurant-search`
ブランチ: `claude/magic-restaurant-scraping-nujto9`（⚠️ origin に未push、ローカル5コミット分先行。「9. 既知の課題」参照）

```
magic-restaurant-search/  (データ収集用クローン)
├── scrape.py              … MBS公式サイトからonairページ・店舗詳細ページを取得
├── merge.py                … raw HTML + shop JSON から draft-restaurants.json を生成
├── geocode.py               … 国土地理院APIで住所→緯度経度を付与
├── fix_location.py          … 都道府県名省略住所の補完（市区町村名から逆引き）
├── fix_broken.py             … 初回スクレイピング時の抽出バグを修正済みデータで上書き
├── fix_city_ward.py          … 政令指定都市（大阪市・京都市等）の区まで市区町村を再パース
└── data/
    ├── onair-urls.csv        … 放送日とonairページURLの対応表（444件、2016-04-13〜現在）
    ├── raw/*.html             … onairページの生HTML（360件）
    ├── shops/*.json           … 店舗詳細（店名・住所・電話番号等、2779件）
    ├── raw-shops/*.html       … （旧）初回収集時の店舗詳細HTML（673件、レガシー）
    ├── extracted/*.json       … （旧）初回収集時の中間データ（レガシー）
    └── draft-restaurants.json … 最終生成物（アプリ側 src/data/restaurants.json の元データ）
```

## 4. 主要コンポーネント

| コンポーネント | 役割 |
|---|---|
| `RestaurantSearch.tsx` | 検索条件（キーワード・都道府県・市区町村・ジャンル・現在地）の状態管理、フィルタリング、同名店舗のグルーピング（複数回登場の集約）、リスト/地図表示の切り替え |
| `RestaurantMap.tsx` | Leaflet地図表示。`lat`/`lng`が0の店舗は地図上で除外。マウント後に動的import（SSR回避） |
| `restaurants.ts` | `restaurants.json`を型付きでエクスポート。`REGIONS`・`GENRES`・`PREFECTURES`の選択肢定数を保持 |

### 主な機能
- キーワード検索（店名・都道府県・市区町村・住所・説明文を対象に部分一致）
- 都道府県 → 市区町村のカスケード式絞り込み（政令指定都市は区単位まで分割）
- ジャンル絞り込み（16種類、後述）
- 現在地検索（Geolocation API、半径1/3/5/10km、距離順ソート）
- 同一店舗の複数回登場をグルーピングして「N回登場」表示
- 各登場回の放送日・エピソードタイトルから公式サイトの放送回一覧ページへリンク
- 各登場回のオレンジ文字（企画タイトル）から、その回における店舗詳細ページ（`mahou-contents.mbs.jp/shops/{店舗UUID}`）へ直接リンク（リスト表示・マップ表示の両方に対応。同一店舗でも放送回ごとにUUIDが異なる点に注意）
- リスト表示 / 地図表示の切り替え

## 5. データスキーマ

DBは使用せず、ビルド時に静的JSONとして同梱する方式（`src/data/restaurants.json`）。

### Restaurant型（`src/data/restaurants.ts`）

| フィールド | 型 | 説明 |
|---|---|---|
| `id` | string | 店舗UUID（MBS公式サイトの店舗ページURLから取得） |
| `name` | string | 店名 |
| `genre` | string | ジャンル（`GENRES`定数のいずれか） |
| `region` | string | 地域（`REGIONS`定数のいずれか。現状ほぼ「関西」） |
| `prefecture` | string | 都道府県（`PREFECTURES`定数のいずれか、または「不明」） |
| `city` | string | 市区町村 |
| `address` | string | 住所（フリーテキスト） |
| `lat` / `lng` | number | 緯度・経度。ジオコーディング失敗時は`0` |
| `award` | string | 放送回の企画タイトル（≒`episodeTitle`と同義で表示に使用） |
| `broadcastDate` | string | 放送日（`YYYY-MM-DD`） |
| `description` | string | 一覧カード用の説明文 |
| `imageUrl?` | string | 店舗メニュー画像URL（MBS提供、storage.googleapis.com） |
| `episodeTitle?` | string | 放送回タイトル |
| `rankInfo?` | string | 番組内の企画・ランキング情報 |
| `nearStation?` | string | 最寄り駅 |
| `tel?` | string | 電話番号 |

**注意**: 同一店舗が複数の放送日に登場する場合、`restaurants.json`内では**店舗×放送日ごとに別レコード**として保持される（id+broadcastDateで一意）。UI側（`RestaurantSearch.tsx`）で店名をキーにグルーピングし、`appearances`配列にまとめて表示する。

### 選択肢定数

- `GENRES`（16種類）: うどん・そば / お好み焼き・粉もん / その他 / イタリアン / カレー / スイーツ・カフェ / スーパー・量販店 / パン・ベーカリー / フレンチ / ラーメン / 中華 / 和食・割烹 / 寿司・海鮮 / 居酒屋・バル / 洋食 / 焼肉
- `PREFECTURES`（19種類、件数降順）: 大阪府 / 京都府 / 兵庫県 / 東京都 / 奈良県 / 滋賀県 / 和歌山県 / 広島県 / 三重県 / 群馬県 / 沖縄県 / 高知県 / 神奈川県 / 岐阜県 / 千葉県 / 新潟県 / 愛知県 / 香川県 / 不明
- `REGIONS`: 関西 / 関東 / 中部 / 中国・四国 / 九州・沖縄 / 不明（現在UIでは未使用。データ上のみ保持）

### データ統計（2026-06-19時点）
- 総レコード数: 2778件（2016-04-13 〜 2026-06-10放送分）
- 座標取得済み: 2646件（95.2%）
- ジャンル「その他」: 148件（5.3%、店名からは業態判定不能なもの）
- 都道府県分布: 大阪府1907 / 京都府415 / 兵庫県247 / 不明95 / その他
- 大阪市・京都市は区単位まで分割済み（大阪市24区・京都市11区、fix_city_ward.pyで2248件補正）

## 6. 外部API・外部サービス一覧

本アプリ自体はAPIルートを持たない（完全静的）。ビルド前のデータ収集パイプラインが以下の外部サービスを利用する。

| サービス | 用途 | 利用箇所 | 認証 |
|---|---|---|---|
| `mahou-contents.mbs.jp` | 番組公式サイト。放送回ページ・店舗詳細ページのスクレイピング元 | `scrape.py` | 不要（公開ページ） |
| 国土地理院 地名検索API (`msearch.gsi.go.jp`) | 住所→緯度経度のジオコーディング | `geocode.py` | 不要（無料・無認証） |
| OpenStreetMapタイルサーバー | 地図タイル表示 | `RestaurantMap.tsx`（ブラウザから直接） | 不要 |
| ブラウザ Geolocation API | 現在地取得 | `RestaurantSearch.tsx` | ユーザー許可 |

### スクレイピング運用ルール
- リクエスト間隔: 1秒（連続アクセスでサイトに負荷をかけない）
- User-Agent: `Mozilla/5.0` を明示
- IPv4強制（`curl -4` / Python `socket.getaddrinfo`パッチ）— IPv6 Happy Eyeballsのフォールバック待ちで1リクエスト5秒以上かかる問題への対処

## 7. 環境変数一覧

| 変数名 | 必須 | 用途 | 未設定時のデフォルト |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | 任意 | OGP(`metadataBase`)・sitemap.xmlの絶対URL生成に使用 | コード上のデフォルトは`https://magic-restaurant-search.vercel.app`だが、Vercel本番環境では`https://mahoresu-search.com`を設定済み（2026-06-19〜） |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` | 任意 | Google AdSenseのパブリッシャーID。設定すると`/ads.txt`の内容生成と`layout.tsx`でのAdSenseスクリプト読み込みが有効化される | 本番環境に`ca-pub-1350132225353615`を設定済み（2026-06-19〜） |
| `NEXT_PUBLIC_VALUECOMMERCE_PID` | 任意 | バリューコマースLinkSwitchのサイト識別ID（vc_pid）。設定すると`layout.tsx`でLinkSwitchスクリプトが読み込まれ、提携済み広告主（食べログ等）へのリンクが自動的にアフィリエイトリンクへ変換される | 本番環境に`892641084`を設定済み（2026-06-19〜）。サイト審査完了待ちのためリンク変換は未稼働 |

独自ドメイン設定後は、Vercelの環境変数に `NEXT_PUBLIC_SITE_URL=https://<独自ドメイン>` を設定すること（**3-2のデプロイタスク参照**）。
AdSense審査通過後は `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` をVercelの環境変数に設定するだけで広告が有効化される（コード変更不要）。

Vercelプロジェクト: projectId `prj_L1KXWVzDW3R12xgrggJLTQmGthRU`（プロジェクト名は`cissp-master`だが本番ドメインは`magic-restaurant-search.vercel.app`。2026-06-19に本番デプロイ済み）。

## 8. 技術スタック

| 項目 | 内容 |
|---|---|
| フレームワーク | Next.js 15.5.19（App Router） |
| 言語 | TypeScript 5 |
| UIライブラリ | React 19.1.0 |
| スタイリング | Tailwind CSS 4 |
| 地図 | react-leaflet 5 / leaflet 1.9.4（OpenStreetMapタイル） |
| アイコン | lucide-react |
| ホスティング | Vercel |
| アクセス解析 | Vercel Analytics（`@vercel/analytics`、cookie不使用） |
| データ収集 | Python 3（標準ライブラリのみ、外部パッケージ不使用） |

## 9. 既知の課題・残タスク

### 9-1. 完了済み（2026-06-18〜19）
- データ収集・アプリ側のコミット、ブランチ分離（CISSPと分離）
- メタデータ修正（title/description/lang="ja"/OGP・Twitterカード）
- GitHubへpush・PR作成・`main`マージ・Vercel本番デプロイ（`magic-restaurant-search.vercel.app`で公開中）
- 免責事項ページ（`/about`）・プライバシーポリシーページ（`/privacy`）追加、フッターにリンク設置
- npm audit実施・安全な範囲で脆弱性修正（残る2件はNext.js内部postcssで実害なし、ダウングレードは不要と判断）
- セキュリティヘッダー追加（`next.config.ts`: X-Content-Type-Options / X-Frame-Options / Referrer-Policy / Permissions-Policy）
- robots.txt・sitemap.xml追加、`NEXT_PUBLIC_SITE_URL`環境変数で絶対URLを一元管理

### 9-2. 進行中・未着手（優先度順）
1. ✅ **独自ドメイン取得・設定**（`mahoresu-search.com`を2026-06-19取得。Vercelレジストラ経由・ネームサーバー自動設定。プロジェクトに紐付け、`NEXT_PUBLIC_SITE_URL`環境変数を更新し本番反映済み）
2. ✅ **週次データ更新の半自動化**（`.github/workflows/weekly-data-update.yml`を追加。木曜07:00 JSTに新着放送回を自動チェック→データ収集ブランチへ自動コミット→`main`へのPRを自動起票。**マージはユーザーが目視確認してから**。動作確認として2026-06-17放送分(20件)を実際に取得・統合済み）
3. ✅ **AdSense設置完了**（パブリッシャーID `ca-pub-1350132225353615` を`NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`環境変数に設定し本番反映済み。`/ads.txt`・広告スクリプトともに稼働中。2026-06-19完了）
4. ✅ **アフィリエイト実装**（バリューコマースLinkSwitchを導入。食べログ・ホットペッパーグルメへの外部リンクを各店舗カードに追加済み（PR #13）。バリューコマース審査承認・食べログ即時提携済み（2026-06-27）。`NEXT_PUBLIC_VALUECOMMERCE_PID=892641084` をVercel環境変数に設定し本番反映済み。LinkSwitchが有効化され、食べログリンクが自動的にアフィリエイトリンクへ変換される）
8. ✅ **アクセス解析（Vercel Analytics）**（`@vercel/analytics`を導入。cookieを使わない匿名集計のみのためプライバシーポリシーに追記。2026-06-20完了）
5. ✅ **OGP画像**（`src/app/opengraph-image.tsx`、next/ogのImageResponseで動的生成。2026-06-19完了）
6. **ジャンル「その他」残り148件（5.3%）**（同名店舗の一意特定不可・既存16ジャンルに当てはまらない業態が中心。これ以上の自動改善は限界）
7. ✅ **お問い合わせ手段の整備**（専用Xアカウント [@prgb8h](https://x.com/prgb8h) でのDM受付を`/about`に記載。2026-06-19完了）

### 9-3. 週次自動更新の仕組み（`.github/workflows/weekly-data-update.yml`）
1. `check_new_episodes.py`（データ収集リポジトリ）が前回記録日以降の水曜日をMBS公式サイトに対してチェック
2. 新着があれば `scrape.py` → `merge.py` → `geocode.py` → `fix_location.py` → `fix_city_ward.py` → `generate_app_json.py` を実行し、データ収集ブランチ（`claude/magic-restaurant-scraping-nujto9`）へ自動コミット・push
3. 生成されたアプリ用JSONを`main`に取り込むPRを自動作成（ブランチ名: `auto/weekly-data-update`）
4. **ユーザーがPRの内容（件数差分等）を確認してからマージ** → マージ後Vercelが自動で本番デプロイ
5. 新着がない週は何もしない（PRは作成されない）
6. 実行完了時（成功・失敗・スキップいずれも）Slackに通知（`SLACK_WEBHOOK_URL` シークレット経由、2026-06-27追加）

**注意**: スクレイピング実行前に `data/raw` / `data/shops` ディレクトリを自動作成するよう修正済み（2026-06-27、PR #17）。これらはgit管理外のため、CI環境では毎回作成が必要。

## 10. 運用メモ

- ローカル動作確認: アプリディレクトリで `npm run dev`（デフォルト3000番、競合時は3001等にフォールバック）
- ビルド確認: `npm run build`（型エラー・配列リテラルの複雑度エラーに注意。データはJSON importにしているため2778件規模でも問題なくビルド可能）
- データ再生成の流れ: データ収集ディレクトリで `scrape.py` → `merge.py` → `geocode.py` → 整形してJSON出力 → アプリ側 `src/data/restaurants.json` にコピー → `npm run build`で確認
